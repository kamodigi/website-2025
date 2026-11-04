<script lang="ts">
  import { asset } from "$app/paths";
  import { localeHref } from "$lib/i18n";
  import { getWorkBySlugRemote } from "$lib/data/works/data.remote.js";
  import { m } from "$lib/paraglide/messages";
  import { getLocale } from "$lib/paraglide/runtime.js";
  import { pickLocalized } from "$lib/i18n";
  import ThemedImage from "$lib/components/ui/ThemedImage.svelte";
  import { TinySlider } from "svelte-tiny-slider";

  // Get the slug from the URL using $props()
  const { params } = $props();
  const { slug } = params;
  const query = getWorkBySlugRemote(slug);
  const lang = getLocale();
</script>

<svelte:head>
  <title>{m.work_title()} - {slug}</title>
  <meta name="description" content={m.work_title()} />
</svelte:head>

<section class="detail">
  <div class="container">
    <div class="header">
      <a href={localeHref("/works")} class="back-link"
        >&larr; {m.work_backToWorks()}</a
      >
      <h1 class="title">{m.work_title()} - {slug}</h1>
    </div>

    {#if query.error}
      <p class="error-message">Error loading work: {query.error.message}</p>
    {:else if query.loading}
      <p class="loading-message">Loading work...</p>
    {:else if query.current}
      {@const work = query.current}
      <!-- 画像のない WORK（portfolio など）では空のパスの img を出さない -->
      {@const images = [
        work.metadata.images.thumbnail,
        ...work.metadata.images.gallery,
      ].filter(Boolean)}
      {@const title = pickLocalized(work.metadata.title, lang)}
      {@const content = pickLocalized(work.content, lang)}
      <div class="content">
        {#if images.length > 0}
        <div class="gallery">
          <TinySlider>
            {#each images as image (image.toString())}
              <ThemedImage src={asset(`/works/${image}`)} alt={title.value} />
            {/each}

            {#snippet controls({ setIndex, currentIndex })}
              <div class="controls-wrapper">
                {#each images as image, i (image.toString())}
                  <button
                    class:active={i === currentIndex}
                    onclick={() => setIndex(i)}
                    onfocus={() => setIndex(i)}
                    aria-label="Go to slide {i + 1}"
                  >
                    <ThemedImage
                      src={asset(`/works/${image}`)}
                      alt={`Pic ${i}`}
                      class="thumbnail"
                    />
                  </button>
                {/each}
              </div>
            {/snippet}
          </TinySlider>
        </div>
        {/if}
        <h2 lang={title.locale}>{title.value}</h2>
        {#if work.metadata.links.demo || work.metadata.links.github || work.metadata.links.website}
          <!-- eslint-disable svelte/no-navigation-without-resolve -->
          <ul class="links">
            {#if work.metadata.links.demo}
              <li><a href={work.metadata.links.demo} target="_blank" rel="noopener noreferrer">{m.work_viewDemo()}</a></li>
            {/if}
            {#if work.metadata.links.github}
              <li><a href={work.metadata.links.github} target="_blank" rel="noopener noreferrer">{m.work_viewCode()}</a></li>
            {/if}
            {#if work.metadata.links.website}
              <li><a href={work.metadata.links.website} target="_blank" rel="noopener noreferrer">{m.work_viewSite()}</a></li>
            {/if}
          </ul>
          <!-- eslint-enable svelte/no-navigation-without-resolve -->
        {/if}
        <div lang={content.locale}>
          {@html content.value}
        </div>
      </div>
    {:else}
      <p class="not-found">Work data not found.</p>
    {/if}
  </div>
</section>

<style>
  .detail {
    padding: var(--space-16) 0;
  }

  .header {
    margin-bottom: var(--space-8);
  }

  .gallery {
    position: relative;
    overflow: hidden;
  }

  .gallery :global(img) {
    max-width: min(100%, 720px);
    max-height: 70vh;
    object-fit: contain;
    border-radius: var(--radius-lg);
  }

  .controls-wrapper {
    margin-top: var(--space-4);
  }

  .controls-wrapper > * + * {
    margin-left: var(--space-2);
  }

  button {
    border: none;
  }

  .controls-wrapper :global(.thumbnail) {
    width: 120px;
    height: 60px;
    object-fit: cover;
    border-radius: var(--radius-sm);
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    list-style: none;
    padding: 0;
    margin: var(--space-2) 0 var(--space-4);
  }

  .back-link {
    display: inline-block;
    margin-bottom: var(--space-4);
    color: var(--color-text-secondary);
    transition: color var(--transition-fast);
  }

  .back-link:hover {
    color: var(--color-link);
  }

  .title {
    font-size: var(--text-4xl);
    font-weight: 700;
    margin-bottom: var(--space-6);
  }

  .content {
    /*display: flex;*/
    flex-direction: column;
    gap: var(--space-8);
  }

  .not-found {
    color: var(--color-text-muted);
    font-style: italic;
    text-align: center;
    padding: var(--space-8);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-lg);
  }

  /* Responsive layout */
  @media (min-width: 768px) {
    .content {
      grid-template-columns: 2fr 1fr;
    }
  }
</style>
