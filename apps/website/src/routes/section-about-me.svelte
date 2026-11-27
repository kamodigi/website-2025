<script>
	import SkillIcon from "$lib/components/ui/SkillIcon.svelte";
	import { frameworks, languages, tools } from "$lib/data/skills";
	import { m } from "$lib/paraglide/messages";
</script>

<section id="about-me" class="section about-me-section">
	<div class="container">
		<h2 class="section-title">{m.sections_about_me()}</h2>
		<p>{m.about_me_self_intro()}</p>
	</div>

	<div class="skills-container">
		<h3 class="category-title">Languages</h3>
		<div class="skills-grid">
			{#each languages as skill (skill.name)}
				<SkillIcon {skill} />
			{/each}
		</div>

		<h3 class="category-title">Frameworks & Libraries</h3>
		<div class="skills-grid">
			{#each frameworks as skill (skill.name)}
				<SkillIcon {skill} />
			{/each}
		</div>

		<h3 class="category-title">Tools & Others</h3>
		<div class="skills-grid">
			{#each tools as skill (skill.name)}
				<SkillIcon {skill} />
			{/each}
		</div>
	</div>
</section>

<style>
	.about-me-section > *+*{
		margin-top: var(--space-10);
	}
	.skills-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		text-align: center;
	}
	
	.category-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 0.5rem;
	}
	.skills-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
	}
</style>
