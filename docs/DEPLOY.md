# Deploy checklist

## Prerequisites

- **Node 20+**
- `npm install` (installs `tsx` devDependency when fetch script is added)

## One-time data setup

Pokémon JSON is bundled under `public/data/` — the app does **not** call PokeAPI at runtime for list, types, or detail data.

```bash
npm run fetch-data              # skip existing files
npm run fetch-data:force        # full resync
npm run fetch-types             # type effectiveness chart (types.json)
npm run fetch-data -- --from=1026 --to=1100   # new generation range only
```

1. Run `npm run fetch-data` (first run ~5–10 min; throttled, resumable).
2. Verify `public/data/meta.json` exists with `totalPokemon` ≥ 1025.
3. Commit `public/data/` to the repo (Option C — JSON only, ~2 MB).

**Sprites (Phase 7B):** list and detail sprites load from local `public/sprites/` — no CDN or `images.remotePatterns` required.

```bash
npm run fetch-sprites              # skip existing files
npm run fetch-sprites:force        # full resync
npm run fetch-sprites -- --from=1026 --to=1100   # new generation range only
```

1. Run `npm run fetch-sprites` (first run ~10–20 min; throttled, resumable).
2. Verify `public/sprites/pokemon/` and `public/sprites/animated/` contain files.
3. Commit `public/sprites/` to the repo (~100–150 MB; Git LFS optional).

## Vercel (recommended)

1. Push the repository to GitHub/GitLab/Bitbucket.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Next.js** (auto-detected).
4. Build command: `npm run build`
5. Install command: `npm install`
6. **Environment variables:** none required — no API keys, no secrets.
7. Deploy — note the production URL (e.g. `https://pokedex-xxx.vercel.app`).

**Option B (data not committed):** add a `prebuild` script that runs `fetch-data --skip-existing` so Vercel generates `public/data/` on first build. Option C (committed JSON) is recommended for fast, deterministic builds.

## Pre-deploy verification

```bash
npm run lint
npm test
npm run build
npm start
# In another terminal:
npm run test:e2e
```

## Production checklist

- [ ] `npm run build` succeeds without errors
- [ ] `/data/index.json` returns valid JSON (1025+ entries)
- [ ] Production URL loads and name index completes
- [ ] `/manifest.json` returns valid JSON
- [ ] `/sw.js` registers (HTTPS required for SW outside localhost)
- [ ] Icons at `/icons/icon-192.png` and `/icons/icon-512.png` load
- [ ] PWA install prompt works on Android Chrome / iOS Safari Add to Home Screen
- [ ] Offline test: after first visit, list names/types and detail load from cached `/data/` JSON
- [ ] No runtime requests to `pokeapi.co` during normal browse
- [ ] No runtime requests to `raw.githubusercontent.com` during normal browse
- [ ] README production URL updated after first deploy

## Security headers

Configured in `next.config.ts` for all routes:

| Header | Value |
|--------|-------|
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |

Verify in DevTools → Network → document response headers on production.

- [ ] `X-Frame-Options: SAMEORIGIN` present
- [ ] `X-Content-Type-Options: nosniff` present
- [ ] `Referrer-Policy: strict-origin-when-cross-origin` present
- [ ] HTTPS enforced (Vercel default)
- [ ] No secrets or API keys in repo or Vercel environment variables

Full Content-Security-Policy is deferred to a later phase.

## Service worker

`public/sw.js` (`pokedex-v3` cache):

- **Install precache:** app shell, `/data/index.json`, `/data/meta.json`
- **Runtime cache:** `/data/pokemon/{id}.json` and `/sprites/` paths on first fetch (stale-while-revalidate)
- Individual Pokémon JSON and sprite files are not precached in install (too large)

## Optional: other hosts

- **Netlify:** connect repo, build `npm run build`, publish via Next.js plugin or Netlify Next runtime.
- **Node server:** run `npm run build && npm start` on any Node 20+ host behind HTTPS.

## Known limitations (post-Phase 7)

- Data reflects the state at the last `npm run fetch-data` run. Re-run and redeploy when new generations are added.
- Sprites reflect the state at the last `npm run fetch-sprites` run. Re-run and redeploy when new generations are added.
- Animated GIF sprites use plain `<img>` — `next/image` does not animate GIFs.

## Optional: Capacitor (deferred)

Native iOS/Android builds via Capacitor are optional. Simplest path: point Capacitor WebView at the deployed PWA URL rather than static export.
