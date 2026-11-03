<script lang="ts">
	import { generateGradientFromTags, getInitial, isDarkGradient } from '$lib/utils/gradient';

	interface Props {
		title: string;
		tags: string[];
		id: string;
	}

	const { title, tags, id }: Props = $props();

	const gradient = generateGradientFromTags(tags, id);
	const initial = getInitial(title);
	const isDark = isDarkGradient(gradient);
</script>

<div class="gradient-thumbnail" style="background: {gradient};">
	<div class="initial" class:dark={isDark}>
		{initial}
	</div>
	<div class="tags" class:dark={isDark}>
		{#each tags.slice(0, 2) as tag (tag)}
			<span class="tag">{tag}</span>
		{/each}
	</div>
</div>

<style>
	.gradient-thumbnail {
		width: 100%;
		height: 100%;
		min-height: 200px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
	}

	.initial {
		font-size: 5rem;
		font-weight: 700;
		color: var(--color-on-gradient-light);
		text-shadow: 0 2px 10px var(--color-on-gradient-light-shadow);
		margin-bottom: var(--space-4);
		user-select: none;
	}

	.initial.dark {
		color: var(--color-on-gradient-dark);
		text-shadow: 0 2px 10px var(--color-on-gradient-dark-shadow);
	}

	.tags {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
		justify-content: center;
	}

	.tag {
		padding: var(--space-1) var(--space-3);
		background: var(--color-on-gradient-light-chip);
		backdrop-filter: blur(10px);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		color: var(--color-on-gradient-light);
		font-weight: 500;
		border: 1px solid var(--color-on-gradient-light-border);
	}

	.tags.dark .tag {
		background: var(--color-on-gradient-dark-chip);
		color: var(--color-on-gradient-dark);
		border: 1px solid var(--color-on-gradient-dark-border);
	}
</style>
