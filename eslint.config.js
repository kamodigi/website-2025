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
			// サイト内のリンクは localeHref（$lib/i18n。base と localizeHref を使う）で作る。
			// このルールは resolve() 以外を認識できないため、リンクの検査は切る（goto などは引き続き検査する）
			"svelte/no-navigation-without-resolve": ["error", { ignoreLinks: true }]
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
