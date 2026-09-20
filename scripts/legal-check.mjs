/**
 * Launch gate for the legal pages.
 *
 * lib/legal.ts ships with placeholders that only the operator can fill. A
 * "mentions légales" page naming TODO_LEGAL_ENTITY_NAME as the publisher is
 * worse than no page at all — in France an incomplete one is a specific
 * offence (LCEN art. 6-III), and Stripe reads these pages before approving a
 * merchant account.
 *
 * This exits non-zero while any placeholder remains, so it can gate a release.
 * It is intentionally NOT wired into `npm run build`: the product is useful
 * before it is monetised, and a half-filled legal file should not stop a
 * preview deploy.
 */
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../lib/legal.ts", import.meta.url), "utf8");
const found = [...src.matchAll(/^\s*(\w+):\s*"([^"]*TODO[^"]*)"/gm)].map((m) => ({
  key: m[1],
  value: m[2],
}));

if (!found.length) {
  console.log("legal: every placeholder is filled in.");
  process.exit(0);
}

console.error(`legal: ${found.length} placeholder(s) still to fill in lib/legal.ts\n`);
for (const { key, value } of found) console.error(`  ${key.padEnd(22)} ${value}`);
console.error(`
These appear verbatim on /legal, /terms and /privacy, and a red banner is
shown on those pages until they are replaced.`);
process.exit(1);
