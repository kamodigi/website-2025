<script lang="ts">
	import { asset } from "$app/paths";
	import { localeHref } from "$lib/i18n";
	import { page } from "$app/state";
	import { absoluteUrl, ogImageUrl } from "$lib/utils/seo";
	import JapaneseOnlyBadge from "$lib/components/ui/JapaneseOnlyBadge.svelte";
	import ThumbnailCard from "$lib/components/ui/ThumbnailCard.svelte";
	import { m } from "$lib/paraglide/messages";
	import { getLocale } from "$lib/paraglide/runtime";
	import type { PageData } from './$types';

	export let data: PageData;

	const { blog, relatedBlogs } = data;

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
	<title>{blog.metadata.title}</title>
	<meta name="description" content={blog.metadata.description} />
	<meta property="og:title" content={blog.metadata.title} />
	<meta property="og:description" content={blog.metadata.description} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={absoluteUrl(page.url.pathname)} />
	<meta property="og:image" content={ogImageUrl(blog.metadata.thumbnail)} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<article class="blog-detail">
	<div class="container">
		<div class="header">
			<a href={localeHref("/blog")} class="back-link">
				← {m.blog_backToList()}
			</a>
		</div>

		<!-- 記事ヘッダー -->
		<header class="article-header">
			<div class="article-meta">
				<time class="article-date" datetime={blog.metadata.publishedAt}>
					{formatDate(blog.metadata.publishedAt)}
				</time>
				{#if blog.metadata.updatedAt}
					<span class="article-updated">
						{m.blog_updated({ date: formatDate(blog.metadata.updatedAt) })}
					</span>
				{/if}
				<JapaneseOnlyBadge />
			</div>
			<h1 class="article-title" lang="ja">{blog.metadata.title}</h1>
			<p class="article-description" lang="ja">{blog.metadata.description}</p>
			<div class="article-tags">
				{#each blog.metadata.tags as tag (tag)}
					<span class="tag">{tag}</span>
				{/each}
			</div>
		</header>

		<!-- サムネイル画像 -->
		{#if blog.metadata.thumbnail}
			<div class="article-thumbnail">
				<img
					lang="ja"
					src={asset(blog.metadata.thumbnail)}
					alt={blog.metadata.title}
				/>
			</div>
		{/if}

		<!-- 記事コンテンツ -->
		<div class="article-content prose" lang="ja">
			{@html blog.content}
		</div>

		<!-- 関連記事 -->
		{#if relatedBlogs.length > 0}
			<section class="related-section">
				<h2 class="related-title">{m.blog_related()}</h2>
				<div class="related-grid">
					{#each relatedBlogs as relatedBlog (relatedBlog.metadata.id)}
						{@const { title, description, tags, thumbnail, id } = relatedBlog.metadata}
						{@const thumbnailUrl = thumbnail ? asset(thumbnail) : undefined}
						<ThumbnailCard
							variant="bordered"
							hover
							{thumbnailUrl}
							thumbnailAlt=""
							gradientTitle={title}
							gradientTags={tags}
							gradientId={id}
							href={localeHref(`/blog/${id}`)}
						>
							<div class="related-content" lang="ja">
								<h3 class="related-blog-title">{title}</h3>
								<p class="related-blog-description">{description}</p>
							</div>
						</ThumbnailCard>
					{/each}
				</div>
			</section>
		{/if}

		<div class="back-link-bottom">
			<a href={localeHref("/blog")}>← {m.blog_backToList()}</a>
		</div>
	</div>
</article>

<style>
	.blog-detail {
		padding: var(--space-16) 0;
	}

	.header {
		margin-bottom: var(--space-8);
	}

	.back-link {
		display: inline-block;
		color: var(--color-text-secondary);
		text-decoration: none;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: var(--color-link);
	}

	.article-header {
		margin-bottom: var(--space-8);
	}

	.article-meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
		margin-bottom: var(--space-4);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.article-date {
		font-weight: 500;
	}

	/* 日付の途中（en の「May 14, / 2024」など）で折り返さず、日付の単位で折り返す */
	.article-date,
	.article-updated {
		white-space: nowrap;
	}

	.article-updated {
		font-size: var(--text-xs);
	}

	.article-title {
		font-size: var(--text-4xl);
		font-weight: 700;
		line-height: 1.2;
		margin-bottom: var(--space-4);
	}

	.article-description {
		font-size: var(--text-lg);
		color: var(--color-text-secondary);
		line-height: 1.6;
		margin-bottom: var(--space-4);
	}

	.article-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.tag {
		padding: var(--space-1) var(--space-3);
		background: var(--color-surface);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.article-thumbnail {
		margin-bottom: var(--space-8);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.article-thumbnail img {
		width: 100%;
		height: auto;
		display: block;
	}

	.article-content {
		max-width: 720px;
		margin: 0 auto var(--space-16);
	}

	.related-section {
		margin-top: var(--space-16);
		padding-top: var(--space-8);
		border-top: 1px solid var(--color-border);
	}

	.related-title {
		font-size: var(--text-2xl);
		font-weight: 700;
		margin-bottom: var(--space-6);
	}

	.related-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--space-4);
	}

	.related-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.related-blog-title {
		font-size: var(--text-lg);
		font-weight: 600;
		line-height: 1.4;
	}

	.related-blog-description {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: 1.5;
	}

	.back-link-bottom {
		margin-top: var(--space-12);
		text-align: center;
	}

	.back-link-bottom a {
		color: var(--color-link-hover);
		text-decoration: none;
		font-size: var(--text-lg);
	}
</style>
