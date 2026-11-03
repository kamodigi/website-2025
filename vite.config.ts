import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';
import { resolveMessages, SOURCE_DIR } from './scripts/resolve-messages.mjs';

// paraglide が読む前に、フォールバックを埋めた文言を書き出しておく（scripts/resolve-messages.mjs）
resolveMessages();

/** dev サーバーで messages/*.json を直したら書き出し直す。paraglide は書き出し先の変更を見て再コンパイルする */
function resolveMessagesOnChange(): Plugin {
	return {
		name: 'resolve-messages-on-change',
		configureServer(server) {
			server.watcher.add(SOURCE_DIR);
			server.watcher.on('change', (file) => {
				if (file.startsWith(SOURCE_DIR) && file.endsWith('.json')) resolveMessages();
			});
		}
	};
}

export default defineConfig({
	plugins: [
		sveltekit(),
		resolveMessagesOnChange(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url'],
			// URL の言語の部分は小文字にする（/zh-hans/...、/zh-hant/...）。日本語（基準の言語）は接頭辞なし。
			// ja は何にでも当てはまるので最後に置く
			urlPatterns: [
				{
					pattern: ':protocol://:domain(.*)::port?/:path(.*)?',
					localized: [
						['en', ':protocol://:domain(.*)::port?/en/:path(.*)?'],
						['zh-Hans', ':protocol://:domain(.*)::port?/zh-hans/:path(.*)?'],
						['zh-Hant', ':protocol://:domain(.*)::port?/zh-hant/:path(.*)?'],
						['ja', ':protocol://:domain(.*)::port?/:path(.*)?']
					]
				}
			]
		})
	]
});
