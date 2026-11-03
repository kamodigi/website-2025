<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  import { onMount } from 'svelte';

  type Theme = 'light' | 'dark';

  // 初期値は src/app.html のインラインスクリプトが <html data-theme> に入れている
  // （localStorage "theme" > OS の設定）。ここではそれを読み、切り替え時に保存する。
  const STORAGE_KEY = 'theme';

  let theme = $state<Theme>('light');

  function readStoredTheme(): Theme | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'light' || saved === 'dark' ? saved : null;
    } catch {
      return null;
    }
  }

  function applyTheme(next: Theme) {
    theme = next;
    document.documentElement.setAttribute('data-theme', next);
  }

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 保存できなくても、このページでは切り替わる
    }
  }

  onMount(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const current = document.documentElement.getAttribute('data-theme');
    theme = current === 'dark' || current === 'light' ? current : media.matches ? 'dark' : 'light';

    // 手動で選んでいないあいだは OS の切り替えに追従する
    const handleChange = (e: MediaQueryListEvent) => {
      if (!readStoredTheme()) applyTheme(e.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  });

</script>

<button type="button" class="theme-toggle" onclick={toggleTheme}>
  <!-- ラベルもアイコンと同じく CSS で出し分ける（JS の読み込み前でも正しい名前になる） -->
  <span class="label label-to-light">{m.theme_toggle_light()}</span>
  <span class="label label-to-dark">{m.theme_toggle_dark()}</span>
  <!-- アイコンは CSS でテーマに合わせて出し分ける（JS の読み込み前でもちらつかない） -->
  <!-- Sun: shown in dark theme (switch to light) -->
  <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
  <!-- Moon: shown in light theme (switch to dark) -->
  <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
</button>

<style>
  .theme-toggle {
    position: relative;
    background: transparent;
    border: none;
    color: var(--color-text);
    cursor: pointer;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color var(--transition-fast);
  }

  .theme-toggle:hover {
    background-color: var(--color-hover-overlay);
  }

  .theme-toggle:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
  }

  .label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }

  /* display: none のほうはアクセシビリティツリーからも外れる */
  .label-to-light {
    display: var(--display-dark-only);
  }

  .label-to-dark {
    display: var(--display-light-only);
  }

  .icon-sun {
    display: var(--display-dark-only);
  }

  .icon-moon {
    display: var(--display-light-only);
  }

  svg {
    transition: transform var(--transition-base);
  }

  .theme-toggle:hover svg {
    transform: rotate(15deg);
  }

  @media (prefers-reduced-motion: reduce) {
    .theme-toggle:hover svg {
      transform: none;
    }
  }
</style>
