// pocketbase-cms の「サイトで確認」を受けるページ（README の「Draft previews on your site」）。
// CMS はフォームの POST（collection・id・token・locale）で開く。誰でも送れるので、値は信用せずに確かめる。
//
// 1. POST: 値を確かめ、トークンを HttpOnly の Cookie（10 分）に入れて、locale の言語の
//    /…/preview に 303 で移る。言語は URL で決まるので（paraglide の url の戦略）、言語ごとの URL に移す。
//    トークンを URL に載せないために Cookie を使う
// 2. GET: Cookie のトークンで PocketBase から下書きを読んで出す。Cookie がある間は再読み込みで保存後の内容を見られる
import { baseLocale, isLocale } from '$lib/paraglide/runtime';
import { localizedPath } from '$lib/i18n';
import { getWorkPreview, RECORD_ID_PATTERN, rethrowAsUnavailable, WORKS_COLLECTION } from '$lib/server/works';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const prerender = false;

const COOKIE = 'works_preview';
/** pocketbase-cms のプレビューのトークンの既定の期限と同じ */
const COOKIE_MAX_AGE = 600;
/** トークンの長さの上限（PocketBase の JWT は数百文字） */
const MAX_TOKEN_LENGTH = 4096;

type PreviewCookie = { id: string; token: string };

function readCookie(raw: string | undefined): PreviewCookie | null {
	if (!raw) return null;
	try {
		const value = JSON.parse(raw) as Partial<PreviewCookie>;
		if (typeof value.id === 'string' && typeof value.token === 'string') return { id: value.id, token: value.token };
	} catch {
		// 壊れた Cookie は無いものとして扱う
	}
	return null;
}

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const collection = form.get('collection');
		const id = form.get('id');
		const token = form.get('token');
		const locale = form.get('locale');
		if (collection !== WORKS_COLLECTION) error(400, 'Unknown collection');
		if (typeof id !== 'string' || !RECORD_ID_PATTERN.test(id)) error(400, 'Invalid id');
		if (typeof token !== 'string' || token === '' || token.length > MAX_TOKEN_LENGTH) error(400, 'Invalid token');

		cookies.set(COOKIE, JSON.stringify({ id, token } satisfies PreviewCookie), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: COOKIE_MAX_AGE
		});
		const target = typeof locale === 'string' && isLocale(locale) ? locale : baseLocale;
		redirect(303, localizedPath('/preview', target));
	}
};

export const load: PageServerLoad = async ({ cookies, setHeaders }) => {
	// 下書きなので、キャッシュさせず、検索エンジンにも載せない
	setHeaders({ 'cache-control': 'no-store', 'x-robots-tag': 'noindex' });

	const preview = readCookie(cookies.get(COOKIE));
	if (!preview) error(401, 'Open the preview from the CMS');

	let result;
	try {
		result = await getWorkPreview(preview.id, preview.token);
	} catch (cause) {
		rethrowAsUnavailable(cause);
	}
	if (!result.ok) {
		if (result.reason === 'invalid-token') {
			cookies.delete(COOKIE, { path: '/' });
			error(401, 'The preview has expired');
		}
		error(404, 'Work not found');
	}
	return { work: result.work };
};
