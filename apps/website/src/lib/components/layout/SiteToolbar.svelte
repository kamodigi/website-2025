<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
</script>

<!-- 右上に固定。ヒーローの Three.js キャンバス（z-index: 10）より手前に出す -->
<!-- ランドマーク（header）に入れて、スクリーンリーダーのランドマーク移動でも届くようにする -->
<header class="site-toolbar" aria-label={m.toolbar_label()}>
  <ThemeToggle />
  <LanguageSwitcher />
</header>

<style>
  .site-toolbar {
    position: fixed;
    top: var(--space-2);
    right: var(--space-2);
    z-index: 100;
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    /* スクロール中も文字に重なって読みにくくならないよう、背景を少し透かして敷く */
    background-color: color-mix(in oklch, var(--color-background) 85%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  @media (min-width: 768px) {
    .site-toolbar {
      top: var(--space-4);
      right: var(--space-4);
    }
  }
</style>
