// 制作実績（PocketBase の works コレクション）を読む。サーバーでだけ動く（$lib/server）。
// コレクションの形は apps/pocketbase/pb_migrations/ の works と media（kamodigi-m5s.2）。
// PocketBase の公開 URL は環境変数 POCKETBASE_URL（例: https://cms.kamodigi.work）。画像の URL にも使う。
// 届かないとき・設定がないときは PocketBaseUnavailableError を投げ、呼び出し側が 503 にする
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { Localized } from '$lib/i18n';
import { locales, type Locale } from '$lib/paraglide/runtime';
import type { Work, WorkImage } from '$lib/types/work';

export const WORKS_COLLECTION = 'works';
const MEDIA_COLLECTION = 'media';

/** PocketBase の応答を待つ上限。これを超えたら届かないものとして扱う */
const TIMEOUT_MS = 5000;

/** 一覧で一度に読む件数の上限（ページ送りはしない） */
const MAX_WORKS = 200;

/** 一覧の並び。sort_order の小さい順、同じなら始めた日の新しい順 */
const SORT = 'sort_order,-start_date,-created';

/** スラッグの形（works.slug の pattern と同じ）。合わないものは PocketBase に問い合わせずに 404 にする */
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** PocketBase のレコードの id の形（既定は英小文字と数字の 15 文字） */
export const RECORD_ID_PATTERN = /^[a-z0-9]{15}$/;

export class PocketBaseUnavailableError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'PocketBaseUnavailableError';
	}
}

/**
 * PocketBase に届かないエラーを 503 にする（ページは +error.svelte で出す）。それ以外のエラーはそのまま投げ直す
 */
export function rethrowAsUnavailable(cause: unknown): never {
	if (cause instanceof PocketBaseUnavailableError) {
		console.error(cause.message, cause.cause ?? '');
		error(503, 'Works are temporarily unavailable');
	}
	throw cause;
}

/** media のレコード */
type MediaRecord = {
	id: string;
	collectionId: string;
	file?: string;
	file_dark?: string;
	alt?: string;
	width?: number;
	height?: number;
	/** ウィンドウの形に切り抜いた画像か（項目が無ければ false） */
	window_shaped?: boolean;
};

/** works のレコード（PocketBase の API の応答） */
type WorkRecord = {
	id: string;
	slug: string;
	thumbnail?: string;
	gallery?: string[];
	link_demo?: string;
	link_github?: string;
	link_website?: string;
	expand?: { thumbnail?: MediaRecord; gallery?: MediaRecord[] };
} & Record<string, unknown>;

function baseUrl(): string {
	const url = env.POCKETBASE_URL?.trim();
	if (!url) throw new PocketBaseUnavailableError('POCKETBASE_URL is not set');
	return url.replace(/\/+$/, '');
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
	const url = `${baseUrl()}${path}`;
	try {
		return await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
	} catch (cause) {
		throw new PocketBaseUnavailableError(`PocketBase did not answer: ${url.split('?')[0]}`, { cause });
	}
}

async function readJson<T>(response: Response): Promise<T> {
	try {
		return (await response.json()) as T;
	} catch (cause) {
		throw new PocketBaseUnavailableError('PocketBase answered with invalid JSON', { cause });
	}
}

async function listRecords<T>(collection: string, params: Record<string, string>): Promise<T[]> {
	const response = await request(`/api/collections/${collection}/records?${new URLSearchParams({ skipTotal: '1', ...params })}`);
	if (!response.ok) throw new PocketBaseUnavailableError(`PocketBase answered ${response.status} for ${collection}`);
	const body = await readJson<{ items?: T[] }>(response);
	return body.items ?? [];
}

/** 言語コードを項目名の接尾辞にする（pocketbase-cms の規則: zh-Hans → zh_hans） */
function fieldSuffix(locale: Locale): string {
	return locale.toLowerCase().replace(/-/g, '_');
}

/** 中身のない HTML（CMS のエディタが残す空の段落だけ、など）か */
function isEmptyHtml(html: string): boolean {
	if (/<(img|video|iframe|hr|table)\b/i.test(html)) return false;
	return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() === '';
}

/** `<基本名>_<言語>` の項目を Localized にまとめる。空の言語は入れない（表示のときにフォールバックする） */
function localizedField(record: WorkRecord, name: string, { html = false } = {}): Localized {
	const result: Localized = { ja: '' };
	for (const locale of locales) {
		const value = record[`${name}_${fieldSuffix(locale)}`];
		if (typeof value !== 'string') continue;
		if (html ? isEmptyHtml(value) : value.trim() === '') continue;
		result[locale] = value;
	}
	return result;
}

