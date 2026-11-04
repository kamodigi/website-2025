<script lang="ts">
  import { page } from '$app/state';
  import { m } from '$lib/paraglide/messages';
  import { LOCALE_LABELS, localizedPath } from '$lib/i18n';
  import { deLocalizeHref, getLocale, locales } from '$lib/paraglide/runtime';

  // 表示名は各言語での自称（エンドニム）。src/lib/i18n の LOCALE_LABELS にある
  const LANGUAGES = locales.map((locale) => ({ locale, label: LOCALE_LABELS[locale] }));

  const currentLocale = getLocale();
  // プリレンダーするのでパスだけを使う（url.search はプリレンダー中に読めない）
  const basePath = $derived(deLocalizeHref(page.url.pathname));

  let isOpen = $state(false);
  let container: HTMLDivElement | undefined = $state();
  let button: HTMLButtonElement | undefined = $state();

  function getOptions(): HTMLAnchorElement[] {
    return Array.from(container?.querySelectorAll<HTMLAnchorElement>('.language-option') ?? []);
  }

  function open(focus: 'current' | 'first' | 'last' | 'none' = 'none') {
    isOpen = true;
    if (focus === 'none') return;
    // メニューが描画されてからフォーカスを移す
    requestAnimationFrame(() => {
      const options = getOptions();
      const index =
        focus === 'first'
          ? 0
          : focus === 'last'
            ? options.length - 1
            : Math.max(0, LANGUAGES.findIndex((l) => l.locale === currentLocale));
      options[index]?.focus();
    });
  }

  function close(returnFocus = false) {
    isOpen = false;
    if (returnFocus) button?.focus();
  }

  function handleButtonKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      open(event.key === 'ArrowDown' ? 'first' : 'last');
    }
  }

  function handleButtonClick(event: MouseEvent) {
    if (isOpen) {
      close();
    } else {
      // キーボード（Enter / Space）で開いたときはメニューにフォーカスを移す
      open(event.detail === 0 ? 'current' : 'none');
    }
  }

  function handleMenuKeydown(event: KeyboardEvent) {
    const options = getOptions();
    const index = options.indexOf(document.activeElement as HTMLAnchorElement);
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        close(true);
        break;
      case 'ArrowDown':
        event.preventDefault();
        options[(index + 1) % options.length]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        options[(index - 1 + options.length) % options.length]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        options[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        options[options.length - 1]?.focus();
        break;
      case 'Tab':
        close();
        break;
    }
  }

  // 外側をクリックしたら閉じる
  function handleWindowClick(event: MouseEvent) {
    if (isOpen && container && !container.contains(event.target as Node)) close();
  }

  // フォーカスが外に出たら閉じる
  function handleFocusOut(event: FocusEvent) {
    if (isOpen && container && !container.contains(event.relatedTarget as Node | null)) close();
  }
</script>

<svelte:window onclick={handleWindowClick} />

<div class="language-switcher" bind:this={container} onfocusout={handleFocusOut}>
  <button
    bind:this={button}
    type="button"
    class="language-switcher-button"
    aria-label={m.language_switcher_label()}
    aria-haspopup="menu"
    aria-expanded={isOpen}
    aria-controls="language-menu"
    onclick={handleButtonClick}
    onkeydown={handleButtonKeydown}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  </button>

  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <div
    id="language-menu"
    class="language-menu"
    role="menu"
    aria-label={m.language_switcher_label()}
    hidden={!isOpen}
    onkeydown={handleMenuKeydown}
  >
    {#each LANGUAGES as { locale, label } (locale)}
      {@const isCurrent = locale === currentLocale}
      <!-- 言語ごとにページを再読み込みする（ロケールはプリレンダー時に決まるため） -->
      <!-- localizedPath（paraglide の localizeHref）が返す /en/... は resolve() の型付きルートに当てはまらない -->
      <!-- eslint-disable svelte/no-navigation-without-resolve -->
      <a
        class="language-option"
        role="menuitemradio"
        aria-checked={isCurrent}
        href={localizedPath(basePath, locale)}
        hreflang={locale}
        lang={locale}
        tabindex="-1"
        data-sveltekit-reload
      >
        <span>{label}</span>
        {#if isCurrent}
          <svg class="check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        {/if}
      </a>
      <!-- eslint-enable svelte/no-navigation-without-resolve -->
    {/each}
  </div>
</div>

<style>
  .language-switcher {
    position: relative;
  }

  .language-switcher-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: transparent;
    border: none;
    border-radius: var(--radius-full);
    color: var(--color-text);
    cursor: pointer;
    transition: background-color var(--transition-fast);
  }

  .language-switcher-button:hover,
  .language-switcher-button[aria-expanded='true'] {
    background-color: var(--color-hover-overlay);
  }

  /* フォーカスのリングは Button.svelte に合わせる */
  .language-switcher-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-background), 0 0 0 4px var(--color-focus-ring);
  }

  .language-menu {
    position: absolute;
    top: calc(100% + var(--space-2));
    right: 0;
    min-width: calc(var(--space-32) + var(--space-8));
    padding: var(--space-1) 0;
    background-color: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-md);
  }

  .language-menu[hidden] {
    display: none;
  }

  .language-option {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-height: 44px;
    padding: 0 var(--space-4);
    color: var(--color-text);
    font-size: var(--text-sm);
    transition: background-color var(--transition-fast);
  }

  .language-option:hover,
  .language-option:focus-visible {
    color: var(--color-text);
    background-color: var(--color-hover-overlay);
  }

  /* 内側にリングを描く（メニューの角丸で切れないように） */
  .language-option:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--color-focus-ring);
  }

  .language-option[aria-checked='true'] {
    color: var(--color-link);
    font-weight: var(--font-semibold);
  }

  .check {
    margin-left: auto;
  }
</style>
