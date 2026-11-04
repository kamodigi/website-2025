<script lang="ts">
	import { asset, resolve } from "$app/paths";
	import { page } from "$app/state";
	import { absoluteUrl, ogImageUrl } from "$lib/utils/seo";
	import JapaneseOnlyBadge from "$lib/components/ui/JapaneseOnlyBadge.svelte";
	import ThumbnailCard from "$lib/components/ui/ThumbnailCard.svelte";
	import type { PageData } from './$types';

	export let data: PageData;

	const { blog, relatedBlogs } = data;

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('ja', {
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
			<a href={resolve("/blog")} class="back-link">
				← 記事一覧へ戻る
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
						(更新: {formatDate(blog.metadata.updatedAt)})
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
					src={asset(blog.metadata.thumbnail)}
					alt={blog.metadata.title}
				/>
			</div>
		{/if}

		<!-- 記事コンテンツ -->
		<div class="article-content" lang="ja">
			{@html blog.content}
		</div>

		<!-- 関連記事 -->
		{#if relatedBlogs.length > 0}
			<section class="related-section">
				<h2 class="related-title">関連記事</h2>
				<div class="related-grid">
					{#each relatedBlogs as relatedBlog (relatedBlog.metadata.id)}
						{@const { title, description, tags, thumbnail, id } = relatedBlog.metadata}
						{@const thumbnailUrl = thumbnail ? asset(thumbnail) : undefined}
						<ThumbnailCard
							variant="bordered"
							hover
							{thumbnailUrl}
							thumbnailAlt={title}
							gradientTitle={title}
							gradientTags={tags}
							gradientId={id}
							href={resolve(`/blog/${id}`)}
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
			<a href={resolve("/blog")}>← 記事一覧へ戻る</a>
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
		gap: var(--space-2);
		align-items: center;
		margin-bottom: var(--space-4);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.article-date {
		font-weight: 500;
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
		font-size: var(--text-base);
		line-height: 1.8;
		color: var(--color-text);
	}

	.article-content :global(h2) {
		font-size: var(--text-2xl);
		font-weight: 700;
		margin-top: var(--space-12);
		margin-bottom: var(--space-4);
		border-bottom: 2px solid var(--color-border);
		padding-bottom: var(--space-2);
	}

	.article-content :global(h3) {
		font-size: var(--text-xl);
		font-weight: 600;
		margin-top: var(--space-8);
		margin-bottom: var(--space-3);
	}

	.article-content :global(h4) {
		font-size: var(--text-lg);
		font-weight: 600;
		margin-top: var(--space-6);
		margin-bottom: var(--space-2);
	}

	.article-content :global(p) {
		margin-bottom: var(--space-4);
	}

	.article-content :global(ul),
	.article-content :global(ol) {
		margin-bottom: var(--space-4);
		padding-left: var(--space-6);
	}

	.article-content :global(li) {
		margin-bottom: var(--space-2);
	}

	.article-content :global(pre) {
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		margin-bottom: var(--space-4);
		overflow-x: auto;
	}

	.article-content :global(code) {
		background: var(--color-surface);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		font-size: 0.9em;
		font-family: 'Courier New', monospace;
	}

	.article-content :global(pre code) {
		background: none;
		padding: 0;
	}

	.article-content :global(blockquote) {
		border-left: 4px solid var(--color-brand);
		padding-left: var(--space-4);
		margin: var(--space-6) 0;
		color: var(--color-text-secondary);
		font-style: italic;
	}

	.article-content :global(a) {
		color: var(--color-link);
		text-decoration: underline;
	}

	.article-content :global(a:hover) {
		color: var(--color-link-hover);
	}

	.article-content :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: var(--radius-lg);
		margin: var(--space-6) 0;
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
