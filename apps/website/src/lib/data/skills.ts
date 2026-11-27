import ClojureIcon from '$lib/assets/skills/icons/clojure.svg'
import CssIcon from '$lib/assets/skills/icons/css.svg'
import ElixirIcon from '$lib/assets/skills/icons/elixir.svg'
import HtmlIcon from '$lib/assets/skills/icons/html.svg'
import JavaScriptIcon from '$lib/assets/skills/icons/javascript.svg'
import LogseqIcon from '$lib/assets/skills/icons/logseq.svg'
import NotionIcon from '$lib/assets/skills/icons/notion.svg'
import ObsidianIcon from '$lib/assets/skills/icons/obsidian.svg'
import ReactIcon from '$lib/assets/skills/icons/react.svg'
import SvelteIcon from '$lib/assets/skills/icons/svelte.svg'
import TypeScriptIcon from '$lib/assets/skills/icons/typescript.svg'
import VueIcon from '$lib/assets/skills/icons/vue.svg'

export interface Skill {
	name: string;
	icon: string
}

export const languages: Skill[] = [
	{
		name: 'JavaScript',
		icon: JavaScriptIcon
	},
	{
		name: 'TypeScript',
		icon: TypeScriptIcon
	},
	{
		name: 'Elixir',
		icon: ElixirIcon
	},
	{
		name: 'Clojure',
		icon: ClojureIcon
	},
	{
		name: 'CSS',
		icon: CssIcon
	},
	{
		name: 'HTML',
		icon: HtmlIcon
	}
]

export const frameworks: Skill[] = [
	{
		name: 'Svelte',
		icon: SvelteIcon
	},
	{
		name: 'React',
		icon: ReactIcon
	},
	{
		name: 'Vue',
		icon: VueIcon
	},
]

export const tools: Skill[] = [
	{
		name: 'Obsidian',
		icon: ObsidianIcon
	},
	{
		name: 'Logseq',
		icon: LogseqIcon
	},
	{
		name: 'Notion',
		icon: NotionIcon
	}
]