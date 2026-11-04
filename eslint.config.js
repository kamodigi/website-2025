import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

/**
 * ESLint configuration for the portfolio showcase project
 * Following SvelteKit best practices with Flat Config format
 * Supports Svelte 5 and TypeScript integration
 */
export default ts.config(
	includeIgnoreFile(gitignorePath),
	globalIgnores([
		"src/paraglide/"
	]),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		languageOptions: {
			globals: { 
				...globals.browser, 
				...globals.node 
			}
		},
		rules: { 
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			"no-undef": 'off',
			// Additional rules for code quality
			"no-unused-vars": ["warn",{"argsIgnorePattern": "^_"}],
			"prefer-const": "error",
			"no-console": ["warn", { allow: ["warn", "error"] }]
		}
	},
	{
		files: [
			'**/*.svelte',
			'**/*.svelte.ts',
			'**/*.svelte.js'
		],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		},
		rules: {
			// Svelte specific rules
			"svelte/no-at-html-tags": "warn",
			"svelte/valid-compile": "warn",
			"svelte/no-unused-svelte-ignore": "warn",
			// サイト内のリンクは localeHref（$lib/i18n）で作る。上のルールは resolve() しか認識できないので、
			// リンクの検査は切り（goto などは引き続き検査する）、代わりに下の no-restricted-syntax で
			// 接頭辞なしの内部リンク（href="/works"、href={`/blog/${id}`} など）を禁止する
			"svelte/no-navigation-without-resolve": ["error", { ignoreLinks: true }],
			"no-restricted-syntax": [
				"error",
				...[
					"SvelteAttribute[key.name='href'] > SvelteLiteral[value=/^\\x2f/]",
					"SvelteAttribute[key.name='href'] > SvelteMustacheTag > Literal[value=/^\\x2f/]",
					"SvelteAttribute[key.name='href'] > SvelteMustacheTag > TemplateLiteral > TemplateElement:first-child[value.cooked=/^\\x2f/]"
				].map((selector) => ({
					selector,
					message: "サイト内のリンクは localeHref()（$lib/i18n）で作る。接頭辞なしの内部リンクは今の言語を保てない"
				}))
			]
		}
	},
	{
		// Special rules for TypeScript files
		files: ["**/*.ts", "**/*.tsx"],
		rules: {
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/no-explicit-any": "warn"
		}
	}
);
