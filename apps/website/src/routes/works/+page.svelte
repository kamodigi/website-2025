<script lang="ts">
	import { localeHref } from "$lib/i18n";
	import ThumbnailCard from "$lib/components/ui/ThumbnailCard.svelte";
	import { m } from "$lib/paraglide/messages";
	import { getLocale } from "$lib/paraglide/runtime";
	import { pickLocalized } from '$lib/i18n';

	const { data } = $props();
	const lang = getLocale();
</script>

<svelte:head>
	<title>{m.sections_works()}</title>
	<meta name="description" content={m.works_description()} />
</svelte:head>

<section class="works-page">
	<div class="container">
		<h1 class="page-title">{m.sections_works()}</h1>
		{#if data.works.length === 0}
			<p class="no-works-message">{m.works_empty()}</p>
		{:else}
			<div class="works-grid">
				{#each data.works as work (work.slug)}
					{@const title = pickLocalized(work.title, lang)}
					{@const summary = pickLocalized(work.summary, lang)}
					<ThumbnailCard
						variant="bordered"
						hover
						thumbnailUrl={work.thumbnail?.src}
						thumbnailDarkUrl={work.thumbnail?.darkSrc}
						thumbnailAlt={title.value}
						href={localeHref(`/works/${work.slug}`)}
					>
						<h3 class="work-title" lang={title.locale}>{title.value}</h3>
						<p class="work-description" lang={summary.locale}>{summary.value}</p>
					</ThumbnailCard>
				{/each}
			</div>
		{/if}
	</div>

	<div class="back-link">
		<a href={localeHref("/")}>← {m.common_backToHome()}</a>
	</div>
</section>

<style>
	.works-page {
		padding: var(--space-16) 0;
	}

	.page-title {
		font-size: var(--text-4xl);
		font-weight: 700;
		margin-bottom: var(--space-8);
	}

	.works-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--space-6);
	}

	.back-link {
		margin-top: var(--space-12);
		text-align: center;
	}
	.back-link a {
		color: var(--color-link-hover);
		text-decoration: none;
		font-size: var(--text-lg);
	}
</style>
