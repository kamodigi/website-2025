<script lang="ts">
	import { asset } from "$app/paths";
	import { localeHref } from "$lib/i18n";
	import JapaneseOnlyBadge from "$lib/components/ui/JapaneseOnlyBadge.svelte";
	import ThumbnailCard from "$lib/components/ui/ThumbnailCard.svelte";
	import { m } from "$lib/paraglide/messages";
	import { getLocale } from "$lib/paraglide/runtime";
	import type { PageData } from './$types';

	export let data: PageData;

	// タグのフィルタリング用
	let selectedTag: string | null = null;

	// すべてのタグを収集
	$: allTags = Array.from(
		new Set(data.blogs.flatMap(blog => blog.metadata.tags))
	).sort();

	// フィルタリングされたブログ
	$: filteredBlogs = selectedTag
		? data.blogs.filter(blog => blog.metadata.tags.includes(selectedTag as string))
		: data.blogs;

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		// 日付は UI の一部なので、ページの言語の書式にする（記事の本文と違って翻訳する）
		return new Intl.DateTimeFormat(getLocale(), {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(date);
	}
</script>

<svelte:head>
	<title>{m.sections_blog()}</title>
	<meta name="description" content={m.blog_meta_description()} />
</svelte:head>

<section class="blog-page">
	<div class="container">
		<h1 class="page-title">{m.sections_blog()}</h1>
		<p class="page-description">{m.blog_description()}</p>

		<!-- タグフィルター -->
		{#if allTags.length > 0}
			<div class="tags-filter">
				<button
					class="tag-button"
					class:active={selectedTag === null}
					on:click={() => selectedTag = null}
				>
					{m.blog_filter_all()}
				</button>
				{#each allTags as tag (tag)}
					<button
						class="tag-button"
						class:active={selectedTag === tag}
						on:click={() => selectedTag = tag}
					>
						{tag}
					</button>
				{/each}
			</div>
		{/if}

		<!-- ブログ記事一覧 -->
		{#if filteredBlogs.length === 0}
			<p class="no-blogs-message">{m.blog_empty()}</p>
		{:else}
			<div class="blogs-grid">
				{#each filteredBlogs as blog (blog.metadata.id)}
					{@const { title, description, tags, publishedAt, thumbnail, id } = blog.metadata}
					{@const thumbnailUrl = thumbnail ? asset(thumbnail) : undefined}
					<article class="blog-card">
						<ThumbnailCard
							variant="bordered"
							hover
							{thumbnailUrl}
							thumbnailAlt={title}
							gradientTitle={title}
							gradientTags={tags}
							gradientId={id}
							href={localeHref(`/blog/${id}`)}
						>
							<div class="blog-content">
								<div class="blog-meta">
									<time class="blog-date" datetime={publishedAt}>
										{formatDate(publishedAt)}
									</time>
									<JapaneseOnlyBadge />
								</div>
								<h2 class="blog-title" lang="ja">{title}</h2>
								<p class="blog-description" lang="ja">{description}</p>
								<div class="blog-tags">
									{#each tags as tag (tag)}
										<span class="tag">{tag}</span>
									{/each}
								</div>
							</div>
						</ThumbnailCard>
					</article>
				{/each}
			</div>
		{/if}
	</div>

	<div class="back-link">
		<a href={localeHref("/")}>← {m.common_backToHome()}</a>
	</div>
</section>

<style>
	.blog-page {
		padding: var(--space-16) 0;
	}

	.page-title {
		font-size: var(--text-4xl);
		font-weight: 700;
		margin-bottom: var(--space-4);
	}

	.page-description {
		font-size: var(--text-lg);
		color: var(--color-text-secondary);
		margin-bottom: var(--space-8);
	}

	.tags-filter {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-8);
	}

	.tag-button {
		padding: var(--space-2) var(--space-4);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--color-text);
		cursor: pointer;
		font-size: var(--text-sm);
		transition: all 0.2s;
	}

	.tag-button:hover {
		background: var(--color-surface);
	}

	.tag-button.active {
		background: var(--color-primary-fill);
		color: var(--color-on-primary-fill);
		border-color: var(--color-primary-fill);
	}

	.blogs-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: var(--space-6);
	}

	.blog-card {
		height: 100%;
	}

	.blog-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.blog-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
	}

	.blog-date {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.blog-title {
		font-size: var(--text-xl);
		font-weight: 600;
		line-height: 1.4;
	}

	.blog-description {
		font-size: var(--text-base);
		color: var(--color-text-secondary);
		line-height: 1.6;
	}

	.blog-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}

	.tag {
		padding: var(--space-1) var(--space-3);
		background: var(--color-surface);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.no-blogs-message {
		text-align: center;
		padding: var(--space-16);
		color: var(--color-text-secondary);
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
