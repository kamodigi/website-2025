<script lang="ts">
  // サイト全体のエラーページ。表示のたびに PocketBase から読むページ（制作実績の一覧・詳細・プレビュー）が
  // PocketBase に届かないときは 503 になり、ここに来る。ほかのページはプリレンダーなので PocketBase を見ない
  import { page } from "$app/state";
  import { localeHref } from "$lib/i18n";
  import { m } from "$lib/paraglide/messages";

  const PREVIEW_ROUTE = "/preview";

  const messages = $derived.by(() => {
    if (page.status === 404) return { title: m.error_notFound_title(), body: m.error_notFound_body() };
    if (page.status === 503) return { title: m.error_unavailable_title(), body: m.error_unavailable_body() };
    if (page.route.id === PREVIEW_ROUTE && (page.status === 400 || page.status === 401)) {
      return { title: m.error_preview_title(), body: m.error_preview_body() };
    }
    return { title: m.error_generic_title(), body: m.error_generic_body() };
  });
</script>

<svelte:head>
  <title>{messages.title}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="error-page">
  <div class="container">
    <p class="status">{m.error_status({ status: page.status })}</p>
    <h1 class="title">{messages.title}</h1>
    <p class="body">{messages.body}</p>
    <p class="back-link">
      <a href={localeHref("/")}>← {m.common_backToHome()}</a>
    </p>
  </div>
</section>

<style>
  .error-page {
    padding: var(--space-16) 0;
  }

  .status {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    margin-bottom: var(--space-2);
  }

  .title {
    font-size: var(--text-4xl);
    font-weight: 700;
    margin-bottom: var(--space-6);
  }

  .body {
    color: var(--color-text-secondary);
    max-width: 40em;
  }

  .back-link {
    margin-top: var(--space-12);
  }

  .back-link a {
    color: var(--color-link-hover);
    text-decoration: none;
    font-size: var(--text-lg);
  }
</style>
