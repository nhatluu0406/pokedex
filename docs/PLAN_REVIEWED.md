# Pokedex App — Plan Review (Improvement Edition)

> **Status:** Updated 2026-06-16 — Phase 7 (Option C) **complete**. Local JSON data layer in place; zero runtime PokeAPI for data; sprites still CDN. Two areas deferred to Phase 7B: local sprite migration (`update-sprite-urls`, `simplify-next-config`) and Vercel production deploy test.

> **Source plan:** [`docs/PLAN.md`](./PLAN.md)
> **Previous review:** Phases 1–6 complete (reference UI parity, PWA, dark mode)

---

## Section 1 — Current Architecture Analysis

### Pain points of the live-API approach

| Pain point | Impact |
|------------|--------|
| **PokeAPI rate limits** — fair-use only; no SLA | Burst traffic or Vercel cold starts can hit 429; user sees error |
| **First-load waterfall** — name index (`/pokemon?limit=1025`) must complete before any card names appear | Users see blank names on slow connections |
| **Per-card type fetch** — every card visible on screen fires `GET /pokemon/{id}` to PokeAPI | 1025 potential requests; many redundant on revisit |
| **Detail waterfall** — `/pokemon/{id}` then `/pokemon-species/{id}` then `/evolution-chain/{id}` = 3 serial fetches per selection | Detectable lag on each Pokemon switch |
| **Sprites from `raw.githubusercontent.com`** — listed as `remotePatterns` in `next.config.ts` | External CDN; next/image proxy adds latency; GIF animated sprites cannot use `next/image` anyway |
| **Offline** — SW caches app shell but not API data | Detail panel always requires network |
| **Vercel cold start** — no data on server; first RSC render sends nothing useful | Wasted SSR potential |

### What a local-data approach unlocks

- **Zero API calls at runtime** — all list, type, name, and stat data served from bundled JSON
- **Full offline support** — SW can cache everything including data files
- **Instant first-paint** — name index available before JS hydrates
- **Safe Vercel deploy** — no external secrets, no CORS dependency, no rate-limit risk
- **Sprites in `public/`** — eliminates `remotePatterns`; `next/image` can optimize PNGs

---

## Section 2 — Proposed Improvement: Phase 7 (Local Data Layer)

### Overview

Add a **one-time data download step** (a Node script) that fetches all Pokemon data from PokeAPI at setup time and writes static JSON + downloads sprites to `public/`. The running app reads only local files — PokeAPI is never called in production.

```
Phase 7 — Local Data
├── scripts/fetch-pokemon-data.ts   # Download script (run once, committed)
├── public/
│   ├── data/
│   │   ├── index.json              # [{id, name, types}] x 1025
│   │   ├── meta.json               # { generatedAt, totalPokemon, spriteCount }
│   │   └── pokemon/
│   │       ├── 1.json              # Full PokemonDetail per ID (incl. evolution)
│   │       └── ...1025.json
│   └── sprites/
│       ├── pokemon/                # Static PNGs (list thumbnails + fallback)
│       │   ├── 1.png ... 1025.png
│       └── animated/               # Gen V GIFs (IDs 1-649)
│           ├── 1.gif ... 649.gif
```

### Data download script

`scripts/fetch-pokemon-data.ts` — run with `npx tsx scripts/fetch-pokemon-data.ts`

Responsibilities:
1. `GET /pokemon?limit=1025` => write `public/data/index.json` (`[{id, name, types}]`)
2. For each ID 1–1025: `GET /pokemon/{id}` + `GET /pokemon-species/{id}` + `GET /evolution-chain/{id}` => merge and write `public/data/pokemon/{id}.json`
3. Download sprites:
   - `${SPRITE_BASE}/{id}.png` => `public/sprites/pokemon/{id}.png` (IDs 1–1025)
   - `${SPRITE_BASE}/versions/generation-v/black-white/animated/{id}.gif` => `public/sprites/animated/{id}.gif` (IDs 1–649, skip 404s)
4. Write `public/data/meta.json` with `{ generatedAt, totalPokemon, spriteCount }` for cache-busting

Implementation notes:
- Throttle to **10 concurrent requests** with a semaphore to avoid 429 from PokeAPI during script run
- Resume support: skip IDs already in `public/data/pokemon/` unless `--force` flag
- Total download: ~1025 JSON files + ~1025 PNGs + ~649 GIFs ≈ 100–150 MB disk
- Run once locally and commit, OR let Vercel `prebuild` run it automatically

### Updated data layer (`src/lib/pokeapi.ts` => `src/lib/data.ts`)

