<script lang="ts">
  // Button component with various styles and variants
	import type { Snippet } from 'svelte';
  
  // Using Svelte 5 runes for props
  const {
    variant = 'primary',
    size = 'md',
    disabled = false,
    fullWidth = false,
    type = 'button',
    href = undefined,
    external = false,
    children
  } = $props<{
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    fullWidth?: boolean;
    type?: 'button' | 'submit' | 'reset';
    href?: string;
    external?: boolean;
    children?: Snippet;
  }>();

  // Compute classes based on props
  const buttonClass = $derived(`button button-${variant} button-${size} ${fullWidth ? 'button-full' : ''}`);
</script>

{#if href}
  <a 
    {href} 
    class={buttonClass} 
    target={external ? '_blank' : undefined} 
    rel={external ? 'noopener noreferrer' : undefined}
    aria-disabled={disabled}
  >
    {@render children?.()}
  </a>
{:else}
  <button 
    {type} 
    class={buttonClass} 
    {disabled}
  >
    {@render children?.()}
  </button>
{/if}

<style>
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    font-weight: 500;
    transition: var(--transition-base);
    cursor: pointer;
    text-decoration: none;
    border: none;
    outline: none;
  }

  .button:focus-visible {
    box-shadow: 0 0 0 2px var(--color-background), 0 0 0 4px var(--color-focus-ring);
  }

  .button[disabled], .button[aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Size variants */
  .button-sm {
    height: 2rem;
    padding: 0 0.75rem;
    font-size: var(--text-sm);
  }

  .button-md {
    height: 2.5rem;
    padding: 0 1rem;
    font-size: var(--text-base);
  }

  .button-lg {
    height: 3rem;
    padding: 0 1.5rem;
    font-size: var(--text-lg);
  }

  /* Style variants */
  .button-primary {
    background: var(--color-primary-fill);
    color: var(--color-on-primary-fill);
  }

  .button-primary:hover:not([disabled]):not([aria-disabled="true"]) {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .button-primary:active:not([disabled]):not([aria-disabled="true"]) {
    filter: brightness(0.9);
    transform: translateY(0);
  }

  .button-secondary {
    background: var(--gradient-accent);
    color: var(--color-text);
  }

  .button-secondary:hover:not([disabled]):not([aria-disabled="true"]) {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .button-secondary:active:not([disabled]):not([aria-disabled="true"]) {
    filter: brightness(0.9);
    transform: translateY(0);
  }

  .button-outline {
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-text);
  }

  .button-outline:hover:not([disabled]):not([aria-disabled="true"]) {
    background: var(--color-hover-overlay);
    border-color: var(--color-text-secondary);
  }

  .button-ghost {
    background: transparent;
    color: var(--color-text);
  }

  .button-ghost:hover:not([disabled]):not([aria-disabled="true"]) {
    background: var(--color-hover-overlay);
  }

  .button-link {
    background: transparent;
    color: var(--color-link);
    height: auto;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  .button-link:hover:not([disabled]):not([aria-disabled="true"]) {
    color: var(--color-text-secondary);
  }

  /* Full width */
  .button-full {
    width: 100%;
  }
</style>