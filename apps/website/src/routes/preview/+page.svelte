<script lang="ts">
  import WorkDetail from "$lib/components/works/WorkDetail.svelte";
  import { pickLocalized } from "$lib/i18n";
  import { m } from "$lib/paraglide/messages";
  import { getLocale } from "$lib/paraglide/runtime.js";

  const { data } = $props();
  const title = $derived(pickLocalized(data.work.title, getLocale()));
</script>

<svelte:head>
  <title>{m.preview_titlePrefix()} {title.value}</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<WorkDetail work={data.work}>
  {#snippet notice()}
    <p class="preview-notice" role="status">{m.preview_notice()}</p>
  {/snippet}
</WorkDetail>

<style>
  .preview-notice {
    margin-bottom: var(--space-6);
    padding: var(--space-3) var(--space-4);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
  }
</style>
