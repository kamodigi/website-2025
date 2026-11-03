// マガモのドット絵 GIF の全フレームを元解像度（1ドット=1px）に戻し、横に並べた透過スプライト PNG にする。
// ブランド紹介帯（src/routes/section-brand.svelte）が CSS の steps() でコマ送りして使う。
// 40x40 のままだと余白が多いので、全フレームで鴨が通る範囲に切り詰める（いまは 1コマ 22x22）。
//
// 使い方: node scripts/generate-brand-sprite.mjs <source.gif>
//   元素材: ~/pCloudDrive/Documents/icons/kamodigi-v2.gif（1000x1000、22フレーム、各 400ms）
//   出力:   static/brand/kamodigi-duck-sprite.png
// 必要コマンド: magick（ImageMagick 7）
//
// フレーム数・コマ時間が変わったら、出力されるログを見て section-brand.svelte の
// FRAMES / FRAME_MS / FRAME_PX を合わせること（いまは全フレーム同じ時間なので steps() 1本で表せる）。
import { execFileSync } from 'node:child_process';

const OUT = 'static/brand/kamodigi-duck-sprite.png';
const DOT = 25; // 元 GIF 1000px 上での1ドットの大きさ（= 40x40）
const run = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8' });

const [source] = process.argv.slice(2);
if (!source) {
	console.error('usage: node scripts/generate-brand-sprite.mjs <source.gif>');
	process.exit(1);
}

const delays = run('magick', [source, '-format', '%T\n', 'info:']).trim().split('\n').map(Number);
const size = 1000 / DOT;

// 差分フレームを合成し直してから最近傍で元解像度へ戻し、
// 外周とつながった白背景だけを透過にする（体の白い首輪は残す）。favicon と同じ処理。
const frames = [
	source, '-coalesce',
	'-filter', 'point', '-resize', `${size}x${size}`,
	'-alpha', 'set', '-fuzz', '8%', '-fill', 'none',
	'-draw', 'alpha 0,0 floodfill',
	'-draw', `alpha ${size - 1},0 floodfill`,
	'-draw', `alpha 0,${size - 1} floodfill`,
	'-draw', `alpha ${size - 1},${size - 1} floodfill`
];

// 全フレームで鴨が通る範囲を求め、1ドットの余白つきの正方形に切り詰める
// （全フレーム同じ位置で切るので、コマ間で鴨がずれない）
const boxes = run('magick', [...frames, '-format', '%@\n', 'info:'])
	.trim().split('\n').map((s) => s.split(/[x+]/).map(Number));
if (boxes.some(([w, h]) => w * h <= 1)) {
	throw new Error('鴨が写っていない（全面透過の）フレームがある。透過処理か元素材を確認すること');
}
const left = Math.min(...boxes.map(([, , x]) => x));
const top = Math.min(...boxes.map(([, , , y]) => y));
const right = Math.max(...boxes.map(([w, , x]) => x + w));
const bottom = Math.max(...boxes.map(([, h, , y]) => y + h));
const side = Math.max(right - left, bottom - top) + 2;
// 切り出し枠がキャンバスからはみ出すと -crop が欠けるので、内側に収める
const clamp = (v) => Math.min(Math.max(v, 0), size - side);
const ox = clamp(Math.round((left + right) / 2 - side / 2));
const oy = clamp(Math.round((top + bottom) / 2 - side / 2));

run('magick', [
	...frames,
	'-crop', `${side}x${side}+${ox}+${oy}`, '+repage',
	'-background', 'none', '-gravity', 'center', '-extent', `${side}x${side}`,
	'-gravity', 'northwest', '+append', '-strip', `PNG32:${OUT}`
]);

console.log(`generated ${OUT}: ${delays.length} frames of ${side}x${side} (cropped from ${size}x${size})`);
console.log(`frame delays (ms): ${[...new Set(delays.map((d) => d * 10))].join(', ')}`);
