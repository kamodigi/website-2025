/// <reference path="../pb_data/types.d.ts" />
// メディアライブラリ（pocketbase-cms の media プリセットと同じ形）。制作実績のサムネイル・ギャラリー・本文の画像はここから選ぶ。
// file_dark は任意で、サイトのダークテーマのときに file の代わりに出す画像（スクリーンショットのライトとダークの対など）。
// window_shaped は、画像がウィンドウの形に切り抜いてあり角の外側が透明なもの。サイトは角丸・縁・影の箱を付けず、drop-shadow だけにする。
// 誰でも読めて、書き込めるのは editor だけ。
migrate(
	app => {
		const users = app.findCollectionByNameOrId('users')
		const editor = '@request.auth.role = "editor"'
		const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']

		const collection = new Collection({
			id: 'col_media',
			name: 'media',
			type: 'base',
			listRule: '',
			viewRule: '',
			createRule: editor,
			updateRule: editor,
			deleteRule: editor,
			fields: [
				{
					id: 'md_file',
					name: 'file',
					type: 'file',
					required: true,
					maxSelect: 1,
					maxSize: 10485760,
					mimeTypes: imageTypes,
					thumbs: ['160x160f', '480x0', '960x0'],
				},
				{
					id: 'md_file_dark',
					name: 'file_dark',
					type: 'file',
					maxSelect: 1,
					maxSize: 10485760,
					mimeTypes: imageTypes,
					thumbs: ['160x160f', '480x0', '960x0'],
				},
				{ id: 'md_alt', name: 'alt', type: 'text', required: true, max: 255 },
				{ id: 'md_caption', name: 'caption', type: 'text' },
				{ id: 'md_window_shaped', name: 'window_shaped', type: 'bool' },
				{ id: 'md_width', name: 'width', type: 'number', min: 0, onlyInt: true },
				{ id: 'md_height', name: 'height', type: 'number', min: 0, onlyInt: true },
				{ id: 'md_mime', name: 'mime', type: 'text', max: 127 },
				{ id: 'md_uploadedBy', name: 'uploadedBy', type: 'relation', collectionId: users.id, maxSelect: 1 },
				{ id: 'md_created', name: 'created', type: 'autodate', onCreate: true },
				{ id: 'md_updated', name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
			],
		})

		app.save(collection)
	},
	app => {
		app.delete(app.findCollectionByNameOrId('col_media'))
	},
)
