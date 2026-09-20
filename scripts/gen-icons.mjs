import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";

// Icons are generated from the same path as components/site/logo.tsx.
// If the mark changes there, re-run this script.
const MARK =
  "M10 34.5 11.6 15.8c.2-1.9 2.6-2.5 3.7-1L24 30.5l8.7-15.7c1.1-1.5 3.5-.9 3.7 1L38 34.5";
const INK = "#0a0b0f";
const OFFWHITE = "#f4f5f8";

// The mark is drawn on a 48-unit grid but its ink only spans x 8.5–39.5,
// y 13.3–36 (stroke included). The inner <svg> crops the viewBox tight to that
// and then places it in a box of `fill`% of the plate — the same 62.5% the
// component gets from an h-5 glyph in an h-8 plate. Without the inner box the
// mark runs edge to edge and the plate loses its optical margin.
const glyph = (fg, fill) => {
  const box = 48 * fill;
  const at = (48 - box) / 2;
  return `<svg x="${at}" y="${at}" width="${box}" height="${box}" viewBox="7 7.65 34 34">
    <path d="${MARK}" fill="none" stroke="${fg}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
};

// rx 13/48 matches the plate radius the component uses.
const icon = (radius, fill = 0.625) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <rect width="48" height="48" rx="${radius}" fill="${INK}"/>
    ${glyph(OFFWHITE, fill)}
  </svg>`;

// Android crops a maskable icon to a circle, so the mark has to sit well
// inside the safe zone — noticeably smaller than on a plate that keeps its
// corners — and the plate itself goes full-bleed square.
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <rect width="48" height="48" fill="${INK}"/>
  ${glyph(OFFWHITE, 0.46)}
</svg>`;

mkdirSync("public/icons", { recursive: true });

const jobs = [
  ["public/icons/icon-192.png", icon(13), 192],
  ["public/icons/icon-512.png", icon(13), 512],
  ["public/icons/maskable-512.png", maskable, 512],
  // Apple applies its own mask, so ship a square plate.
  ["app/apple-icon.png", icon(0), 180],
];

for (const [out, svg, size] of jobs) {
  const png = await sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(out, png);
  console.log(out, png.length, "bytes");
}

writeFileSync("app/icon.svg", icon(13));
console.log("app/icon.svg written");
