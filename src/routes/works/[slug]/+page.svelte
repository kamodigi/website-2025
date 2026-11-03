<script lang="ts">
  import { asset, resolve } from "$app/paths";
  import { getWorkBySlugRemote } from "$lib/data/works/data.remote.js";
  import { m } from "$lib/paraglide/messages";
  import { getLocale } from "$lib/paraglide/runtime.js";
  import { pickLocalized } from "$lib/i18n";
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
      <a href={resolve("/works")} class="back-link"
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
      {@const images = [
        work.metadata.images.thumbnail,
        ...work.metadata.images.gallery,
      ]}
      {@const { thumbnail, gallery } = work.metadata.images}
      {@const title = pickLocalized(work.metadata.title, lang)}
      {@const content = pickLocalized(work.content, lang)}
      <div class="content">
        <div class="gallery">
          <TinySlider>
            <img src={asset(thumbnail)} alt="サムネイル" />
            {#each gallery as image (image.toString())}
              <img src={asset(image)} alt={title.value} />
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
                    <img
                      src={asset(image)}
                      alt={`Pic ${i}`}
                      class="thumbnail"
                    />
                  </button>
                {/each}
              </div>
            {/snippet}
          </TinySlider>
        </div>
        <h2 lang={title.locale}>{title.value}</h2>
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

  img {
    max-width: 720px;
    border-radius: 8px;
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

  .thumbnail {
    width: 120px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
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
    border-radius: 8px;
  }

  /* Responsive layout */
  @media (min-width: 768px) {
    .content {
      grid-template-columns: 2fr 1fr;
    }
  }
</style>
