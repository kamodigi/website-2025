<script lang="ts">
  import WorkDetail from "$lib/components/works/WorkDetail.svelte";
  import { pickLocalized } from "$lib/i18n";
  import { getLocale } from "$lib/paraglide/runtime.js";

  const { data } = $props();
  const lang = getLocale();
  const title = $derived(pickLocalized(data.work.title, lang));
  // meta description は説明、なければ短い説明
  const description = $derived.by(() => {
    const picked = pickLocalized(data.work.description, lang);
    return picked.value ? picked : pickLocalized(data.work.summary, lang);
  });
</script>

<svelte:head>
  <title>{title.value}</title>
  {#if description.value}
    <meta name="description" content={description.value} />
  {/if}
</svelte:head>

{#key data.work.slug}
  <WorkDetail work={data.work} />
{/key}
