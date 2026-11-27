import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		// 制作実績のページ（/works と /works/[slug]）だけを表示のたびに PocketBase から読むため、Node のサーバーにする。
		// ほかのページは +layout.server.js の prerender = true でビルドのときに書き出し、PocketBase を見ない
		adapter: adapter(),
		csrf: {
			// pocketbase-cms の「サイトで確認」は、CMS のオリジンからフォームを POST する（/preview。apps/pocketbase/cms.config.json の previewUrl）。
			// SvelteKit は別のオリジンからのフォームの POST を断るので、本番の CMS のオリジンだけを許す。
			// 手元の開発（vite dev）では SvelteKit がこの検査をしないので、開発用の CMS（http://localhost:8090）を足さなくてよい
			trustedOrigins: ['https://cms.kamodigi.work']
		},
		paths: {
			assets: '',
		},
		experimental: {
			remoteFunctions: true
		}
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
