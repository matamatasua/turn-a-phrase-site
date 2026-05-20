# Turn a Phrase — Site

The marketing / legal / universal-links companion to the
[Turn a Phrase mobile app](https://github.com/matamatasua/turn-a-phrase).

- **Live URL:** https://turnaphrase.app
- **Tech:** [Astro](https://astro.build) (static, zero-JS)
- **Host:** [Cloudflare Pages](https://pages.cloudflare.com), DNS already on Cloudflare
- **Deploy:** GitHub Actions runs `wrangler pages deploy` on every push to `main`

This repo is intentionally separate from the app repo. The app is private
(holds Supabase keys, badge logic, etc.); the site is a public, static set
of HTML pages. Mixing them risks leaking app code into a public deploy
and ties deploy cadences together unnecessarily.

---

## Pages

| Route | Purpose |
|---|---|
| `/` | Landing — pitch + App Store / Play Store badges |
| `/privacy` | Privacy Policy (required by Apple before submission) |
| `/terms` | Terms of Service |
| `/support` | Support page with `mailto:help@turnaphrase.app` + FAQ |
| `/.well-known/apple-app-site-association` | Universal Links manifest (iOS) |
| `/.well-known/assetlinks.json` | App Links manifest (Android) |

---

## Local development

```bash
npm install
npm run dev
# opens http://localhost:4321
```

Production preview:

```bash
npm run build
npm run preview
```

---

## Deploy

### Auto (via GitHub Actions — recommended)

Every push to `main` deploys to production. Every PR deploys to a unique
preview URL that Cloudflare comments on the PR.

For the GitHub Actions workflow to work, two repository secrets must be set
**once** under Settings → Secrets and variables → Actions:

- **`CLOUDFLARE_API_TOKEN`** — create at Cloudflare Dashboard → My Profile →
  API Tokens → Create Token → use the "Edit Cloudflare Workers" template
  (it includes Pages permissions). Copy the token; paste here.
- **`CLOUDFLARE_ACCOUNT_ID`** — found at Cloudflare Dashboard → Workers &
  Pages → right sidebar.

After adding both secrets, the next push to `main` will deploy.

### Manual (from your terminal)

```bash
npm install
npx wrangler login           # one-time, opens browser
npm run deploy               # builds + deploys via wrangler
```

---

## Cloudflare Pages project setup (one-time)

The Pages project itself must exist before the first deploy. Two options:

**Option A — via wrangler (no Git integration):**
```bash
npx wrangler login
npx wrangler pages project create turn-a-phrase --production-branch main
```

**Option B — via Dashboard:**
Workers & Pages → Create → Pages → "Direct Upload" (since we deploy via
Actions / wrangler, not via Cloudflare's native Git integration). Name the
project `turn-a-phrase`. Production branch: `main`.

After the project exists, the first deploy publishes it.

---

## Custom domain

Once a deploy is live (Cloudflare gives you a `*.pages.dev` URL):

1. Dashboard → Workers & Pages → `turn-a-phrase` → Custom domains → Set up a
   custom domain → `turnaphrase.app`.
2. Cloudflare auto-configures the DNS record (you own the domain here, so
   no manual A/CNAME needed).
3. SSL cert provisions automatically in ~1 minute.

---

## Universal Links / App Links

The two files in `public/.well-known/` ship with placeholder values that
**must be filled in before the mobile app is released**, or universal
links won't actually open the app — they'll just open the website.

### `apple-app-site-association`

Replace `REPLACE_APPLE_TEAM_ID` with the 10-character Team ID found at
https://developer.apple.com/account → Membership → Team ID.

```diff
-"appID": "REPLACE_APPLE_TEAM_ID.com.mockletdesign.turnaphrase",
+"appID": "ABCD123456.com.mockletdesign.turnaphrase",
```

### `assetlinks.json`

Replace `REPLACE_WITH_SHA256_FROM_eas_credentials` with the SHA-256
fingerprint of the Android signing keystore. Get it via:

```bash
cd ../turn-a-phrase
npx eas-cli credentials       # → Android → production → keystore → show
```

Look for `SHA-256 Fingerprint`. Copy the colon-separated hex string.

```diff
-"sha256_cert_fingerprints": ["REPLACE_WITH_SHA256_FROM_eas_credentials"]
+"sha256_cert_fingerprints": ["AA:BB:CC:DD:..."]
```

Test by running both files through a validator after deploy:
- Apple: https://branch.io/resources/aasa-validator/
- Google: `adb shell pm get-app-links com.mockletdesign.turnaphrase`

---

## Editing legal pages

Privacy and Terms are at `src/pages/privacy.astro` and `src/pages/terms.astro`.
They're plain Astro components — HTML inside the parchment layout. The
`lastUpdated` constant at the top of each gets shown to readers, so bump it
when you change anything material. If you change something significant
(new data type collected; new third party), also bump the in-app version
and consider an in-app notice.

---

## License

Source code: MIT (do whatever).
Site copy and design: © Mocklet Design — please don't lift wholesale.
