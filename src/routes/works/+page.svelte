<script lang="ts">
	import { asset, resolve } from "$app/paths";
	import ThumbnailCard from "$lib/components/ui/ThumbnailCard.svelte";
	import { getWorksRemote } from "$lib/data/works/data.remote";
	import { m } from "$lib/paraglide/messages";
	import { getLocale } from "$lib/paraglide/runtime";
	import { pickLocalized } from '$lib/i18n';

	const query = getWorksRemote();
	const lang = getLocale();
</script>

<svelte:head>
	<title>{m.sections_works()}</title>
	<meta name="description" content={m.works_description()} />
</svelte:head>

<section class="works-page">
	<div class="container">
		<h1 class="page-title">{m.sections_works()}</h1>
		{#if query.error}
			<p class="error-message">Error loading works: {query.error.message}</p>
		{:else if query.loading}
			<p class="loading-message">Loading works...</p>
		{:else if query.current}
			{#if query.current.length === 0}
				<p class="no-works-message">No works found.</p>
			{:else}
				<div class="works-grid">
					{#each query.current as work (work.metadata.id)}
						{@const { images, id } = work.metadata}
						{@const title = pickLocalized(work.metadata.title, lang)}
						{@const shortDescription = pickLocalized(work.metadata.shortDescription, lang)}
						{@const thumbnailUrl = images.thumbnail
							? asset("works/" + images.thumbnail)
							: undefined}
						<ThumbnailCard
							variant="bordered"
							hover
							{thumbnailUrl}
							thumbnailAlt={title.value}
							href={resolve(`/works/${id}`)}
						>
							<h3 class="work-title" lang={title.locale}>{title.value}</h3>
							<p class="work-description" lang={shortDescription.locale}>{shortDescription.value}</p>
						</ThumbnailCard>
					{/each}
				</div>
			{/if}
		{/if}
	</div>

	<div class="back-link">
		<a href={resolve("/")}>← トップページへ戻る</a>
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