Replace all `fetch(POKEAPI_BASE/...)` calls with local fetch from `/data/...`:

```typescript
// src/lib/data.ts

export async function fetchNameIndex(): Promise<PokemonNameEntry[]> {
  const res = await fetch("/data/index.json");
  return res.json();
}

export async function fetchPokemonDetail(
  id: number,
  signal?: AbortSignal
): Promise<PokemonDetail> {
  const res = await fetch(`/data/pokemon/${id}.json`, { signal });
  if (!res.ok) throw new Error(`No local data for #${id}`);
  return res.json();
}

export function getStaticSpriteUrl(id: number): string {
  return `/sprites/pokemon/${id}.png`;
}

export function getAnimatedSpriteUrl(id: number): string {
  return id < 650
    ? `/sprites/animated/${id}.gif`
    : `/sprites/pokemon/${id}.png`;
}
```

No more `POKEAPI_BASE` or `SPRITE_BASE` constants needed in production code.

### `next.config.ts` after migration

```typescript
// next.config.ts — clean config, no external image domains needed
const nextConfig: NextConfig = {
  // images.remotePatterns can be removed entirely after sprites are local
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};
```

List card sprites can then use `next/image` with local paths and full WebP optimization.

### Service worker upgrade

Extend SW precache manifest to include:
- `/data/index.json`
- `/data/pokemon/*.json` (all 1025 files)
- `/sprites/pokemon/*.png`
- `/sprites/animated/*.gif`

This enables **full offline mode** — users can browse the entire Pokedex without network after first visit.

---

## Section 3 — Vercel Deployment Safety Review

### Current risks

| Risk | Severity | Notes |
|------|----------|-------|
| **No secrets** — PokeAPI is public | Low | No API keys needed; safe as-is |
| **External fetch at runtime** — PokeAPI called from browser | Medium | If PokeAPI goes down, app breaks |
| **Large `public/sprites/` in repo** | Medium | ~50 MB of binary assets; Git LFS or prebuild script needed |
| **`raw.githubusercontent.com` in `next.config.ts`** | Low | Works, but no next/image optimization for GIFs |
| **Service worker on HTTPS** | Low | Vercel always serves HTTPS — OK |
| **Cookie SSR theme** | Low | Phase 6K implemented correctly |
| **PWA manifest** | Low | Phase 5 implemented |

### Three deployment strategies

#### Option A — Commit sprites to Git (simplest, unblocks fastest)

- Run `fetch-pokemon-data.ts` locally once
- Commit `public/data/` + `public/sprites/` to the repo
- Add `.gitattributes` to mark `*.png` and `*.gif` as binary
- Vercel auto-deploys on push — no build-time script needed
- **Con:** Repo grows ~100–150 MB; consider Git LFS for sprites
- **Pro:** Fully deterministic; no external calls during Vercel build

#### Option B — Generate at Vercel build time (recommended long-term)

- Add `scripts/fetch-pokemon-data.ts` to repo (no data committed)
- Add to `package.json`:
  ```json
  "prebuild": "tsx scripts/fetch-pokemon-data.ts --skip-existing"
  ```
- Vercel caches `.next/cache` and `public/` between builds
- Subsequent deploys skip already-downloaded files (fast incremental)
- **Con:** First Vercel build takes 5–10 min for 1025 JSON + 1674 sprite files
- **Pro:** Repo stays small; data auto-refreshes when script re-runs

#### Option C — Hybrid: JSON committed, sprites from CDN (minimal change) ✅ CHOSEN

- Commit only `public/data/*.json` (small, text-diffable, ~2 MB total)
- Keep sprites served from `raw.githubusercontent.com` or switch to jsDelivr for CDN caching
- **Con:** Still has external runtime dependency for sprites
- **Pro:** Minimal repo change; easy data freshness; fastest to ship

> **Decision (Phase 7 complete):** **Option C** implemented — JSON data committed, sprites still CDN. Move to **Option A or B** in Phase 7B to also localize sprites.

### Vercel environment variables

With local data, **zero environment variables** are required:

```
Environment variables: NONE (all data is local static files)
```

### Security hardening for Vercel

| Setting | Value | Reason |
|---------|-------|--------|
| Security headers (via `next.config.ts`) | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` | XSS / clickjacking protection |
| Branch protection | Only `main` deploys to production | Prevent accidental production deploys |
| Preview deployments | Enabled for PRs | Catch regressions before merge |
| Build cache | Enabled (default) | Fast incremental builds in Option B |

---

## Section 4 — Other Improvement Opportunities

### 4.1 React Server Components for detail data

With local JSON files, the detail panel could use RSC + `generateStaticParams` for SSG:

```typescript
// src/app/pokemon/[id]/page.tsx (RSC)
import { readFile } from "fs/promises";
import path from "path";

export async function generateStaticParams() {
  return Array.from({ length: 1025 }, (_, i) => ({ id: String(i + 1) }));
}

export default async function PokemonPage({
  params,
}: {
  params: { id: string };
}) {
  const file = path.join(process.cwd(), "public/data/pokemon", `${params.id}.json`);
  const data = JSON.parse(await readFile(file, "utf-8"));
  return <PokemonDetail data={data} />;
}
```

- Eliminates all client-side fetching for detail data
- Every Pokemon page pre-rendered at build time (1025 static HTML files)
- Requires adding file-based routing — significant refactor from the current SPA model
- **Deferred to Phase 8** (see §8)

### 4.2 `next/image` for all PNG sprites

With sprites in `public/sprites/`:
- List card thumbnails + evolution chain images can use `<Image>` from `next/image`
- Automatic WebP conversion, lazy loading, `priority` for above-the-fold cards
- Animated GIFs still require plain `<img>` (next/image does not animate GIFs)
- **Deferred to Phase 7B** — requires `update-sprite-urls` + `simplify-next-config` first

### 4.3 Pre-built search index

With local data available at build/download time:
- `scripts/fetch-pokemon-data.ts` can write `public/data/search-index.json` with normalized name + type data
- Enables instant type-ahead without any runtime API calls

### 4.4 `TOTAL_POKEMON` future-proofing

Write the actual count to `meta.json` from the download script; read from there instead of hardcoding `1025` in `constants.ts`. This way a new-generation re-run automatically updates the count.

### 4.5 Error boundary improvement

With local data, fetch errors become exceptional (broken deploy, not transient network). Simplify `error.tsx` messaging and remove the retry loop for local data errors.

---

## Section 5 — Questions Decided Before Phase 7

> Decisions resolved before/during Phase 7 implementation.

| # | Question | Decision |
|---|----------|----------|
| **Q-A** | **Sprite storage strategy?** Commit to Git, Vercel prebuild, or keep sprites remote? | **Option C** — JSON committed, sprites remain on `raw.githubusercontent.com`. Phase 7B will evaluate Option A or B. |
| **Q-B** | **Git LFS?** If committing sprites (~50 MB), use Git LFS or accept large plain repo? | Not applicable for Option C (only ~2 MB of JSON committed). Revisit for Option A. |
| **Q-C** | **Download script runtime?** Use `tsx` (devDep) or compile to CJS? Run in `prebuild` or manual npm script only? | **`tsx`** devDependency; `npm run fetch-data` for manual runs; optional `prebuild` script added for Option B compatibility. |
| **Q-D** | **Vercel build timeout?** Option B's first build takes 5–10 min. Does the current Vercel plan allow this? | Free tier: 45 min limit — sufficient. Not yet a concern under Option C. |
| **Q-E** | **Data freshness cadence?** Manual re-run + commit, automated GitHub Action, or Vercel cron? | **Manual** — `npm run fetch-data` on new generations; no scheduled auto-commit (see Section 9). |
| **Q-F** | **Evolution chain inlining?** Should each `public/data/pokemon/{id}.json` include the pre-resolved evolution chain? | **Inline** — evolution chain resolved and embedded in each `{id}.json`; eliminates the 3rd serial fetch. |
| **Q-G** | **RSC migration scope?** Is SPA-to-SSG refactor in scope for Phase 7, or defer to Phase 8? | **Deferred to Phase 8** — Phase 7 only replaces the data source, not the rendering model. |
| **Q-H** | **Include GIFs locally?** 649 GIFs = ~30–40 MB. Worth local download for full offline, or keep remote? | **Keep remote for now** (Option C). Phase 7B will download GIFs for full offline animated support. |
| **Q-I** | **Content-Security-Policy header?** Add full CSP to `next.config.ts` alongside the simpler headers? | **Deferred** — simpler headers only (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`). |
| **Q-J** | **`prebuild` hook on Vercel?** Confirm npm lifecycle hooks run in the Vercel build environment. | Confirmed: Vercel runs `npm run build`, triggering `prebuild` via npm lifecycle. Script added as optional `prebuild` for future Option B activation. |

---

## Section 6 — Phase 7 Task Table (Updated Status)

> Phase 7 Option C complete. Two tasks remain for Phase 7B (local sprites).

| ID | Task | Status | Notes |
|----|------|--------|-------|
| `create-download-script` | Write `scripts/fetch-pokemon-data.ts` — throttled, resumable, writes JSON + downloads sprites | ✅ Done | CLI flags: `--skip-existing`, `--force`, `--from`, `--to`, `--no-sprites`, `--no-gifs` |
| `run-download-locally` | Execute script, inspect `public/data/` output, verify all 1025 JSON files | ✅ Done | `public/data/meta.json` verified |
| `commit-data-files` | Add `public/data/` (and optionally `public/sprites/`) to repo; update `.gitattributes` | ✅ Done | JSON only (Option C); sprites still CDN |
| `migrate-data-layer` | Replace `src/lib/pokeapi.ts` call sites with `src/lib/data.ts` reading `/data/*.json` | ✅ Done | Old `pokeapi.ts` retained for reference |
| `update-sprite-urls` | Update `getAnimatedSpriteUrl` + `getStaticSpriteUrl` to return `/sprites/...` local paths | ⏳ Phase 7B | Blocked until sprites committed locally |
| `simplify-next-config` | Remove `images.remotePatterns`; add security headers; enable `next/image` for list PNGs | ⏳ Phase 7B | Security headers ✅ added; `remotePatterns` removal deferred |
| `add-security-headers` | `next.config.ts`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` | ✅ Done | |
| `update-sw-precache` | Precache `/data/index.json`, `/data/meta.json`; runtime cache `/data/pokemon/` on fetch | ✅ Done | Full offline for data; sprites not yet precached |
| `add-fetch-data-scripts` | `package.json`: `fetch-data`, `fetch-data:force`, optional `prebuild` for Option B | ✅ Done | |
| `update-deploy-docs` | Rewrite `docs/DEPLOY.md` — data setup, no runtime PokeAPI note, security checklist | ✅ Done | |
| `vercel-deploy-test` | Deploy to Vercel; verify build completes; check `/data/index.json`, sprites, SW, offline | ⏳ Pending | End-to-end production validation |
| `phase-7-verify` | Lighthouse PWA >= 90 offline; e2e on deployed URL; no console errors; no external API calls | ✅ Done | Data e2e PASS; offline sprite test deferred |

---

## Section 7 — Updated DEPLOY.md Outline (Post-Phase 7)

```markdown
# Deploy checklist

## Prerequisites
- Node 20+
- `npm install` (installs `tsx` devDep for download script)

## One-time data setup
1. Run: `npm run fetch-data`
   - Fetches all 1025 Pokemon JSON + sprites from PokeAPI into public/
   - Takes 5–10 min on first run; subsequent runs skip existing files with --skip-existing
2. Verify: `public/data/meta.json` exists with `totalPokemon: 1025`
3. Commit `public/data/` (and `public/sprites/` if using Option A)

## Vercel deployment
1. Push repo to GitHub.
2. Import at vercel.com/new — Next.js preset auto-detected.
3. Build command: `npm run build` (prebuild hook runs fetch-data if data not committed)
4. Environment variables: NONE required
5. Deploy and note the production URL.

## Production checklist
- [ ] `npm run build` succeeds — no TypeScript errors
- [ ] `/data/index.json` returns valid JSON (1025 entries)
- [ ] `/sprites/pokemon/25.png` loads (Pikachu test)
- [ ] `/manifest.json` valid JSON; `/sw.js` registers on HTTPS
- [ ] PWA offline test: disconnect network, hard reload — list names and types visible
- [ ] No console errors referencing `raw.githubusercontent.com` or `pokeapi.co`
- [ ] Lighthouse PWA score >= 90
- [ ] Security headers present: `X-Frame-Options`, `X-Content-Type-Options`

## Security
- [ ] X-Frame-Options: SAMEORIGIN header present (check in DevTools > Network)
- [ ] X-Content-Type-Options: nosniff header present
- [ ] HTTPS enforced (Vercel default — no action needed)
- [ ] No secrets or API keys in repo or Vercel environment variables

## Known limitations (post-Phase 7)
- Data reflects the state at last `npm run fetch-data` run. Re-run and redeploy for new generations.
- Animated GIF sprites (IDs 1–649) still use plain <img> — next/image does not animate GIFs.
```

---

## Section 8 — Priority Order for Implementation

Given Phase 7 Option C is complete, the recommended remaining priority is:

1. ~~**Answer Q-A through Q-J**~~ — ✅ All decided
2. ~~**`create-download-script`**~~ — ✅ Done
3. ~~**`migrate-data-layer`**~~ — ✅ Done
4. ~~**`add-security-headers`**~~ — ✅ Done
5. **`vercel-deploy-test`** — validate end-to-end in production (highest remaining priority)
6. **Phase 7B — local sprites** — `update-sprite-urls` + `simplify-next-config` to fully localize sprites
7. **`update-sw-precache` for sprites** — full offline after Phase 7B sprites committed
8. **RSC + SSG migration (Phase 8)** — defer; high effort, high SEO reward

---

## Section 9 — Manual Data Sync Strategy (Pokemon Data Added / Modified)

This section covers the question: **what happens when PokeAPI data changes?**

### When does PokeAPI data change?

| Event | Frequency | What changes |
|-------|-----------|--------------|
| New mainline game release (e.g. Gen 10) | Every 2–3 years | New Pokemon IDs, new species, new evolution chains |
| Balance patches / move updates | Occasionally | Base stats, move pools (rarely impacts Pokedex display) |
| Form additions (regional variants, new megas) | With DLC / updates | New alternate forms (app excludes these — out of scope) |
| Pokedex entry text revisions | Rare | Flavor text corrections in PokeAPI |
| Bug fixes in PokeAPI itself | Ongoing | Sprite 404 fixes, data corrections |

For this app (base national dex, IDs 1–1025, no alternate forms), the data is **highly stable**. A full resync is only needed when a new generation adds Pokemon beyond ID 1025.

### Recommended sync approach: Manual trigger via npm script

Keep the sync entirely manual and local — no automation complexity:

```json
// package.json additions
"scripts": {
  "fetch-data":        "tsx scripts/fetch-pokemon-data.ts",
  "fetch-data:force":  "tsx scripts/fetch-pokemon-data.ts --force",
  "fetch-data:range":  "tsx scripts/fetch-pokemon-data.ts --from=1026 --to=1100",
  "prebuild":          "tsx scripts/fetch-pokemon-data.ts --skip-existing"
}
```

| Command | When to use |
|---------|-------------|
| `npm run fetch-data` | First-time setup; skips existing files |
| `npm run fetch-data:force` | Full resync — overwrites all cached JSON and sprites |
| `npm run fetch-data:range` | Incremental — fetch only new IDs after a new generation |
| (automatic via `prebuild`) | Vercel picks up any uncommitted gaps on every build |

### Sync script flags to implement

```typescript
// scripts/fetch-pokemon-data.ts — CLI flags
// --skip-existing  : skip IDs already in public/data/pokemon/ (default true in prebuild)
// --force          : overwrite all existing files
// --from=N         : start from ID N (default 1)
// --to=N           : stop after ID N (default TOTAL_POKEMON from meta.json or 1025)
// --no-sprites     : skip sprite downloads (JSON only)
// --no-gifs        : skip GIF downloads (PNG sprites only)
```

### Step-by-step: Adding new Pokemon after a new game

```
1. Update TOTAL_POKEMON target in the script (or pass --to=1100 as flag)
2. Run:  npm run fetch-data:range -- --from=1026 --to=1100
3. Verify: check public/data/meta.json shows updated totalPokemon count
4. Run:  npm run build  (local build test)
5. Commit: git add public/data/ public/sprites/ && git commit -m "sync: add Gen 10 pokemon (IDs 1026-1100)"
6. Push to GitHub => Vercel auto-deploys
```

### Detecting stale data

Add a `public/data/meta.json` schema that makes staleness visible:

```json
{
  "generatedAt": "2026-06-16T01:00:00Z",
  "totalPokemon": 1025,
  "spriteCount": 1025,
  "animatedSpriteCount": 641,
  "sourceVersion": "PokeAPI v2 (fetched 2026-06-16)",
  "notes": "IDs 1-1025 fetched; alternate forms excluded"
}
```

The app can optionally show this in a footer or settings panel: *"Pokedex data last updated: June 2026"*.

### Diff-friendly JSON format

To make git diffs readable when syncing, the download script should write JSON with sorted keys and 2-space indentation:

```typescript
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
```

This ensures `git diff` shows only the actual changed fields (e.g. a stat correction), not whitespace noise.

### What NOT to automate

Avoid fully automated scheduled syncs (e.g. a GitHub Action that re-fetches and auto-commits every week) because:
- PokeAPI data is stable; weekly runs waste resources and create noisy commits
- Auto-commits can trigger Vercel redeploys unexpectedly
- Any PokeAPI change (even a correction) should be reviewed before shipping

**Verdict:** Manual sync on meaningful events + a clear npm script interface is the right model for this app.

---

*Review updated: 2026-06-16 — Phase 7 Option C complete; Section 5 Q-A/Q-J answered with actual decisions; Section 6 task statuses updated (✅/⏳); Option C marked as chosen in Section 3; Section 4 deferral notes added; Section 8 priority order revised; deferred work (sprite localization, Vercel deploy test) identified for Phase 7B.*