<script lang="ts">
  import { asset } from "$app/paths";
  import { page } from "$app/state";
  import { track } from "$lib/analytics";
  import Button from "$lib/components/ui/Button.svelte";
  import Card from "$lib/components/ui/Card.svelte";
  import ThemedImage from "$lib/components/ui/ThemedImage.svelte";
  import {
    detectPlatform,
    fetchLatestRelease,
    PROMPTNOTES_COPY_LOCALES,
    PROMPTNOTES_NIX_COMMAND,
    PROMPTNOTES_RELEASES_URL,
    PROMPTNOTES_XATTR_COMMAND,
    type DownloadLink,
    type LatestRelease,
    type Platform,
  } from "$lib/data/promptnotes";
  import { displayedLocale, localeHref } from "$lib/i18n";
  import { m } from "$lib/paraglide/messages";
  import { getLocale } from "$lib/paraglide/runtime";
  import { absoluteUrl, ogImageUrl } from "$lib/utils/seo";
  import { onMount } from "svelte";

  // プリレンダーするので、OS と最新版はブラウザで決める。決まるまでは Releases のページへのリンクを出す
  let platform = $state<Platform | null>(null);
  let release = $state<LatestRelease | null>(null);
  let failed = $state(false);

  onMount(async () => {
    platform = detectPlatform(navigator);
    release = await fetchLatestRelease();
    failed = release === null;
  });

  const primary = $derived(
    platform && platform !== "other" ? release?.links.find((link) => link.platform === platform) : undefined,
  );
  const macLinks = $derived(release?.links.filter((link) => link.platform === "macos") ?? []);
  const linuxLinks = $derived(release?.links.filter((link) => link.platform === "linux") ?? []);

  function trackDownload(link: DownloadLink) {
    track("download_click", { platform: link.platform, format: link.format });
  }

  function trackReleasesPage() {
    track("download_click", { platform: platform ?? "unknown", format: "releases_page" });
  }

  // 文言のない言語では日本語などで表示するので、本文の lang を実際に表示する言語にする（WORKS の pickLocalized と同じ）
  const copyLang = displayedLocale(PROMPTNOTES_COPY_LOCALES, getLocale());

  const title = `${m.pn_meta_title()} | kamodigi`;
  const description = m.pn_hero_subtitle();

  const solutions = [
    { title: m.pn_solution_enter_title(), body: m.pn_solution_enter_body() },
    { title: m.pn_solution_shortcut_title(), body: m.pn_solution_shortcut_body() },
    { title: m.pn_solution_local_title(), body: m.pn_solution_local_body() },
  ];

  const features = [
    { title: m.pn_feature_markdown_title(), body: m.pn_feature_markdown_body() },
    { title: m.pn_feature_search_title(), body: m.pn_feature_search_body() },
    { title: m.pn_feature_tags_title(), body: m.pn_feature_tags_body() },
    { title: m.pn_feature_copy_title(), body: m.pn_feature_copy_body() },
    { title: m.pn_feature_autosave_title(), body: m.pn_feature_autosave_body() },
    { title: m.pn_feature_filter_title(), body: m.pn_feature_filter_body() },
  ];

  const installSteps = [
    m.pn_install_a_step1(),
    m.pn_install_a_step2(),
    m.pn_install_a_step3(),
    m.pn_install_a_step4(),
  ];
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={absoluteUrl(page.url.pathname)} />
  <meta property="og:image" content={ogImageUrl("/works/promptnotes/thumbnail-light.webp")} />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div lang={copyLang}>
