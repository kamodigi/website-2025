<script lang="ts">
	import type { Skill } from '$lib/data/skills';

	const {skill}: {skill: Skill} = $props();
</script>

<div class="skill-item">
	<div class="icon-wrapper">
		<img src={skill.icon} alt={skill.name} class="skill-icon" />
	</div>
</div>

<style>
		.skill-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		border-radius: 0.5rem;
		transition: background-color 0.2s;
	}

	.skill-item:hover {
		background-color: var(--color-surface);
	}

	.icon-wrapper {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

</style>