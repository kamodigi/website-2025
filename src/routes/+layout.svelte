<script lang="ts">
  import { type Snippet } from "svelte";
  import SiteToolbar from "$lib/components/layout/SiteToolbar.svelte";
  import "../lib/styles/global.css";

  const { children }: { children: Snippet } = $props();
</script>

<svelte:head>
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
</style>