<section class="section hero">
  <div class="container">
    <div class="hero-text">
      <p class="product-name">
        <img src={asset("/works/promptnotes/icon.webp")} alt="" width="40" height="40" class="product-icon" />
        promptnotes
      </p>
      <h1 class="hero-title">{m.pn_hero_title()}</h1>
      <p class="hero-subtitle">{m.pn_hero_subtitle()}</p>

      <div class="download">
        {#if primary}
          <Button href={primary.url} size="lg" onclick={() => trackDownload(primary)}>
            {primary.platform === "macos" ? m.pn_download_macos() : m.pn_download_linux()}
          </Button>
          <p class="download-note">
            {primary.platform === "macos"
              ? m.pn_download_note_macos({ version: release?.version ?? "" })
              : m.pn_download_note_linux({ version: release?.version ?? "" })}
          </p>
        {:else}
          <Button href={PROMPTNOTES_RELEASES_URL} external size="lg" onclick={trackReleasesPage}>
            {m.pn_download_releases()}
          </Button>
          {#if failed}
            <p class="download-note">{m.pn_download_note_failed()}</p>
          {:else if platform === "other"}
            <p class="download-note">{m.pn_download_note_other()}</p>
          {/if}
        {/if}
        <a href="#platforms" class="other-os-link">{m.pn_download_other_os()} &darr;</a>
      </div>
    </div>

    <div class="screenshot">
      <!-- ファーストビューの画像なので遅延読み込みにしない。幅と高さは feed-light / feed-dark.webp の実寸 -->
      <ThemedImage
        src={asset("/works/promptnotes/feed-light.webp")}
        alt={m.pn_screenshot_alt()}
        loading="eager"
        width={800}
        height={967}
      />
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2 class="section-title">{m.pn_problem_heading()}</h2>
    <p class="lead">{m.pn_problem_body()}</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2 class="section-title">{m.pn_solution_heading()}</h2>
    <ul class="card-grid">
      {#each solutions as item (item.title)}
        <li>
          <Card variant="bordered">
            <div class="card-body">
              <h3 class="card-title">{item.title}</h3>
              <p class="card-text">{item.body}</p>
            </div>
          </Card>
        </li>
      {/each}
    </ul>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2 class="section-title">{m.pn_features_heading()}</h2>
    <ul class="card-grid">
      {#each features as item (item.title)}
        <li>
          <Card variant="bordered">
            <div class="card-body">
              <h3 class="card-title">{item.title}</h3>
              <p class="card-text">{item.body}</p>
            </div>
          </Card>
        </li>
      {/each}
    </ul>
  </div>
</section>

<section class="section" id="install">
  <div class="container">
    <h2 class="section-title">{m.pn_install_heading()}</h2>
    <p class="lead">{m.pn_install_intro()}</p>

    <h3 class="sub-heading">{m.pn_install_a_heading()}</h3>
    <p class="text">{m.pn_install_a_lead()}</p>
    <ol class="steps">
      {#each installSteps as step (step)}
        <li>{step}</li>
      {/each}
    </ol>
    <p class="note">{m.pn_install_a_legacy()}</p>

    <h3 class="sub-heading">{m.pn_install_b_heading()}</h3>
    <p class="text">{m.pn_install_b_body()}</p>
    <pre class="code"><code>{PROMPTNOTES_XATTR_COMMAND}</code></pre>
  </div>
</section>

<section class="section" id="platforms">
  <div class="container">
    <h2 class="section-title">{m.pn_platforms_heading()}</h2>
    {#if release?.version}
      <p class="text">{m.pn_platforms_version({ version: release.version })}</p>
    {/if}

    {#snippet downloadLinks(links: DownloadLink[])}
      {#if links.length > 0}
        <ul class="format-links">
          {#each links as link (link.url)}
            <li>
              <Button href={link.url} variant="outline" size="sm" onclick={() => trackDownload(link)}>
                {link.label}
              </Button>
            </li>
          {/each}
        </ul>
      {/if}
    {/snippet}

    <dl class="platforms">
      <div class="platform">
        <dt>{m.pn_platforms_macos()}</dt>
        <dd>
          <p>{m.pn_platforms_macos_detail()}</p>
          {@render downloadLinks(macLinks)}
        </dd>
      </div>
      <div class="platform">
        <dt>{m.pn_platforms_linux()}</dt>
        <dd>
          <p>{m.pn_platforms_linux_detail()}</p>
          {@render downloadLinks(linuxLinks)}
          <p class="note">{m.pn_platforms_nix()}</p>
          <pre class="code"><code>{PROMPTNOTES_NIX_COMMAND}</code></pre>
        </dd>
      </div>
    </dl>
    <p class="note">{m.pn_platforms_unsupported()}</p>
    <p class="text">
      <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
      <a href={PROMPTNOTES_RELEASES_URL} target="_blank" rel="noopener noreferrer" class="text-link" onclick={trackReleasesPage}
        >{m.pn_platforms_releases()}<span class="visually-hidden">{m.a11y_opens_new_tab()}</span></a
      >
    </p>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2 class="section-title">{m.pn_behind_heading()}</h2>
    <p class="text">{m.pn_behind_body()}</p>
    <p class="text">
      <a href={localeHref("/works/promptnotes")} class="text-link">{m.pn_behind_link()} &rarr;</a>
    </p>
  </div>
</section>
</div>

<style>
  .hero {
    text-align: center;
  }

  .product-name {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    margin-bottom: var(--space-6);
  }

  .product-icon {
    border-radius: var(--radius-sm);
  }

  .hero-title {
    font-size: var(--text-5xl);
    font-weight: var(--font-bold);
    line-height: var(--leading-tight);
    margin-bottom: var(--space-4);
    /* 「安心して Enter を押そう。」を語の途中で折り返さない（空白の位置でだけ折り返す） */
    word-break: keep-all;
    text-wrap: balance;
  }

  /* 見出しを文節の途中で折り返さない（対応しているブラウザだけ） */
  .section-title {
    word-break: auto-phrase;
    text-wrap: balance;
  }

  /*
   * 中国語は auto-phrase が効かず、balance だと「提示／词」のように語の途中で折り返す。
   * 空白と句読点（「，」など）の後でだけ折り返し、それでも収まらないときだけ、はみ出す位置で折り返す
   */
  .section-title:lang(zh) {
    word-break: keep-all;
    overflow-wrap: anywhere;
    text-wrap: wrap;
  }

  .hero-subtitle {
    font-size: var(--text-xl);
    color: var(--color-text-secondary);
    line-height: var(--leading-relaxed);
    margin-bottom: var(--space-8);
  }

  @media (max-width: 767px) {
    .hero-title {
      font-size: var(--text-3xl);
    }

    .hero-subtitle {
      font-size: var(--text-lg);
    }
  }

  .download {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
  }

  .download-note {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  /* 中国語で「载。」のように 1〜2 文字だけの行が残らないようにする */
  .download-note:lang(zh) {
    text-wrap: pretty;
  }

  .other-os-link,
  .text-link {
    color: var(--color-link);
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  .other-os-link {
    font-size: var(--text-sm);
  }

  .other-os-link:hover,
  .text-link:hover {
    color: var(--color-link);
    text-decoration-thickness: 2px;
  }

  .screenshot {
    margin-top: var(--space-12);
  }

  /* display は ThemedImage がテーマの出し分けに使うので、ここでは指定しない */
  .screenshot :global(img) {
    max-width: 100%;
    height: auto;
    margin: 0 auto;
    /* 画像は macOS のウィンドウの形に切り抜いてあり、角の外側は透明で、輪郭は画像自身が持っている。
       border / border-radius / box-shadow を付けると四角い外形に付いて輪郭が二重になるので、
       透明部分に沿う drop-shadow だけにする */
    filter: drop-shadow(var(--drop-shadow-lg));
  }

  .lead {
    font-size: var(--text-lg);
    color: var(--color-text-secondary);
    line-height: var(--leading-relaxed);
  }

  .text {
    color: var(--color-text-secondary);
    line-height: var(--leading-relaxed);
  }

  .text + .text {
    margin-top: var(--space-3);
  }

  .note {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    line-height: var(--leading-relaxed);
    margin-top: var(--space-4);
  }

  .card-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-6);
    list-style: none;
    padding: 0;
    margin: 0;
  }

  /* .container は 720px までなので、3 列にすると窮屈になる。2 列まで */
  @media (min-width: 768px) {
    .card-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    /* 枚数が奇数のとき（解決の 3 枚）、最後の 1 枚が左に残らないように 2 列分に広げる */
    .card-grid > li:last-child:nth-child(odd) {
      grid-column: 1 / -1;
    }
  }

  .card-grid > li,
  .card-grid > li > :global(.card) {
    height: 100%;
  }

  .card-body {
    padding: var(--space-5);
  }

  .card-title {
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    margin-bottom: var(--space-2);
  }

  .card-text {
    color: var(--color-text-secondary);
    line-height: var(--leading-relaxed);
  }

  .sub-heading {
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    margin-top: var(--space-10);
    margin-bottom: var(--space-3);
  }

  .steps {
    margin: var(--space-4) 0 0;
    padding-left: var(--space-6);
    line-height: var(--leading-relaxed);
  }

  .steps li + li {
    margin-top: var(--space-2);
  }

  .code {
    margin-top: var(--space-4);
    padding: var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    overflow-x: auto;
  }

  .platforms {
    display: grid;
    gap: var(--space-6);
    margin: var(--space-6) 0 0;
  }

  .platform {
    padding-bottom: var(--space-6);
    border-bottom: 1px solid var(--color-border);
  }

  dt {
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    margin-bottom: var(--space-2);
  }

  dd {
    margin: 0;
    color: var(--color-text-secondary);
    line-height: var(--leading-relaxed);
  }

  .format-links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    list-style: none;
    padding: 0;
    margin: var(--space-3) 0 0;
  }
</style>
