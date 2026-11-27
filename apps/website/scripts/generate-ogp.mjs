// 共通 OGP 画像（1200x630）を static/ogp.png に生成する。
//
// 使い方: node scripts/generate-ogp.mjs
// 左: static/brand/kamodigi-duck.png（40x40 透過マスター）を最近傍補間で拡大
// 右: 「kamodigi」「Tech for Communities」
// 必要コマンド: magick（ImageMagick 7）
import { execFileSync } from 'node:child_process';

const MASTER = 'static/brand/kamodigi-duck.png';
const OUT = 'static/ogp.png';
const BG = 'white';
const TEXT = '#1f2329'; // --color-neutral 相当
const SUB = '#4d5560'; // --color-neutral-soft 相当
const ACCENT = '#3fb36b'; // --color-primary 相当
const FONT = 'DejaVu-Sans-Bold';

execFileSync('magick', [
	'-size', '1200x630', `xc:${BG}`,
	'(', MASTER, '-filter', 'point', '-resize', '520x520', ')',
	'-gravity', 'West', '-geometry', '+50+0', '-composite',
	'-gravity', 'NorthWest', '-font', FONT,
	'-fill', TEXT, '-pointsize', '96', '-annotate', '+570+215', 'kamodigi',
	'-fill', ACCENT, '-draw', 'rectangle 574,350 694,358',
	'-fill', SUB, '-pointsize', '40', '-annotate', '+570+385', 'Tech for Communities',
	OUT
]);
