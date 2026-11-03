<script lang="ts">
import { asset, resolve } from '$app/paths';
import ThumbnailCard from '$lib/components/ui/ThumbnailCard.svelte';
import { getWorksRemote } from '$lib/data/works/data.remote';
import { m } from '$lib/paraglide/messages';
import { getLocale } from '$lib/paraglide/runtime.js';
import { pickLocalized } from '$lib/i18n';

const query = getWorksRemote()
const lang = getLocale()

</script>

<section id="works" class="section works-section">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">{m.sections_works()}</h2>
      <a href={resolve("/works")} class="view-all-link">{m.view_all_works()} &rarr;</a>
    </div>
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
          {@const thumbnailUrl = images.thumbnail ? asset('works/' + images.thumbnail) : undefined}
            <ThumbnailCard
              variant="bordered"
              hover
              thumbnailUrl={thumbnailUrl}
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