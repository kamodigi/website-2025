import { asset } from "$app/paths";

export const SITE_URL = "https://kamodigi.work";
export const DEFAULT_OGP_IMAGE = "/ogp.png";

/** サイトルートからの相対パス（asset() 出力を含む）を絶対 URL にする。絶対 URL はそのまま返す。 */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return new URL(path.startsWith("/") ? path : `/${path}`, SITE_URL).href;
}

/** OGP 画像の絶対 URL。サムネイルがなければ共通画像。 */
export function ogImageUrl(thumbnail?: string): string {
  return absoluteUrl(thumbnail ? asset(thumbnail) : DEFAULT_OGP_IMAGE);
}
