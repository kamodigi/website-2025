// マガモのドット絵 GIF の1フレーム目から favicon 一式を再生成する。
//
// 使い方: node scripts/generate-favicons.mjs [source.gif]
//   source.gif を渡すと static/brand/kamodigi-duck.png（40x40 透過マスター）を作り直す。
//   省略時は既存のマスター PNG から派生物だけを再生成する。
// 必要コマンド: ffmpeg（GIF 読み込み）, magick（ImageMagick 7）
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const MASTER = 'static/brand/kamodigi-duck.png';
const DOT = 25; // 元 GIF 1000px 上での1ドットの大きさ（= 40x40）
const run = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8' });

const [source] = process.argv.slice(2);
if (source) {
	const tmp = mkdtempSync(join(tmpdir(), 'favicon-'));
	try {
		const frame = join(tmp, 'frame0.png');
		run('ffmpeg', ['-v', 'error', '-y', '-i', source, '-frames:v', '1', frame]);
		const size = 1000 / DOT;
		// 最近傍で元解像度へ戻し、外周とつながった白背景だけを透過にする（体の白い首輪は残す）
		run('magick', [
			frame, '-filter', 'point', '-resize', `${size}x${size}`,
			'-alpha', 'set', '-fuzz', '8%', '-fill', 'none',
			'-draw', 'alpha 0,0 floodfill',
			'-draw', `alpha ${size - 1},0 floodfill`,
			'-draw', `alpha 0,${size - 1} floodfill`,
			'-draw', `alpha ${size - 1},${size - 1} floodfill`,
			MASTER
		]);
	} finally {
		rmSync(tmp, { recursive: true, force: true });
	}
}

// 余白を詰めて、1ドット分の余白つきの正方形にそろえる（小さいアイコンで鴨を大きく見せる）
const [w, h, x, y] = run('magick', [MASTER, '-format', '%@', 'info:'])
	.split(/[x+]/).map(Number);
const side = Math.max(w, h) + 2;
const ox = Math.round(x + w / 2 - side / 2);
const oy = Math.round(y + h / 2 - side / 2);
const square = [
	MASTER, '-background', 'none', '-crop', `${side}x${side}+${ox}+${oy}`, '+repage',
	'-gravity', 'center', '-extent', `${side}x${side}`
];

// favicon.svg: 1ドット = 1 rect
const txt = run('magick', [...square, 'txt:-']).split('\n').slice(1);
const rects = [];
for (const line of txt) {
	const m = line.match(/^(\d+),(\d+): \((\d+),(\d+),(\d+),(\d+)\)/);
	if (!m || +m[6] < 128) continue;
	const hex = [m[3], m[4], m[5]].map((v) => (+v).toString(16).padStart(2, '0')).join('');
	rects.push(`<rect x="${m[1]}" y="${m[2]}" width="1" height="1" fill="#${hex}"/>`);
}
writeFileSync(
	'static/favicon.svg',
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}" shape-rendering="crispEdges">\n${rects.join('\n')}\n</svg>\n`
);

// PNG / ICO は最近傍補間で拡大
const scaled = (px) => [...square, '-filter', 'point', '-resize', `${px}x${px}`];
run('magick', [...scaled(180), 'static/apple-touch-icon.png']);
run('magick', [...scaled(512), 'static/icon-512.png']);
run('magick', [...scaled(32), '-define', 'icon:auto-resize=32', 'static/favicon.ico']);
console.log(`generated from ${MASTER} (${side}x${side} dots)`);
