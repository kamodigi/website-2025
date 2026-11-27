/// <reference path="../pb_data/types.d.ts" />
// 制作実績。言語ごとの項目は <基本名>_<言語> で持つ（pocketbase-cms の localized。cms.config.json の locales と同じ4言語）。
// 言語は ja・en・zh-Hans・zh-Hant で、ハイフン入りは小文字とアンダースコアにする（zh-Hans → title_zh_hans）。
// 基本の言語の ja だけを必須にし、翻訳がまだの言語は空のままにする（サイトがフォールバックの順で別の言語を出す）。
// スラッグ・日付・画像・リンク・公開状態は言語で共通。
// 公開の判定は draft だけで行う（予約公開はしない）。誰でも読めるのは draft = false のものだけで、editor はすべて読み書きできる。
migrate(
	app => {
		const editor = '@request.auth.role = "editor"'
		const published = 'draft = false'
		const locales = ['ja', 'en', 'zh_hans', 'zh_hant']

		/** 言語ごとの項目を作る。ja だけ required */
		const localized = (base, prefix, field) =>
			locales.map(locale => ({
				...field,
				id: `wk_${prefix}_${locale}`,
				name: `${base}_${locale}`,
				required: locale === 'ja' && Boolean(field.required),
				...(locale === 'ja' && field.required && field.type === 'text' ? { min: 1 } : {}),
			}))

		const collection = new Collection({
			id: 'col_works',
			name: 'works',
			type: 'base',
			listRule: `${published} || ${editor}`,
			viewRule: `${published} || ${editor}`,
			createRule: editor,
			updateRule: editor,
			deleteRule: editor,
			fields: [
				// URL の /works/<slug>。英小文字・数字・ハイフンだけ
				{ id: 'wk_slug', name: 'slug', type: 'text', required: true, max: 100, pattern: '^[a-z0-9]+(-[a-z0-9]+)*$' },
				...localized('title', 'title', { type: 'text', required: true, max: 255 }),
				// 一覧のカード用の短い説明
				...localized('short_description', 'short', { type: 'text', max: 500 }),
				// 詳細ページの冒頭と meta description に使う説明（プレーンテキスト）
				...localized('description', 'desc', { type: 'text', max: 2000 }),
				// 詳細ページの本文（リッチテキスト。保存時に pocketbase-cms のフックが無害化する）
				...localized('body', 'body', { type: 'editor', convertURLs: false }),
				// 使った技術。カンマ（,）区切りで並べる（例：SvelteKit, TypeScript）
				{ id: 'wk_technologies', name: 'technologies', type: 'text', max: 1000 },
				{
					id: 'wk_category',
					name: 'category',
					type: 'select',
					maxSelect: 1,
					values: ['web', 'mobile', 'desktop', 'other'],
				},
				// 制作の状態。pocketbase-cms の公開状態（status）と紛れないよう work_status にする
				{
					id: 'wk_work_status',
					name: 'work_status',
					type: 'select',
					required: true,
					maxSelect: 1,
					values: ['completed', 'in-progress', 'archived'],
				},
				{ id: 'wk_start_date', name: 'start_date', type: 'date' },
				// 進行中なら空
				{ id: 'wk_end_date', name: 'end_date', type: 'date' },
				{ id: 'wk_thumbnail', name: 'thumbnail', type: 'relation', collectionId: 'col_media', maxSelect: 1 },
				// 選んだ順に並ぶ
				{ id: 'wk_gallery', name: 'gallery', type: 'relation', collectionId: 'col_media', maxSelect: 50 },
				{ id: 'wk_link_demo', name: 'link_demo', type: 'url' },
				{ id: 'wk_link_github', name: 'link_github', type: 'url' },
				{ id: 'wk_link_website', name: 'link_website', type: 'url' },
				// トップページで取り上げる
				{ id: 'wk_featured', name: 'featured', type: 'bool' },
				// 表示順。小さいほど先に出す
				{ id: 'wk_sort_order', name: 'sort_order', type: 'number', onlyInt: true },
				{ id: 'wk_draft', name: 'draft', type: 'bool' },
				{ id: 'wk_created', name: 'created', type: 'autodate', onCreate: true },
				{ id: 'wk_updated', name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
			],
			indexes: [
				'CREATE UNIQUE INDEX `idx_works_slug` ON `works` (`slug`)',
				'CREATE INDEX `idx_works_sort_order` ON `works` (`sort_order`)',
			],
		})

		app.save(collection)
	},
	app => {
		app.delete(app.findCollectionByNameOrId('col_works'))
	},
)
