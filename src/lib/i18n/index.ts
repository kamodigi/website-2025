import { base } from '$app/paths';
import { getLocale, localizeHref, type Locale } from '$lib/paraglide/runtime';
import { LOCALE_FALLBACKS } from './fallback.js';

/** 言語ごとの値。基準の言語（ja）だけは必須 */
export type Localized<T = string> = { ja: T } & Partial<Record<Exclude<Locale, 'ja'>, T>>;

/** 言語の切り替えに出す表示名（各言語での自称） */
export const LOCALE_LABELS: Record<Locale, string> = {
	ja: '日本語',
	en: 'English',
	'zh-Hans': '简体中文',
	'zh-Hant': '繁體中文'
};

/** フォールバックの順（自分自身を含む）。src/lib/i18n/fallback.js が原本 */
export function fallbackChain(locale: Locale): Locale[] {
	return (LOCALE_FALLBACKS[locale] ?? [locale, 'ja']) as Locale[];
}

/**
 * フォールバックの順で、値がある最初の言語の値を返す。
 * `locale` は実際に表示する言語（`lang` 属性に使う）。
 */
export function pickLocalized<T>(values: Localized<T>, locale: Locale): { value: T; locale: Locale } {
	for (const candidate of fallbackChain(locale)) {
		const value = values[candidate as keyof Localized<T>];
		if (value !== undefined && value !== null && value !== '') return { value: value as T, locale: candidate };
	}
	return { value: values.ja, locale: 'ja' };
}

/** `pickLocalized` の値だけを返す */
export function localized<T>(values: Localized<T>, locale: Locale): T {
	return pickLocalized(values, locale).value;
}

/**
 * そのページの、指定した言語のパス。paraglide の localizeHref はトップを `/en/` のように末尾の / 付きで返すので、
 * ほかのページ（`/en/works`）とそろえて末尾の / を取る（日本語のトップの `/` はそのまま）
 */
export function localizedPath(path: string, locale: Locale): string {
	return localizeHref(path, { locale }).replace(/(.)\/$/, '$1');
}

/**
 * サイト内のリンク先。パスを今の言語の URL にする（`/works` → `/en/works`）。
 * `<a href={localeHref('/works')}>` のように使う。
 *
 * `resolve()` は使わない。@sveltejs/kit 2.x の `resolve()` は prerender 中に相対パス（`../works`）を返し
 * （`paths.relative` が既定の true のとき）、localizeHref がそれを `http://sveltekit-prerender/...` の
 * 絶対 URL にしてしまうため、`base` + パスの絶対パスを渡している。
 *
 * 前提: `paths.base` は空（svelte.config.js に設定なし）。`base` を設定すると localizeHref が
 * `/en/base/works` のように接頭辞の位置を誤るので、使う場合は base を外してから localize し、前に付け直すこと
 * （LanguageSwitcher も同じ前提）
 */
export function localeHref(path: `/${string}`): string {
	const href = localizedPath(`${base}${path}`, getLocale());
	// prerender 中は origin（http://sveltekit-prerender）つきで返ってくることがあるので、パスだけにする
	if (!/^https?:\/\//.test(href)) return href;
	const url = new URL(href);
	return url.pathname + url.search + url.hash;
}

/**
 * Markdown から作った HTML の、サイト内リンク（`href="/works/ori"` のように / で始まるもの）を、
 * 表示する言語の URL にする。Markdown には言語を書かずに済む。`//` 始まり（外部）は変えない。
 * ja は接頭辞がないので変わらない。localeHref と同じく `paths.base` は空である前提。
 * `href` がダブルクォートで書かれている前提（rehype-stringify の出力はそうなる）。
 * シングルクォートや引用符なしの `href` は書き換えない
 */
export function localizeHtmlLinks(html: string, locale: Locale): string {
	return html.replace(/(<a\s[^>]*?href=")(\/(?!\/)[^"]*)(")/g, (_, head: string, path: string, tail: string) => {
		// 最初の ? か # から後ろ（?a=1#h のように両方あっても）は、そのまま残す
		const cut = path.search(/[?#]/);
		const [pathname, rest] = cut === -1 ? [path, ''] : [path.slice(0, cut), path.slice(cut)];
		return `${head}${localizedPath(`${base}${pathname}`, locale)}${rest}${tail}`;
	});
}
