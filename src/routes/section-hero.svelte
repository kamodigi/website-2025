<script lang="ts">
	import ThreeShader from "$lib/components/ui/three/ThreeShader.svelte";
	import { m } from "$lib/paraglide/messages";
</script>

<section id="hero" class="hero-section">
	<div class="container hero-container">
		<div class="hero-content">
			<h1 class="hero-title">{m.hero_title()}</h1>
		</div>
	</div>
	<ThreeShader />
</section>

<style>
	.hero-section {
		min-height: 100lvh;
		display: flex;
		align-items: center;
		padding: var(--space-16) 0;
	}

	.hero-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		/* 見出しをドットのキャンバス（z-index: 10）より手前に出す。クリックはキャンバスへ通す */
		position: relative;
		z-index: 11;
		pointer-events: none;
	}

	.hero-content {
		max-width: 800px;
	}

	.hero-title {
		color: var(--color-text);
		background: none;
		background-clip: initial;
		font-size: var(--text-5xl);
		font-weight: 700;
		margin-bottom: var(--space-4);
		-webkit-background-clip: initial;
		-webkit-text-fill-color: initial;
		/* 見出しは選択・コピーできるようにする（周りの余白のクリックはキャンバスへ通す） */
		pointer-events: auto;
		/* 背景のドットに重なっても読めるよう、背景色のにじみを敷く */
		text-shadow:
			0 0 8px var(--color-background),
			0 0 16px var(--color-background);
	}

	/* Responsive styles */
	@media (max-width: 767px) {
		.hero-title {
			font-size: var(--text-4xl);
		}
	}
</style>
