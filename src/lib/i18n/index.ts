import type { Locale } from '$lib/paraglide/runtime';
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