function fileUrl(media: MediaRecord, filename: string): string {
	return `${baseUrl()}/api/files/${encodeURIComponent(media.collectionId)}/${encodeURIComponent(media.id)}/${encodeURIComponent(filename)}`;
}

function toImage(media: MediaRecord | undefined): WorkImage | undefined {
	if (!media?.file) return undefined;
	return {
		src: fileUrl(media, media.file),
		darkSrc: media.file_dark ? fileUrl(media, media.file_dark) : undefined,
		alt: media.alt ?? '',
		width: media.width || undefined,
		height: media.height || undefined,
		windowShaped: media.window_shaped === true
	};
}

function optionalUrl(value: unknown): string | undefined {
	return typeof value === 'string' && value !== '' ? value : undefined;
}

/** media は id から引く（API の expand か、別に読んだもの）。見つからない画像（消された・読めない）は出さない */
function toWork(record: WorkRecord, media: Map<string, MediaRecord>): Work {
	const pick = (id: string) => toImage(media.get(id));
	return {
		slug: record.slug,
		title: localizedField(record, 'title'),
		summary: localizedField(record, 'short_description'),
		description: localizedField(record, 'description'),
		body: localizedField(record, 'body', { html: true }),
		thumbnail: record.thumbnail ? pick(record.thumbnail) : undefined,
		gallery: (record.gallery ?? []).flatMap((id) => pick(id) ?? []),
		links: {
			demo: optionalUrl(record.link_demo),
			github: optionalUrl(record.link_github),
			website: optionalUrl(record.link_website)
		}
	};
}

/** API の expand に入っている media を id で引けるようにする */
function expandedMedia(records: WorkRecord[]): Map<string, MediaRecord> {
	const media = new Map<string, MediaRecord>();
	for (const record of records) {
		for (const item of [record.expand?.thumbnail, ...(record.expand?.gallery ?? [])]) {
			if (item) media.set(item.id, item);
		}
	}
	return media;
}

async function listPublishedWorks(filter: string, perPage: number): Promise<Work[]> {
	const records = await listRecords<WorkRecord>(WORKS_COLLECTION, {
		// 公開の判定は PocketBase の API ルール（draft = false）が正。念のためこちらでも下書きを除く
		filter: `(draft = false) && (${filter})`,
		sort: SORT,
		perPage: String(perPage),
		expand: 'thumbnail,gallery'
	});
	const media = expandedMedia(records);
	return records.map((record) => toWork(record, media));
}

/** 公開中の制作実績を、表示順に返す */
export async function listWorks(): Promise<Work[]> {
	return listPublishedWorks('slug != ""', MAX_WORKS);
}

/** スラッグの制作実績。無い・下書きなら null */
export async function getWork(slug: string): Promise<Work | null> {
	if (!SLUG_PATTERN.test(slug)) return null;
	// スラッグは上の形に限っているので、そのまま filter に入れてよい
	const [work] = await listPublishedWorks(`slug = "${slug}"`, 1);
	return work ?? null;
}

export type PreviewResult = { ok: true; work: Work } | { ok: false; reason: 'invalid-token' | 'not-found' };

/**
 * pocketbase-cms の「サイトで確認」から来た下書きを読む（GET /api/cms/preview/{collection}/{id}）。
 * トークンはそのレコードだけを 10 分ほど読める、プレビュー専用のもの。
 * 応答の relation は id だけなので、画像（media、誰でも読める）は別に読む
 */
export async function getWorkPreview(id: string, token: string): Promise<PreviewResult> {
	if (!RECORD_ID_PATTERN.test(id)) return { ok: false, reason: 'not-found' };
	const response = await request(`/api/cms/preview/${WORKS_COLLECTION}/${id}`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	if (response.status === 401 || response.status === 403) return { ok: false, reason: 'invalid-token' };
	if (response.status === 404) return { ok: false, reason: 'not-found' };
	if (!response.ok) throw new PocketBaseUnavailableError(`PocketBase answered ${response.status} for a preview`);
	const record = await readJson<WorkRecord>(response);

	const mediaIds = [record.thumbnail ?? '', ...(record.gallery ?? [])].filter((mediaId) => RECORD_ID_PATTERN.test(mediaId));
	const media = new Map<string, MediaRecord>();
	if (mediaIds.length > 0) {
		const items = await listRecords<MediaRecord>(MEDIA_COLLECTION, {
			// id は上の形に限っているので、そのまま filter に入れてよい
			filter: mediaIds.map((mediaId) => `id = "${mediaId}"`).join(' || '),
			perPage: String(mediaIds.length)
		});
		for (const item of items) media.set(item.id, item);
	}
	return { ok: true, work: toWork(record, media) };
}
