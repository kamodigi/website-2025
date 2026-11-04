<script lang="ts">
import { asset } from '$app/paths';
import { localeHref } from '$lib/i18n';
import JapaneseOnlyBadge from '$lib/components/ui/JapaneseOnlyBadge.svelte';
import ThumbnailCard from '$lib/components/ui/ThumbnailCard.svelte';
import { getBlogs } from '$lib/data/blog';

// 最新3件の記事を取得
const blogsPromise = getBlogs({ excludeDrafts: true }, 'newest');

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('ja', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(date);
}
</script>

<section id="blog" class="section blog-section">
	<div class="container">
		<div class="section-header">
			<h2 class="section-title">技術記事</h2>
			<a href={localeHref("/blog")} class="view-all-link">すべての記事を見る &rarr;</a>
		</div>
		{#await blogsPromise}
			<p class="loading-message">Loading articles...</p>
		{:then blogs}
			{#if blogs.length === 0}
				<p class="no-blogs-message">記事がまだありません。</p>
			{:else}
				<div class="blogs-grid">
					{#each blogs.slice(0, 3) as blog (blog.metadata.id)}
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
										<time class="blog-date" datetime={publishedAt} lang="ja">
											{formatDate(publishedAt)}
										</time>
										<JapaneseOnlyBadge />
									</div>
									<h3 class="blog-title" lang="ja">{title}</h3>
									<p class="blog-description" lang="ja">{description}</p>
									<div class="blog-tags">
										{#each tags.slice(0, 3) as tag (tag)}
											<span class="tag">{tag}</span>
										{/each}
									</div>
								</div>
							</ThumbnailCard>
						</article>
					{/each}
				</div>
			{/if}
		{:catch error}
			<p class="error-message">Error loading articles: {error.message}</p>
		{/await}
	</div>
</section>

<style>
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-6);
	}

	.view-all-link {
		color: var(--color-text-secondary);
		transition: color var(--transition-fast);
		text-decoration: none;
	}

	.view-all-link:hover {
		color: var(--color-link);
	}

	.blogs-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--space-6);
	}

	.blog-card {
		height: 100%;
	}

	.blog-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
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
		font-size: var(--text-lg);
		font-weight: 600;
		line-height: 1.4;
	}

	.blog-description {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: 1.5;
	}

	.blog-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}

	.tag {
		padding: var(--space-1) var(--space-2);
		background: var(--color-surface);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.loading-message,
	.no-blogs-message,
	.error-message {
		text-align: center;
		padding: var(--space-8);
		color: var(--color-text-secondary);
	}
</style>
