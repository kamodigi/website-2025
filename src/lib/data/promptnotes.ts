/**
 * promptnotes の LP（/promptnotes）で使う、配布ファイルの取得と OS の判定。
 * 配布ファイル名にバージョン番号が入る（例: PromptNotes_0.2.5_aarch64.dmg）ので、固定のリンクにせず、
 * ページを開いたときに GitHub の API から最新のリリースを取得してリンクを組み立てる。
 */

import type { Locale } from '$lib/paraglide/runtime';

/** LP の文言（messages の pn_*）がある言語。翻訳を足したらここにも足す（ない言語では lang をフォールバック先にする） */
export const PROMPTNOTES_COPY_LOCALES: readonly Locale[] = ['ja'];

export const PROMPTNOTES_REPO_URL = 'https://github.com/dev-komenzar/promptnotes';
/** API の取得に失敗したときのリンク先 */
export const PROMPTNOTES_RELEASES_URL = `${PROMPTNOTES_REPO_URL}/releases/latest`;
const LATEST_RELEASE_API = 'https://api.github.com/repos/dev-komenzar/promptnotes/releases/latest';

/** Nix flake は配布ファイルがないので、コマンドで案内する */
export const PROMPTNOTES_NIX_COMMAND = 'nix run github:dev-komenzar/promptnotes';
/** macOS の Gatekeeper の警告を解除するコマンド（promptnotes の README と同じ） */
export const PROMPTNOTES_XATTR_COMMAND = 'xattr -dr com.apple.quarantine /Applications/promptnotes.app';

export type Platform = 'macos' | 'linux' | 'other';
export type DownloadFormat = 'dmg' | 'appimage' | 'deb' | 'rpm';

export type DownloadLink = {
	platform: Exclude<Platform, 'other'>;
	format: DownloadFormat;
	/** 表示用の拡張子（.dmg など） */
	label: string;
	url: string;
};

export type LatestRelease = {
	version: string;
	links: DownloadLink[];
};

/**
 * 出す配布ファイルの一覧（この順で表示する）。末尾で判定するので、
 * 署名ファイル（.sig）、latest.json、.app.tar.gz は当てはまらず、出ない。
 */
const FORMATS: { platform: DownloadLink['platform']; format: DownloadFormat; label: string; pattern: RegExp }[] = [
	{ platform: 'macos', format: 'dmg', label: '.dmg', pattern: /\.dmg$/i },
	{ platform: 'linux', format: 'appimage', label: 'AppImage', pattern: /\.AppImage$/i },
	{ platform: 'linux', format: 'deb', label: '.deb', pattern: /\.deb$/i },
	{ platform: 'linux', format: 'rpm', label: '.rpm', pattern: /\.rpm$/i }
];

type ReleaseAsset = { name: string; browser_download_url: string };

/** リリースの配布ファイルから、OS ごとのダウンロードのリンクを組み立てる */
export function buildDownloadLinks(assets: ReleaseAsset[]): DownloadLink[] {
	return FORMATS.flatMap(({ pattern, ...rest }) => {
		const asset = assets.find((a) => pattern.test(a.name));
		return asset ? [{ ...rest, url: asset.browser_download_url }] : [];
	});
}

/** 最新のリリースを取得する。失敗したとき（通信、レート制限、配布ファイルがない）は null */
export async function fetchLatestRelease(fetchFn: typeof fetch = fetch): Promise<LatestRelease | null> {
	try {
		const res = await fetchFn(LATEST_RELEASE_API, { headers: { Accept: 'application/vnd.github+json' } });
		if (!res.ok) return null;
		const data = (await res.json()) as { tag_name?: string; assets?: ReleaseAsset[] };
		const links = buildDownloadLinks(Array.isArray(data.assets) ? data.assets : []);
		if (links.length === 0) return null;
		return { version: data.tag_name ?? '', links };
	} catch {
		return null;
	}
}

type NavigatorLike = Pick<Navigator, 'userAgent' | 'platform' | 'maxTouchPoints'> & {
	userAgentData?: { platform?: string };
};

/**
 * 閲覧者の OS。配布しているのは macOS と Linux だけなので、それ以外（Windows、iOS、Android、ChromeOS）は other。
 * Intel Mac は User-Agent から見分けられないので macos になる（ボタンの下に Apple Silicon 用と書く）。
 */
export function detectPlatform(nav: NavigatorLike): Platform {
	const ua = nav.userAgent ?? '';
	const platform = nav.userAgentData?.platform || nav.platform || '';

	if (/Android|iPhone|iPad|iPod|CrOS/i.test(ua) || /Android|Chrome OS|ChromeOS/i.test(platform)) return 'other';
	if (/mac/i.test(platform) || /Macintosh/.test(ua)) {
		// iPadOS の Safari は Mac と名乗るので、タッチの有無で見分ける
		return nav.maxTouchPoints > 1 ? 'other' : 'macos';
	}
	if (/linux/i.test(platform) || /Linux|X11/.test(ua)) return 'linux';
	return 'other';
}
