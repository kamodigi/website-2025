<script lang="ts">
  // Modal component with animation
  import { onDestroy, type Snippet } from 'svelte';
  
  // Using Svelte 5 runes for props
  const {
    isOpen = false,
    title = '',
    size = 'md',
    closeOnEsc = true,
    closeOnOutsideClick = true,
    onClose,
    children
  } = $props<{
    isOpen: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'full';
    closeOnEsc?: boolean;
    closeOnOutsideClick?: boolean;
    onClose: () => void;
    children?: Snippet;
  }>();

  // State for animation
  let modalVisible = $state(false);
  let modalElement = $state<HTMLDivElement | null>(null);

  // Handle keyboard events
  function handleKeydown(event: KeyboardEvent) {
    if (closeOnEsc && event.key === 'Escape' && isOpen) {
      onClose();
    }
  }

  // Handle outside click
  function handleOutsideClick(event: MouseEvent) {
    if (
      closeOnOutsideClick && 
      modalElement && 
      event.target instanceof Node && 
      !modalElement.contains(event.target)
    ) {
      onClose();
    }
  }

  // Handle keyboard interaction for overlay
  function handleOverlayKeydown(event: KeyboardEvent) {
    if (closeOnOutsideClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClose();
    }
  }

  // Watch for isOpen changes
  $effect(() => {
    if (isOpen) {
      // Add a small delay to trigger the animation
      setTimeout(() => {
        modalVisible = true;
      }, 10);
      
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
    } else {
      modalVisible = false;
      
      // Re-enable body scrolling
      document.body.style.overflow = '';
    }
  });

  // Clean up event listeners
  onDestroy(() => {
    document.body.style.overflow = '';
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <!-- Using role="dialog" for the overlay and adding keyboard event handlers -->
  <div 
    class="modal-overlay" 
    class:visible={modalVisible}
    onclick={handleOutsideClick}
    onkeydown={handleOverlayKeydown}
    role="dialog"
    aria-modal="true"
    tabindex="0"
  >
    <!-- Using role="presentation" for the modal container -->
    <div 
      class="modal modal-{size}" 
      class:visible={modalVisible}
      bind:this={modalElement}
      role="presentation"
    >
      <div class="modal-header">
        {#if title}
          <h3 class="modal-title" id="modal-title">{title}</h3>
        {/if}
        <button 
          class="modal-close" 
          onclick={onClose}
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-content">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    opacity: 0;
    transition: opacity var(--transition-base);
    padding: 1rem;
    outline: none; /* Remove focus outline for better UX */
  }

  .modal-overlay.visible {
    opacity: 1;
  }

  .modal {
    background-color: var(--color-surface-elevated);
    border-radius: 0.5rem;
    box-shadow: var(--shadow-lg);
    max-height: calc(100vh - 2rem);
    display: flex;
    flex-direction: column;
    transform: scale(0.95);
    opacity: 0;
    transition: transform var(--transition-base), opacity var(--transition-base);
    overflow: hidden;
  }

  .modal.visible {
    transform: scale(1);
    opacity: 1;
  }

  .modal-sm {
    width: 100%;
    max-width: 24rem;
  }

  .modal-md {
    width: 100%;
    max-width: 32rem;
  }

  .modal-lg {
    width: 100%;
    max-width: 48rem;
  }

  .modal-full {
    width: 100%;
    max-width: 64rem;
    height: calc(100vh - 2rem);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  .modal-title {
    font-size: var(--text-xl);
    font-weight: 600;
    margin: 0;
  }

  .modal-close {
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    color: var(--color-text-secondary);
    border-radius: 0.375rem;
    transition: var(--transition-fast);
  }

  .modal-close:hover {
    background-color: var(--color-hover-overlay);
    color: var(--color-text);
  }

  .modal-content {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  @media (max-width: 640px) {
    .modal-sm, .modal-md, .modal-lg {
      max-width: 100%;
    }
  }
</style>