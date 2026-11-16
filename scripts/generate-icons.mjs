/**
 * Génère les icônes de l'app à partir du sprite `public/machamp.png`.
 *
 *   npm run icons
 *
 * - Agrandissement en « nearest neighbor » (facteur entier) pour garder le pixel art net.
 * - Icônes 180 / 192 / 512 px sur la couleur de fond de l'app (apple-touch-icon + manifest).
 * - Favicon 64 px sur fond transparent.
 *
 * Le sprite doit être un PNG. Si le tien est dans un autre format, convertis-le en PNG d'abord.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SPRITE = resolve(root, 'public/machamp.png');
const OUT_DIR = resolve(root, 'public/icons');

// Couleur de fond de l'app (même valeur que --color-bg dans src/styles/theme.css).
const BACKGROUND = hexToRgb('#221F1D');

const TARGETS = [
  { file: 'apple-touch-icon.png', size: 180, background: BACKGROUND, padding: 0.12 },
  { file: 'icon-192.png', size: 192, background: BACKGROUND, padding: 0.12 },
  // 512 px : marge plus large pour rester lisible si le système découpe l'icône (masque rond).
  { file: 'icon-512.png', size: 512, background: BACKGROUND, padding: 0.16 },
  { file: 'favicon-64.png', size: 64, background: null, padding: 0 },
];

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Recadre le sprite sur ses pixels visibles (ignore les marges transparentes). */
function trim(png) {
  let minX = png.width, minY = png.height, maxX = -1, maxY = -1;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      if (png.data[(y * png.width + x) * 4 + 3] > 0) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
  }
  if (maxX < 0) throw new Error('Le sprite est entièrement transparent.');
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function render(sprite, box, { size, background, padding }) {
  const out = new PNG({ width: size, height: size });
  // Fond
  for (let i = 0; i < size * size; i++) {
    out.data[i * 4] = background?.r ?? 0;
    out.data[i * 4 + 1] = background?.g ?? 0;
    out.data[i * 4 + 2] = background?.b ?? 0;
    out.data[i * 4 + 3] = background ? 255 : 0;
  }
  const available = Math.floor(size * (1 - padding * 2));
  const scale = Math.max(1, Math.floor(available / Math.max(box.width, box.height)));
  const w = box.width * scale;
  const h = box.height * scale;
  const offX = Math.floor((size - w) / 2);
  const offY = Math.floor((size - h) / 2);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = box.x + Math.floor(x / scale);
      const sy = box.y + Math.floor(y / scale);
      const si = (sy * sprite.width + sx) * 4;
      const a = sprite.data[si + 3] / 255;
      if (a === 0) continue;
      const di = ((offY + y) * size + offX + x) * 4;
      for (let c = 0; c < 3; c++) {
        out.data[di + c] = Math.round(sprite.data[si + c] * a + out.data[di + c] * (1 - a));
      }
      out.data[di + 3] = background ? 255 : Math.round(a * 255);
    }
  }
  return { png: out, scale };
}

let sprite;
try {
  sprite = PNG.sync.read(readFileSync(SPRITE));
} catch (error) {
  console.error(`Impossible de lire ${SPRITE} : ${error.message}`);
  console.error('Place ton sprite au format PNG dans public/machamp.png puis relance « npm run icons ».');
  process.exit(1);
}

const box = trim(sprite);
mkdirSync(OUT_DIR, { recursive: true });
for (const target of TARGETS) {
  const { png, scale } = render(sprite, box, target);
  writeFileSync(resolve(OUT_DIR, target.file), PNG.sync.write(png));
  console.log(`✓ icons/${target.file} (${target.size} px, sprite ×${scale})`);
}
