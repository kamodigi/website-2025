<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';

  // ブログは翻訳しない。日本語以外のページでだけ「日本語のみ」と出す
  const show = getLocale() !== 'ja';
</script>

{#if show}
  <span class="japanese-only">{m.blog_japanese_only()}</span>
{/if}

<style>
  .japanese-only {
    display: inline-block;
    padding: 0 var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    line-height: var(--leading-relaxed);
    color: var(--color-text-secondary);
    white-space: nowrap;
  }
</style>
