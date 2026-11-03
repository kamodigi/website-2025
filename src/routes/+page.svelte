<script lang="ts">
  import { page } from "$app/state";
  import { absoluteUrl, ogImageUrl } from "$lib/utils/seo";
  import { m } from "$lib/paraglide/messages";
  import SectionAboutMe from './section-about-me.svelte';
  import SectionBlog from './section-blog.svelte';
  import SectionBrand from './section-brand.svelte';
  import SectionContact from './section-contact.svelte';
  import SectionHero from "./section-hero.svelte";
  import SectionWorks from "./section-works.svelte";

  const description = m.site_description();
</script>

<svelte:head>
  <title>{m.hero_title()}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={m.hero_title()} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={absoluteUrl(page.url.pathname)} />
  <meta property="og:image" content={ogImageUrl()} />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<SectionHero />

<SectionBrand />

<SectionWorks />

<SectionBlog />

<SectionAboutMe />

<SectionContact />

<style>
  /* your styles go here */
</style>