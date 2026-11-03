<script lang="ts">
	import type { Social } from "$lib/data/social";

	const { href, icon, iconDark, label, onclick }: Social & { onclick?: () => void } = $props();
</script>

<a
	{href}
	target="_blank"
	rel="noopener noreferrer"
	aria-label={label}
	class="link"
	{onclick}
>
	<div class="item">
		<div class="icon-wrapper">
			{#if iconDark}
				<img src={icon} alt={label} class="icon icon-light" />
				<img src={iconDark} alt={label} class="icon icon-dark" />
			{:else}
				<img src={icon} alt={label} class="icon" />
			{/if}
		</div>
	</div>
</a>

<style>
	.link {
		display: inline-block;
		color: var(--color-text-secondary);
		transition:
			color 0.2s ease-in-out,
			transform 0.2s ease-in-out;
	}

	.link:hover {
		color: var(--color-link);
		transform: translateY(-2px);
	}

	.item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		border-radius: 0.5rem;
		transition: background-color 0.2s;
	}

	.item:hover {
		background-color: var(--color-surface);
	}

	.icon-wrapper {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.icon-light {
		display: var(--display-light-only);
	}

	.icon-dark {
		display: var(--display-dark-only);
	}
</style>
