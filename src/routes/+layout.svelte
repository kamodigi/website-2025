<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { initAnalytics, trackPageView } from "$lib/analytics";
  import SiteToolbar from "$lib/components/layout/SiteToolbar.svelte";
  import { m } from "$lib/paraglide/messages";
  import { baseLocale, deLocalizeHref, getLocale, locales, localizeHref } from "$lib/paraglide/runtime";
  import { absoluteUrl } from "$lib/utils/seo";
  import { onMount, type Snippet } from "svelte";
  import "../lib/styles/global.css";

  const { children }: { children: Snippet } = $props();

  const year = new Date().getFullYear();

  const locale = getLocale();
  // 中国語のページでだけ読み込む（日本語のページの読み込みは増やさない）。font-family は variables.css で切り替える
  const CHINESE_FONTS: Partial<Record<typeof locale, string>> = {
    "zh-Hans": "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100..900&display=swap",
    "zh-Hant": "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@100..900&display=swap",
  };
  const chineseFont = CHINESE_FONTS[locale];

  // hreflang 用に、同じページのほかの言語の URL を出す。プリレンダーするのでパスだけを使う
  const basePath = $derived(deLocalizeHref(page.url.pathname));

  // 初回表示とクライアント側の遷移ごとに 1 回ずつページビューを送る。
  // 初回は onMount で送る（このプロジェクトでは afterNavigate の type: "enter" が呼ばれないため。
  // 将来呼ばれるようになっても二重にならないよう、afterNavigate 側では enter を無視する）。
  onMount(() => {
    initAnalytics();
    trackPageView(new URL(window.location.href));
  });

  // 同じページ内のアンカー移動（#contact など）は数えない。
  afterNavigate(({ type, from, to }) => {
    if (type === "enter" || !from || !to) return;
    if (from.url.pathname === to.url.pathname && from.url.search === to.url.search) return;
    trackPageView(to.url);
  });
</script>

<svelte:head>
  {#if chineseFont}
    <link rel="stylesheet" href={chineseFont} />
  {/if}
  {#each locales as hreflang (hreflang)}
    <link rel="alternate" {hreflang} href={absoluteUrl(localizeHref(basePath, { locale: hreflang }))} />
  {/each}
  <link rel="alternate" hreflang="x-default" href={absoluteUrl(localizeHref(basePath, { locale: baseLocale }))} />
  <script
    async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8951400341045454"
    crossorigin="anonymous"
  ></script>
</svelte:head>

<SiteToolbar />

<div class="layout">
  <main id="main-content" class="main-content">
    {@render children()}
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <a href={resolve("/privacy")} class="footer-link">{m.footer_privacy()}</a>
      <small class="footer-copyright">{m.footer_copyright({ year })}</small>
    </div>
  </footer>
</div>

<style>
  .layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .main-content {
    flex: 1;
    margin-top: 0px;
    width: 100%;
  }

  .site-footer {
    border-top: 1px solid var(--color-border);
    padding: var(--space-8) 0;
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .footer-inner {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
  }

  .footer-link {
    color: var(--color-text-secondary);
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  .footer-link:hover {
    color: var(--color-link-hover);
  }
</style>
