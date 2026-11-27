<script lang="ts">
import { browser } from '$app/environment';
import { localeHref } from '$lib/i18n';
import ThumbnailCard from '$lib/components/ui/ThumbnailCard.svelte';
import { getWorks } from '$lib/data/works/works.remote';
import { m } from '$lib/paraglide/messages';
import { getLocale } from '$lib/paraglide/runtime.js';
import { pickLocalized } from '$lib/i18n';

// トップページはプリレンダーするので、制作実績はブラウザで開いたときに読む（ビルドのときには PocketBase を見ない）
const query = browser ? getWorks() : undefined
const lang = getLocale()

</script>

<section id="works" class="section works-section">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">{m.sections_works()}</h2>
      <a href={localeHref("/works")} class="view-all-link">{m.view_all_works()} &rarr;</a>
    </div>
    {#if query?.error}
      <p class="error-message">{m.works_unavailable()}</p>
    {:else if !query?.current}
      <p class="loading-message">{m.works_loading()}</p>
    {:else if query.current.length === 0}
      <p class="no-works-message">{m.works_empty()}</p>
    {:else}
      <div class="works-grid">
        {#each query.current as work (work.slug)}
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
</section>

<style>
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-6); /* h2の元のmargin-bottomに合わせる */
  }

  .view-all-link {
    color: var(--color-text-secondary);
    transition: color var(--transition-fast);
  }
  .view-all-link:hover {
    color: var(--color-link);
  }

  .works-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
</style>