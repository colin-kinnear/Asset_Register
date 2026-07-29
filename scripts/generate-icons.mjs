// Regenerates PWA icons from the TagPoint mark. Run with: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ACCENT = "#1f5d8c";
const INK = "#182430";
const BG = "#f4f6f8";

// Same mark as the plan document: QR finder-pattern corners resolving into a tag notch.
function markSvg(size, { padded = false } = {}) {
  const pad = padded ? size * 0.16 : 0;
  const inner = size - pad * 2;
  const s = inner / 48;
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <g transform="translate(${pad}, ${pad})">
    <path d="M${6 * s} ${6 * s}h${14 * s}v${6 * s}h${-8 * s}v${8 * s}h${-6 * s}z" fill="${ACCENT}"/>
    <path d="M${42 * s} ${6 * s}h${-14 * s}v${6 * s}h${10 * s}v${8 * s}h${4 * s}z" fill="${ACCENT}"/>
    <path d="M${6 * s} ${42 * s}v${-14 * s}h${6 * s}v${8 * s}h${8 * s}v${6 * s}z" fill="${ACCENT}"/>
    <rect x="${27 * s}" y="${27 * s}" width="${15 * s}" height="${15 * s}" rx="${3 * s}" fill="${INK}"/>
    <circle cx="${34.5 * s}" cy="${34.5 * s}" r="${2.6 * s}" fill="${BG}"/>
  </g>
</svg>`;
}

const outDir = new URL("../public/icons/", import.meta.url);
await mkdir(outDir, { recursive: true });

const targets = [
  { file: "icon-192.png", size: 192, padded: false },
  { file: "icon-512.png", size: 512, padded: false },
  { file: "icon-maskable-512.png", size: 512, padded: true }, // safe-zone padding for maskable icons
  { file: "apple-touch-icon.png", size: 180, padded: true }, // iOS ignores transparency/rounds itself
];

for (const t of targets) {
  const svg = markSvg(t.size, { padded: t.padded });
  const outPath = fileURLToPath(new URL(t.file, outDir));
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log(`wrote public/icons/${t.file}`);
}
