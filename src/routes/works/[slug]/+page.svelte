<script lang="ts">
  import { asset } from "$app/paths";
  import { localeHref } from "$lib/i18n";
  import { getWorkBySlugRemote } from "$lib/data/works/data.remote.js";
  import { m } from "$lib/paraglide/messages";
  import { getLocale } from "$lib/paraglide/runtime.js";
  import { localizeHtmlLinks, pickLocalized } from "$lib/i18n";
  import ThemedImage from "$lib/components/ui/ThemedImage.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { TinySlider } from "svelte-tiny-slider";
  import { tick, untrack } from "svelte";

  // Get the slug from the URL using $props()
  const { params } = $props();
  const { slug } = params;
  const query = getWorkBySlugRemote(slug);
  const lang = getLocale();

  // 製品ページ（LP）がある WORK。詳細ページの一番上に、製品ページへのボタンを出す
  const PRODUCT_PAGES: Record<string, string> = {
    promptnotes: localeHref("/promptnotes"),
  };
  const productPage = PRODUCT_PAGES[slug];

  // svelte-tiny-slider は表示中のスライドの位置を px で持ち、幅が変わっても計算し直さない。
  // 画面の回転やウィンドウのリサイズで位置がずれるので、幅が変わったら今のスライドに合わせ直す
  let slider = $state<InstanceType<typeof TinySlider>>();
  let sliderWidth = $state(0);
  let maxWidth = $state(0);
  let currentIndex = $state(0);
  // h1 とタイトルは作品名。読み込み前・エラー時・見つからないときは固定の「WORK 詳細」にする
  const work = $derived(query.current);
  const heading = $derived(work ? pickLocalized(work.metadata.title, lang) : undefined);
  $effect(() => {
    // maxWidth（全スライドの幅の合計）は ResizeObserver で遅れて入る。入る前に setIndex すると、
    // maxWidth - sliderWidth がマイナスになり、位置がマイナスの端に飛ぶ（直接開いた直後に 1 枚分ずれる）
    if (!sliderWidth || maxWidth < sliderWidth) return;
    tick().then(() => untrack(() => slider?.setIndex(currentIndex)));
  });
</script>

<svelte:head>
  <title>{heading?.value ?? m.work_title()}</title>
  <meta name="description" content={m.work_title()} />
</svelte:head>

<section class="detail">
  <div class="container">
    <div class="header">
      <a href={localeHref("/works")} class="back-link"
        >&larr; {m.work_backToWorks()}</a
      >
      <h1 class="title" lang={heading?.locale}>{heading?.value ?? m.work_title()}</h1>
      {#if productPage}
        <Button href={productPage}>{m.work_productPage()}</Button>
      {/if}
    </div>

    {#if query.error}
      <p class="error-message">{m.work_error({ message: query.error.message })}</p>
    {:else if query.loading}
      <p class="loading-message">{m.work_loading()}</p>
    {:else if work}
      <!-- 画像のない WORK（portfolio など）では空のパスの img を出さない -->
      {@const images = [
        work.metadata.images.thumbnail,
        ...work.metadata.images.gallery,
      ].filter(Boolean)}
      {@const title = heading!}
      {@const content = pickLocalized(work.content, lang)}
      <div class="content">
        {#if images.length > 0}
        <div class="gallery">
          <TinySlider bind:this={slider} bind:sliderWidth bind:maxWidth bind:currentIndex>
            {#each images as image (image.toString())}
              <div class="slide">
                <ThemedImage src={asset(`/works/${image}`)} alt={title.value} />
              </div>
            {/each}

            {#snippet controls({ setIndex, currentIndex })}
              <div class="controls-wrapper">
                {#each images as image, i (image.toString())}
                  <button
                    class:active={i === currentIndex}
                    onclick={() => setIndex(i)}
                    onfocus={() => setIndex(i)}
                    aria-label={m.work_goToSlide({ index: i + 1 })}
                  >
                    <ThemedImage
                      src={asset(`/works/${image}`)}
                      alt=""
                      class="thumbnail"
                    />
                  </button>
                {/each}
              </div>
            {/snippet}
          </TinySlider>
        </div>
        {/if}
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
        <div class="prose" lang={content.locale}>
          {@html localizeHtmlLinks(content.value, lang)}
        </div>
      </div>
    {:else}
      <p class="not-found">{m.work_notFound()}</p>
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
    /* 影の余白は枠ではなく各スライドの内側に取る（枠の幅 = スライド 1 枚の幅にして、
       隣のスライドが見えないようにする）。余白の分だけ負のマージンで広げ、
       画像の見た目の位置と幅は本文にそろえる */
    --gallery-bleed: var(--space-4);
    margin: calc(-1 * var(--gallery-bleed));
    max-width: calc(720px + 2 * var(--gallery-bleed));
    /* スライドの幅をこの枠の幅にそろえるための基準 */
    container-type: inline-size;
  }

  /* .slider-content は width: fit-content の flex なので、スライドの幅は % ではなく
     コンテナ幅（cqw）で決める。flex-shrink で縮んで 1 行に並ぶのを防ぐ */
  .slide {
    flex: 0 0 100cqw;
    width: 100cqw;
    padding: var(--gallery-bleed);
  }

  /* display は書かない（ThemedImage が light-only / dark-only で出し分けている。global.css で img は block） */
  .slide :global(img) {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
    border-radius: var(--radius-lg);
    /* 背景が白い画像でもページの背景と見分けがつくように。ダークは影が見えないので縁も付ける */
    box-shadow: var(--shadow-md), 0 0 0 1px var(--color-image-ring);
  }

  .controls-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-4);
    /* サムネイルの影が枠で切れないように */
    padding: 0 var(--gallery-bleed) var(--gallery-bleed);
  }

  button {
    border: none;
  }

  .controls-wrapper :global(.thumbnail) {
    width: 120px;
    height: 60px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-sm), 0 0 0 1px var(--color-image-ring);
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
