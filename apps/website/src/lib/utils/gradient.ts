/**
 * タグに対応する色のマッピング
 * 主要な技術スタックの色を定義
 */
const tagColorMap: Record<string, string> = {
  // JavaScript/TypeScript
  'JavaScript': '#F7DF1E',
  'TypeScript': '#3178C6',

  // フレームワーク
  'SvelteKit': '#FF3E00',
  'Svelte': '#FF3E00',
  'React': '#61DAFB',
  'Next.js': '#000000',
  'Vue': '#42B883',
  'Nuxt': '#00DC82',
  'Angular': '#DD0031',

  // バックエンド
  'Node.js': '#339933',
  'Deno': '#000000',
  'Python': '#3776AB',
  'Django': '#092E20',
  'FastAPI': '#009688',
  'Rust': '#CE422B',
  'Go': '#00ADD8',
  'Java': '#007396',

  // データベース
  'PostgreSQL': '#4169E1',
  'MySQL': '#4479A1',
  'MongoDB': '#47A248',
  'Redis': '#DC382D',
  'Supabase': '#3ECF8E',
  'Firebase': '#FFCA28',

  // CSS/スタイリング
  'CSS': '#1572B6',
  'TailwindCSS': '#06B6D4',
  'Sass': '#CC6699',

  // その他
  'Docker': '#2496ED',
  'Kubernetes': '#326CE5',
  'Git': '#F05032',
  'GraphQL': '#E10098',
  'Markdown': '#000000',
  'WebAssembly': '#654FF0',
  'ブログ': '#FF6B6B',
  '技術記事': '#4ECDC4',
};

/**
 * 文字列から数値ハッシュを生成
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/**
 * HEX色をHSLに変換
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // #を削除
  hex = hex.replace('#', '');

  // RGBに変換
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * 調和する第二の色を生成（補色または類似色）
 */
function generateHarmoniousColor(baseHue: number, seed: number): { h: number; s: number; l: number } {
  // seedに基づいて補色(180度)、三角補色(120度)、類似色(30度)から選択
  const harmonies = [180, 120, -120, 30, -30];
  const offset = harmonies[seed % harmonies.length];

  return {
    h: (baseHue + offset + 360) % 360,
    s: 70,
    l: 60
  };
}

/**
 * タグに基づいてグラデーションを生成
 * タグがマッピングにある場合はその色を使用、ない場合はHSLで生成
 */
export function generateGradientFromTags(tags: string[], fallbackSeed: string): string {
  // タグがマッピングにあるものを探す
  const mappedTags = tags.filter(tag => tagColorMap[tag]);

  if (mappedTags.length >= 2) {
    // 2つ以上マッピングがある場合は最初の2つを使用
    const color1 = tagColorMap[mappedTags[0]];
    const color2 = tagColorMap[mappedTags[1]];
    return `linear-gradient(135deg, ${color1}, ${color2})`;
  } else if (mappedTags.length === 1) {
    // 1つだけマッピングがある場合は、それをベースに調和する色を生成
    const baseColor = tagColorMap[mappedTags[0]];
    const baseHSL = hexToHSL(baseColor);
    const hash = simpleHash(fallbackSeed);
    const harmoniousHSL = generateHarmoniousColor(baseHSL.h, hash);

    return `linear-gradient(135deg, ${baseColor}, hsl(${harmoniousHSL.h}, ${harmoniousHSL.s}%, ${harmoniousHSL.l}%))`;
  } else {
    // マッピングがない場合は完全にHSLで生成
    const hash = simpleHash(fallbackSeed);
    const baseHue = hash % 360;
    const harmoniousHSL = generateHarmoniousColor(baseHue, hash);

    const color1 = `hsl(${baseHue}, 70%, 60%)`;
    const color2 = `hsl(${harmoniousHSL.h}, ${harmoniousHSL.s}%, ${harmoniousHSL.l}%)`;

    return `linear-gradient(135deg, ${color1}, ${color2})`;
  }
}

/**
 * 記事タイトルから頭文字を取得（日本語の場合は最初の1文字）
 */
export function getInitial(title: string): string {
  if (!title) return '?';

  // 日本語文字（ひらがな、カタカナ、漢字）のチェック
  const isJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(title[0]);

  if (isJapanese) {
    // 日本語の場合は最初の1文字
    return title[0];
  } else {
    // 英語の場合は最初の文字（アルファベット）
    const match = title.match(/[A-Za-z]/);
    return match ? match[0].toUpperCase() : title[0];
  }
}

/**
 * グラデーションが暗い色かどうかを判定（テキスト色を決定するため）
 */
export function isDarkGradient(gradient: string): boolean {
  // 簡易的な判定：最初の色のlightness値をチェック
  const hslMatch = gradient.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (hslMatch) {
    const lightness = parseInt(hslMatch[3]);
    return lightness < 50;
  }

  // HEX色の場合
  const hexMatch = gradient.match(/#([0-9A-Fa-f]{6})/);
  if (hexMatch) {
    const hsl = hexToHSL(hexMatch[1]);
    return hsl.l < 50;
  }

  // デフォルトは明るいと仮定
  return false;
}
