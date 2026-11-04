<script lang="ts">
  // Card component with various styles and variants
  import type { Snippet } from 'svelte';

  // Using Svelte 5 runes for props
  const {
    variant = 'default',
    hover = false,
    clickable = false,
    children
  } = $props<{
    variant?: 'default' | 'elevated' | 'bordered' | 'gradient';
    hover?: boolean;
    clickable?: boolean;
    children?: Snippet;
  }>();

  // Compute classes based on props
  const cardClass = $derived(`card card-${variant} ${hover ? 'card-hover' : ''} ${clickable ? 'card-clickable' : ''}`);
</script>

<div class={cardClass}>
  {@render children?.()}
</div>

<style>
  .card {
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: var(--transition-base);
  }

  /* Style variants */
  .card-default {
    background-color: var(--color-surface-elevated);
  }

  .card-elevated {
    background-color: var(--color-surface-elevated);
    box-shadow: var(--shadow-sm);
  }

  .card-bordered {
    background-color: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
  }

  .card-gradient {
    background: var(--gradient-surface);
  }

  /* Hover effect */
  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  /* Clickable style */
  .card-clickable {
    cursor: pointer;
  }

  .card-clickable:active {
    transform: translateY(1px);
  }
</style>