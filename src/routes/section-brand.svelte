<script lang="ts">
	import { asset } from '$app/paths';
	import { m } from '$lib/paraglide/messages';

	// static/brand/kamodigi-duck-sprite.png（scripts/generate-brand-sprite.mjs で生成）に合わせる
	const FRAMES = 22;
	const FRAME_MS = 400; // 元 GIF のコマ時間（全フレーム同じ）
	const FRAME_PX = 22; // スプライト1コマの一辺（ドット数）
</script>

<section id="brand" class="brand-section">
	<div class="container brand-container">
		<div
			class="duck"
			style:--frames={FRAMES}
			style:--duration="{FRAMES * FRAME_MS}ms"
			style:--dot={FRAME_PX}
		>
			<img
				class="duck-sprite"
				src={asset('/brand/kamodigi-duck-sprite.png')}
				alt="kamodigi"
				width={FRAME_PX * FRAMES}
				height={FRAME_PX}
			/>
		</div>
		<div class="brand-text">
			<h2 class="brand-name">kamodigi</h2>
			<p class="brand-intro">{m.brand_intro()}</p>
		</div>
	</div>
</section>

<style>
	.brand-section {
		padding: var(--space-10) 0;
	}

	.brand-container {
		display: flex;
		align-items: center;
		gap: var(--space-8);
	}

	/* 1コマ分だけ見せる窓。ドットが崩れないよう整数倍で拡大する */
	.duck {
		--scale: 6;
		flex-shrink: 0;
		width: calc(var(--dot) * var(--scale) * 1px);
		height: calc(var(--dot) * var(--scale) * 1px);
		overflow: hidden;
	}

	.duck-sprite {
		width: calc(var(--dot) * var(--frames) * var(--scale) * 1px);
		max-width: none;
		height: 100%;
		image-rendering: pixelated;
		animation: duck-frames var(--duration) steps(var(--frames)) infinite;
	}

	@keyframes duck-frames {
		to {
			transform: translateX(-100%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.duck-sprite {
			animation: none;
		}
	}

	.brand-name {
		font-size: var(--text-3xl);
		font-weight: 700;
		line-height: var(--leading-tight);
		margin-bottom: var(--space-2);
	}

	.brand-intro {
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
	}

	@media (max-width: 767px) {
		.brand-container {
			flex-direction: column;
			text-align: center;
			gap: var(--space-4);
		}

		.duck {
			--scale: 5;
		}

		.brand-name {
			font-size: var(--text-2xl);
		}
	}
</style>
