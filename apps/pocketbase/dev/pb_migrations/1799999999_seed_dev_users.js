/// <reference path="../pb_data/types.d.ts" />
// 手元の開発専用（compose.yaml だけが読み込む。本番のイメージには入らない）。
// 最初の起動で、よく知られたパスワードの superuser と editor を作る。
migrate(
	app => {
		const password = 'password1234'

		const superuser = new Record(app.findCollectionByNameOrId('_superusers'))
		superuser.set('email', 'admin@example.com')
		superuser.set('password', password)
		app.save(superuser)

		const editor = new Record(app.findCollectionByNameOrId('users'))
		editor.set('email', 'editor@example.com')
		editor.set('password', password)
		editor.set('verified', true)
		editor.set('name', 'Example Editor')
		editor.set('role', 'editor')
		app.save(editor)
	},
	app => {
		app.delete(app.findAuthRecordByEmail('_superusers', 'admin@example.com'))
		app.delete(app.findAuthRecordByEmail('users', 'editor@example.com'))
	},
)
