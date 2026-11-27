<script lang="ts">
	/**
	 * `...-light.<ext>` という名前の画像には、同じ場所の `...-dark.<ext>` が対になっているものとして扱い、
	 * サイトのテーマに合わせて出し分ける（--display-light-only / --display-dark-only）。
	 * それ以外の画像は、そのまま 1 枚だけ表示する。
	 *
	 * 表示しない側の画像は `display: none` になり、`loading="lazy"` が付いているので、ブラウザは読み込まない
	 * （テーマは data-theme 属性でも切り替わるため、<picture> の media では出し分けられない）。
	 * ファーストビューの画像は `loading="eager"` にする（表示の遅れを防ぐ代わりに、ライトとダークの両方を読み込む）。
	 * `width` と `height` を渡すと、読み込む前から縦横比のぶんの場所を取り、レイアウトがずれない。
	 */
	type Props = {
		src: string;
		alt: string;
		class?: string;
		loading?: 'lazy' | 'eager';
		width?: number;
		height?: number;
	};

	const { src, alt, class: className = '', loading = 'lazy', width, height }: Props = $props();

	const darkSrc = $derived(/-light\.[a-z0-9]+$/i.test(src) ? src.replace(/-light(\.[a-z0-9]+)$/i, '-dark$1') : undefined);
</script>

<span class="themed-image">
	{#if darkSrc}
		<img {src} {alt} {loading} {width} {height} decoding="async" class="{className} light-only" />
		<img src={darkSrc} {alt} {loading} {width} {height} decoding="async" class="{className} dark-only" />
	{:else}
		<img {src} {alt} {width} {height} class={className} />
	{/if}
</span>

<style>
	/* スライダーなどが 1 枚の画像を 1 つの要素として数えられるように、ライトとダークをまとめる */
	.themed-image {
		display: block;
		width: 100%;
		height: 100%;
	}

	.light-only {
		display: var(--display-light-only);
	}

	.dark-only {
		display: var(--display-dark-only);
	}
</style>
