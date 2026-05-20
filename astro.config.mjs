// @ts-check
import { defineConfig } from 'astro/config';

// Static site for marketing + legal pages. No SSR, no client JS beyond
// what Astro emits automatically (which is zero for our purposes — every
// page is pre-rendered to HTML at build time).
//
// Cloudflare Pages deploys the contents of `./dist` after `npm run build`.
// The GitHub Actions workflow at .github/workflows/deploy.yml handles
// that on every push to main.
export default defineConfig({
  site: 'https://turnaphrase.app',
  output: 'static',
  build: {
    // Inline CSS smaller than 4KB; ours is tiny so this prevents any
    // CSS file FOUC.
    inlineStylesheets: 'always',
  },
  trailingSlash: 'never',
});
