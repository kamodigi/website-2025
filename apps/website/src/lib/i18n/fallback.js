// 翻訳がないときに代わりに使う言語の順番。サイト全体（paraglide の文言、WORKS の frontmatter と本文）で共通。
// 最後は必ず基準の言語（ja）にする。言語を足すときは project.inlang/settings.json と合わせてここにも足す
/** @type {Record<string, string[]>} */
export const LOCALE_FALLBACKS = {
	ja: ['ja'],
	en: ['en', 'ja'],
	'zh-Hans': ['zh-Hans', 'en', 'ja'],
	'zh-Hant': ['zh-Hant', 'zh-Hans', 'en', 'ja']
};
