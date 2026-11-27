import Github from '$lib/assets/socials/github-mark.svg';
import GithubDark from '$lib/assets/socials/github-mark-dark.svg';
import Mail from '$lib/assets/socials/gmail.svg';
import Zenn from '$lib/assets/socials/zenn.svg';

/** 問い合わせ先のメールアドレス。Contact セクションとプライバシーポリシーで共有する。 */
export const CONTACT_EMAIL = 'takuya.kometan@gmail.com';

export interface Social {
	label: string;
	href: string;
	icon: string;
	/** ダークテーマ用のアイコン（元のアイコンが暗い背景で見えない場合） */
	iconDark?: string;
}

export const Socials: Social[] = [
	{
		label: 'GitHub',
		href: 'https://github.com/dev-komenzar',
		icon: Github,
		iconDark: GithubDark
	},
	{
		label: 'Zenn',
		href: 'https://zenn.dev/kometan',
		icon: Zenn
	},
	{
		label: 'Email',
		href: `mailto:${CONTACT_EMAIL}`,
		icon: Mail
	}
]

