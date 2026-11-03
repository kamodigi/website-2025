<script lang="ts">
  import { absoluteUrl, ogImageUrl } from "$lib/utils/seo";
  import { m } from "$lib/paraglide/messages";
  import SectionAboutMe from './section-about-me.svelte';
  import SectionBlog from './section-blog.svelte';
  import SectionContact from './section-contact.svelte';
  import SectionHero from "./section-hero.svelte";
  import SectionWorks from "./section-works.svelte";

  // ja の hero_description は UNUSED のため、トップページ用の説明文を別に持つ
  const description = "kamodigi（米谷拓哉）のポートフォリオ。フリーランスエンジニアとして、フロントエンドを中心に Web アプリを作っています。";
</script>

<svelte:head>
  <title>{m.hero_title()}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={m.hero_title()} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={absoluteUrl("/")} />
  <meta property="og:image" content={ogImageUrl()} />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<SectionHero />

<SectionWorks />

<SectionBlog />

<SectionAboutMe />

<SectionContact />

<style>
  /* your styles go here */
</style>