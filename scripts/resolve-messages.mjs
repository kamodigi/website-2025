// messages/{locale}.json（翻訳の原本）に、フォールバックの順で足りない文言を埋めて
// project.inlang/resolved-messages/{locale}.json に書き出す。paraglide はこちらを読む。
// paraglide 自身のフォールバックは「ない言語 → 基準の言語（ja）」の 1 段だけなので、
// zh-Hant → zh-Hans → en → ja の順にするためにここで埋める。
// vite.config.ts から呼ぶほか、`node scripts/resolve-messages.mjs` でも動く。
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALE_FALLBACKS } from '../src/lib/i18n/fallback.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const SOURCE_DIR = join(root, 'messages');
const OUT_DIR = join(root, 'project.inlang', 'resolved-messages');

/** @param {string} locale */
function readMessages(locale) {
	const file = join(SOURCE_DIR, `${locale}.json`);
	if (!existsSync(file)) return {};
	const messages = JSON.parse(readFileSync(file, 'utf8'));
	delete messages.$schema;
	return messages;
}

export function resolveMessages() {
	const { locales } = JSON.parse(readFileSync(join(root, 'project.inlang', 'settings.json'), 'utf8'));
	mkdirSync(OUT_DIR, { recursive: true });
	for (const locale of locales) {
		const chain = LOCALE_FALLBACKS[locale];
		if (!chain) throw new Error(`LOCALE_FALLBACKS に ${locale} がない（src/lib/i18n/fallback.js）`);
		// 後ろ（基準の言語）から順に上書きする
		const merged = Object.assign({}, ...[...chain].reverse().map(readMessages));
		const content = JSON.stringify({ $schema: 'https://inlang.com/schema/inlang-message-format', ...merged }, null, '\t') + '\n';
		const out = join(OUT_DIR, `${locale}.json`);
		// 変わっていなければ書かない（paraglide の再コンパイルを無駄に起こさない）
		if (existsSync(out) && readFileSync(out, 'utf8') === content) continue;
		writeFileSync(out, content);
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) resolveMessages();
