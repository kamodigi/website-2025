<script lang="ts">
  // Button component with various styles and variants
	import type { Snippet } from 'svelte';
	import { m } from '$lib/paraglide/messages';
  
  // Using Svelte 5 runes for props
  const {
    variant = 'primary',
    size = 'md',
    disabled = false,
    fullWidth = false,
    type = 'button',
    href = undefined,
    external = false,
    onclick = undefined,
    children
  } = $props<{
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    fullWidth?: boolean;
    type?: 'button' | 'submit' | 'reset';
    href?: string;
    external?: boolean;
    /** 計測（track）などに使う。リンクの遷移は止めない */
    onclick?: (_event: MouseEvent) => void;
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
    {onclick}
  >
    {@render children?.()}
    {#if external}<span class="visually-hidden">{m.a11y_opens_new_tab()}</span>{/if}
  </a>
{:else}
  <button 
    {type} 
    class={buttonClass} 
    {disabled}
    {onclick}
  >
    {@render children?.()}
  </button>
{/if}

<style>
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    font-weight: 500;
    transition: var(--transition-base);
    cursor: pointer;
    text-decoration: none;
    border: none;
    outline: none;
    /* 文字が長くて折り返しても枠からはみ出さないように、高さは min-height で決めて上下に余白を持たせる */
    text-align: center;
    line-height: var(--leading-tight);
    text-wrap: balance;
    word-break: auto-phrase;
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
    min-height: 2rem;
    padding: var(--space-1) 0.75rem;
    font-size: var(--text-sm);
  }

  .button-md {
    min-height: 2.5rem;
    padding: var(--space-1) 1rem;
    font-size: var(--text-base);
  }

  .button-lg {
    min-height: 3rem;
    padding: var(--space-2) 1.5rem;
    font-size: var(--text-lg);
  }

  /* 375px 幅でも「Linux 版をダウンロード（AppImage）」が 1 行に収まる大きさにする */
  @media (max-width: 767px) {
    .button-lg {
      padding: var(--space-2) var(--space-5);
      font-size: var(--text-base);
    }
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
    min-height: 0;
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