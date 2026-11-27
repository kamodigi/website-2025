<script lang="ts">
	import Card from "$lib/components/ui/Card.svelte";
	import ThemedImage from "$lib/components/ui/ThemedImage.svelte";
	import GradientThumbnail from "$lib/components/ui/GradientThumbnail.svelte";
	import type { Snippet } from "svelte";

	type Props = {
		thumbnailUrl?: string;
		thumbnailAlt?: string;
		href?: string;
		isExternal?: boolean;
		children?: Snippet;
		// GradientThumbnail用のprops
		gradientTitle?: string;
		gradientTags?: string[];
		gradientId?: string;
		// Cardコンポーネントが受け取る残りのプロパティ
		variant?: "default" | "elevated" | "bordered" | "gradient";
		hover?: boolean;
	};

	const {
		thumbnailUrl,
		thumbnailAlt = 'No Image',
		href,
		isExternal = false,
		children,
		gradientTitle,
		gradientTags,
		gradientId,
		...restProps
	}: Props = $props();
</script>

<Card {...restProps} clickable={!!href}>
	{#if href}
		<a {href} class="card-link" target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>
			<div class="thumbnail-wrapper">
				{#if thumbnailUrl}
					<ThemedImage src={thumbnailUrl} alt={thumbnailAlt} class="thumbnail-image" />
				{:else if gradientTitle && gradientTags && gradientId}
					<GradientThumbnail title={gradientTitle} tags={gradientTags} id={gradientId} />
				{/if}
			</div>
			<div class="content-wrapper">
				{@render children?.()}
			</div>
		</a>
	{:else}
		<div class="thumbnail-wrapper">
			{#if thumbnailUrl}
				<ThemedImage src={thumbnailUrl} alt={thumbnailAlt} class="thumbnail-image" />
			{:else if gradientTitle && gradientTags && gradientId}
				<GradientThumbnail title={gradientTitle} tags={gradientTags} id={gradientId} />
			{/if}
		</div>
		<div class="content-wrapper">
			{@render children?.()}
		</div>
	{/if}
</Card>

<style>
	.card-link {
		display: block;
		color: inherit;
		text-decoration: none;
	}

	.thumbnail-wrapper {
		aspect-ratio: 16 / 9;
		overflow: hidden;
	}

	:global(.thumbnail-image) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	:global(.card-hover:hover .thumbnail-image) {
		transform: scale(1.05);
	}

	.content-wrapper {
		padding: var(--space-4);
	}
</style>
