// 手元の開発用の PocketBase（apps/pocketbase/compose.yaml）に、見本の制作実績を入れる。開発とテスト専用。
// 開発用のアカウント（editor@example.com / password1234）でログインして、media と works を作る。
// 同じスラッグのレコードがあれば飛ばす。画像は static/works から読む。
//
//   POCKETBASE_URL=http://localhost:8090 node scripts/seed-dev-works.mjs
//
// 本物の制作実績の取り込みは別のスクリプト（kamodigi-m5s.5）
import { readFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = (process.env.POCKETBASE_URL || 'http://localhost:8090').replace(/\/+$/, '');
const { hostname } = new URL(base);
if (!['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname)) {
	console.error(`開発用の PocketBase（localhost）にだけ入れる: ${base}`);
	process.exit(1);
}
const staticDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'static', 'works');

async function api(path, init = {}) {
	const response = await fetch(`${base}${path}`, init);
	const body = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(`${init.method ?? 'GET'} ${path}: ${response.status} ${JSON.stringify(body)}`);
	return body;
}

const { token } = await api('/api/collections/users/auth-with-password', {
	method: 'POST',
	headers: { 'content-type': 'application/json' },
	body: JSON.stringify({ identity: 'editor@example.com', password: 'password1234' })
});
const auth = { Authorization: token };

async function file(path) {
	return new File([await readFile(join(staticDir, path))], basename(path));
}

/** media を作って id を返す */
async function media({ file: path, dark, alt, windowShaped = false }) {
	const form = new FormData();
	form.append('file', await file(path));
	if (dark) form.append('file_dark', await file(dark));
	form.append('alt', alt);
	form.append('window_shaped', String(windowShaped));
	return (await api('/api/collections/media/records', { method: 'POST', headers: auth, body: form })).id;
}

/** works を作る。画像（media）は、まだ無いときにだけ作る（makeValues の中で作る） */
async function work(slug, makeValues) {
	const filter = encodeURIComponent(`slug = "${slug}"`);
	const existing = await api(`/api/collections/works/records?filter=${filter}&perPage=1&skipTotal=1`, { headers: auth });
	if (existing.items.length > 0) {
		console.warn(`飛ばす（もうある）: ${slug}`);
		return;
	}
	const values = { slug, ...(await makeValues()) };
	const record = await api('/api/collections/works/records', {
		method: 'POST',
		headers: { ...auth, 'content-type': 'application/json' },
		body: JSON.stringify(values)
	});
	console.warn(`作った: ${values.slug}（${record.id}${values.draft ? '、下書き' : ''}）`);
}

// ライトとダークの画像がある、4 言語の見本（翻訳の欠けた言語はフォールバックする）
await work('sample-themed', async () => ({
	title_ja: '見本：テーマで画像が変わる',
	title_en: 'Sample: images follow the theme',
	title_zh_hans: '示例：图片随主题切换',
	title_zh_hant: '範例：圖片隨主題切換',
	short_description_ja: 'ライトとダークで画像を出し分ける見本です。',
	short_description_en: 'A sample whose images switch between light and dark.',
	description_ja: '開発用の見本の説明です。',
	body_ja: '<h2>見本の本文</h2><p>これは開発用の見本です。<a href="/works/sample-plain">日本語だけの見本</a>へのリンク。</p>',
	body_en: '<h2>Sample body</h2><p>This is a development sample. A link to <a href="/works/sample-plain">the Japanese-only sample</a>.</p>',
	body_zh_hans: '<p></p>',
	work_status: 'completed',
	thumbnail: await media({ file: 'ori/thumbnail-light.webp', dark: 'ori/thumbnail-dark.webp', alt: '見本のサムネイル' }),
	gallery: [
		await media({ file: 'ori/flow-light.webp', dark: 'ori/flow-dark.webp', alt: '見本の画像 1' }),
		await media({ file: 'promptnotes/feed-light.webp', dark: 'promptnotes/feed-dark.webp', alt: 'ウィンドウの形の見本', windowShaped: true }),
		await media({ file: 'promptnotes/icon.webp', alt: 'アイコンの見本' })
	],
	link_github: 'https://github.com/example/sample',
	start_date: '2026-01-01 00:00:00.000Z',
	sort_order: 1,
	draft: false
}));

// 日本語だけ、画像なしの見本（ほかの言語のページは日本語にフォールバックする）
await work('sample-plain', async () => ({
	title_ja: '見本：日本語だけ',
	short_description_ja: '翻訳も画像もない見本です。',
	body_ja: '<p>翻訳がない言語のページでは、この日本語が出ます。</p>',
	work_status: 'in-progress',
	start_date: '2025-01-01 00:00:00.000Z',
	sort_order: 2,
	draft: false
}));

// 下書き。一覧と詳細には出ず、CMS の「サイトで確認」でだけ見られる
await work('sample-draft', async () => ({
	title_ja: '見本：下書き',
	title_en: 'Sample: draft',
	short_description_ja: '公開前の下書きです。',
	body_ja: '<p>下書きの本文です。</p>',
	body_en: '<p>The body of a draft.</p>',
	work_status: 'in-progress',
	thumbnail: await media({ file: 'hodoji-web/thumbnail.png', alt: '下書きのサムネイル' }),
	gallery: [await media({ file: 'hodoji-web/pic1.png', alt: '下書きの画像' })],
	sort_order: 0,
	draft: true
}));
