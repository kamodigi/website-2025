/**
 * アクセス解析の窓口。コンポーネントはここの関数だけを呼び、gtag を直接呼ばない。
 * 解析サービスを替えるとき（例: Umami）は、このファイルだけを差し替える。
 */
import { browser, dev } from '$app/environment';

/** GA4 の測定 ID（kamodigi.work 用プロパティ）。公開して問題のない値なので定数で置く。 */
export const GA_MEASUREMENT_ID = 'G-S4Q2XGQ3D7';

type EventProps = Record<string, string | number | boolean | undefined>;

declare global {
	interface Window {
		dataLayer: unknown[];
		gtag?: (...args: unknown[]) => void;
	}
}

/** 開発環境（vite dev）とサーバー側では送信しない。 */
const enabled = browser && !dev;

let initialized = false;

/** gtag.js を読み込む。ページビューは trackPageView で送るので、自動送信は止める。 */
export function initAnalytics(): void {
	if (!enabled || initialized) return;
	initialized = true;

	window.dataLayer = window.dataLayer || [];
	window.gtag = function gtag() {
		// gtag.js は arguments オブジェクトそのものを期待する
		// eslint-disable-next-line prefer-rest-params
		window.dataLayer.push(arguments);
	};
	window.gtag('js', new Date());
	window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });

	const script = document.createElement('script');
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
	document.head.appendChild(script);
}

/** イベントを送る。 */
export function track(name: string, props: EventProps = {}): void {
	if (!enabled || !window.gtag) return;
	window.gtag('event', name, props);
}

/**
 * ページビューを送る。初回表示とクライアント側のページ遷移ごとに 1 回ずつ呼ぶ。
 * 初回は UTM パラメータ付きの URL をそのまま page_location に入れ、流入元を GA4 に渡す。
 */
export function trackPageView(url: URL): void {
	track('page_view', {
		page_location: url.href,
		page_title: document.title
	});
}
