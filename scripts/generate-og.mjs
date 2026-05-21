// Generate public/og.png — the social share card for turnaphrase.app.
//
// Why this exists: when the site URL is shared (iMessage, Slack, Twitter,
// Discord, etc.) the platforms scrape og:image. Without one they fall
// back to a generic preview or no preview at all. This script
// hand-crafts a parchment-themed 1200x630 PNG matching the app aesthetic.
//
// Why a Node script (not a build step):
// - The image changes rarely (brand/copy). Regenerating only when
//   intentional avoids re-rasterising on every astro build.
// - The output is committed so Cloudflare Pages always has it ready
//   without a build-time tool dependency.
//
// Run: `node scripts/generate-og.mjs` (or `npm run og`).
// Output: public/og.png

import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '..', 'public', 'og.png');
mkdirSync(dirname(outPath), { recursive: true });

// 1200 x 630 is the canonical OG image size — Twitter, Facebook, LinkedIn,
// Slack, iMessage all standardise on this. Smaller and you get cropped;
// larger and you waste bandwidth.
const W = 1200;
const H = 630;

// Palette — verbatim from theme/tokens.ts in the app repo. Keep in sync
// if the app palette ever changes.
const PAGE = '#FFF8E7';
const PAPER_EDGE = '#F0E2BD';
const INK = '#1A0F00';
const INK_SOFT = '#3A2614';
const INK_MUTED = '#7A6A52';
const WAX = '#7A1F1F';
const CORAL = '#E25C3F';
const GOLD = '#D9A21E';

// Inline SVG. Resvg renders without a browser — keep features within
// "static SVG 1.1 + a few SVG2 nicities" to avoid surprises. No filters,
// no <foreignObject>, no embedded HTML.
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <!-- Parchment background -->
  <rect width="${W}" height="${H}" fill="${PAGE}"/>

  <!-- Subtle paperEdge corner accent (matches the cards in the app) -->
  <rect x="40" y="40" width="${W - 80}" height="${H - 80}" rx="24" ry="24"
        fill="none" stroke="${PAPER_EDGE}" stroke-width="2"/>

  <!-- Wax brand eyebrow -->
  <text x="${W / 2}" y="180"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="26" font-weight="700"
        letter-spacing="6"
        fill="${WAX}"
        text-anchor="middle">TURN A PHRASE</text>

  <!-- Hero serif headline -->
  <text x="${W / 2}" y="310"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="84" font-weight="700"
        letter-spacing="-1"
        fill="${INK}"
        text-anchor="middle">Speak English</text>
  <text x="${W / 2}" y="395"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="84" font-weight="700" font-style="italic"
        letter-spacing="-1"
        fill="${INK}"
        text-anchor="middle">like you mean it.</text>

  <!-- Coral underline accent -->
  <rect x="${W / 2 - 60}" y="435" width="120" height="5" rx="2"
        fill="${CORAL}"/>

  <!-- Subtitle -->
  <text x="${W / 2}" y="495"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="30"
        fill="${INK_SOFT}"
        text-anchor="middle">Learn English idioms — daily lessons, real origins, spaced repetition.</text>

  <!-- Foot brand -->
  <text x="${W / 2}" y="565"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="20" font-weight="600"
        letter-spacing="2"
        fill="${INK_MUTED}"
        text-anchor="middle">turnaphrase.app</text>

  <!-- Decorative dots at the corners — small gold accents echoing the
       streak / badge color in the app. Subtle, not noisy. -->
  <circle cx="60"        cy="60"        r="4" fill="${GOLD}"/>
  <circle cx="${W - 60}" cy="60"        r="4" fill="${GOLD}"/>
  <circle cx="60"        cy="${H - 60}" r="4" fill="${GOLD}"/>
  <circle cx="${W - 60}" cy="${H - 60}" r="4" fill="${GOLD}"/>
</svg>`;

// Use resvg's bundled default fonts (serif fallback handles Georgia
// gracefully). For pixel-perfect Playfair Display we'd have to ship the
// font file alongside the script; that's a future iteration if anyone
// complains. The DejaVu Serif default is a passable substitute.
const resvg = new Resvg(svg, {
  background: PAGE,
  fitTo: { mode: 'width', value: W },
  font: {
    fontFiles: [],
    loadSystemFonts: true,
    defaultFontFamily: 'Georgia',
  },
});

const png = resvg.render().asPng();
writeFileSync(outPath, png);

console.log(`✓ wrote ${outPath} (${(png.length / 1024).toFixed(1)} KB)`);
