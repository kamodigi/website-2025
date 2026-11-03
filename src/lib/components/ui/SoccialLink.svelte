<script lang="ts">
	import type { Social } from "$lib/data/social";

	const { href, icon, label, onclick }: Social & { onclick?: () => void } = $props();
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
			<img src={icon} alt={label} class="icon" />
		</div>
	</div>
</a>

<style>
	.link {
		display: inline-block;
		color: var(--neutral-light); /* アイコンの色を親要素から継承 */
		transition:
			color 0.2s ease-in-out,
			transform 0.2s ease-in-out;
	}

	.link:hover {
		color: var(--primary-color); /* ホバー時の色 */
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
		background-color: var(--neutral-pale);
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
</style>
