/// <reference path="../pb_data/types.d.ts" />
// users に role を足す。pocketbase-cms にログインできるのは role = "editor" の users だけ。
// アカウントは superuser がダッシュボード（/_/）で作る。自分で登録したり、自分の role を変えたりはできない。
migrate(
	app => {
		const users = app.findCollectionByNameOrId('users')

		users.fields.add(
			new SelectField({
				id: 'usr_role',
				name: 'role',
				maxSelect: 1,
				values: ['editor'],
			}),
		)

		users.createRule = null
		users.updateRule = 'id = @request.auth.id && @request.body.role:isset = false'
		users.deleteRule = null

		app.save(users)
	},
	app => {
		const users = app.findCollectionByNameOrId('users')
		users.fields.removeById('usr_role')
		users.createRule = ''
		users.updateRule = 'id = @request.auth.id'
		users.deleteRule = 'id = @request.auth.id'
		app.save(users)
	},
)
