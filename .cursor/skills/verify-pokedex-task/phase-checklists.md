# Per-phase verification checklists

Used by the [verify-pokedex-task](SKILL.md) skill. After **all tasks in a phase** are complete, the parent agent launches three Cursor subagents (test-author → test-runner → verifier). Test cases are saved under [tests/](../../../tests/).

---

## phase-1

**Prerequisite:** All Phase 1 tasks marked `[x]` in PLAN.md:

`scaffold-nextjs`, `data-layer`, `sprite-component`, `list-panel`, `detail-panel`, `wire-page`

**Test output location:** `tests/phase-1/` and `tests/reports/phase-1-report.md`

### Files expected (full phase)

```
package.json, tsconfig.json, next.config.ts, eslint.config.mjs
src/app/layout.tsx, page.tsx, globals.css
src/lib/pokeapi.ts, types.ts, constants.ts
src/hooks/usePokemonList.ts, usePokemonDetail.ts
src/utils/format.ts
src/components/shared/TypeBadge.tsx
src/components/list/PokemonList.tsx, PokemonCard.tsx
src/components/detail/PokemonDetail.tsx, AnimatedSprite.tsx, StatBar.tsx
public/assets/
```

### Automated checks (test-runner subagent)

```powershell
npm run lint
npm run build
npm test
```

### Pass criteria (implementation)

**Scaffold & config**

- App Router with `src/` directory, TypeScript, no Tailwind
- `next.config.ts` has `images.remotePatterns` for `raw.githubusercontent.com` / PokeAPI sprites

**Data layer**

- `fetchPokemonById(id)` → typed `PokemonDetail` with optional Phase 2 fields
- `speciesUrl` from `pokemon.species.url`
- `getAnimatedSpriteUrl` / `getStaticSpriteUrl` correct
- Stats mapped by `stat.name`; `TYPE_COLORS`, `STAT_COLORS`, `TOTAL_POKEMON` (1025)

**Components & hooks**

- `AnimatedSprite`: plain `<img>`, Gen V GIF for id < 650, `naturalHeight * 3`, `onError` + `naturalWidth === 0` PNG fallback, pixelated
- `PokemonList` + `usePokemonList`: IDs 1–1025, 30 at a time, Load more, selected highlight, `next/image` thumbnails
- `PokemonDetail` + `usePokemonDetail`: empty / loading / loaded / error + retry, `AbortController`
- `page.tsx`: only `selectedId` lifted; two-panel desktop + stacked mobile

**Accessibility**

- List cards keyboard-accessible; descriptive sprite `alt` text

### Unit test targets (test-author subagent)

| Module | What to test |
|--------|----------------|
| `src/lib/pokeapi.ts` | `getAnimatedSpriteUrl`, `getStaticSpriteUrl`, stat mapping in `fetchPokemonById` mapper |
| `src/lib/constants.ts` | `TYPE_COLORS`, `STAT_COLORS`, `TOTAL_POKEMON` defined |
| `src/utils/format.ts` | `capitalizeName`, `formatHeight`, `formatWeight` |

### Browser test script

Saved to `tests/phase-1/browser-scenarios.md`. Run at http://localhost:3100 after `npm run dev`:

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Initial load | Grid shows ~30 Pokemon cards with sprites, names, type badges |
| 2 | Load more | Click "Load more" — additional cards appear |
| 3 | Empty detail | Right panel shows "Select a Pokemon to display here." |
| 4 | Select Pikachu (#25) | Animated GIF sprite; ID, name, types, height, weight, abilities, 6 stats + total |
| 5 | Select Charizard (#6) | Animated GIF plays |
| 6 | Select Pokemon #650+ | Static PNG sprite (no broken image) |
| 7 | Selected highlight | Clicked card has distinct border/style vs others |
| 8 | Rapid switching | Click several Pokemon quickly — detail shows correct Pokemon (no stale data) |
| 9 | Error retry | Simulate offline or invalid id if possible — error message + retry works |
| 10 | Mobile width (<1100px) | Stacked layout: list above, detail below, scrollable |

### Phase 1 success criteria (from PLAN.md)

All items in **Phase 1 success criteria** must pass before marking phase complete.

---

## phase-2

**Prerequisite:** All Phase 2 features from PLAN.md implemented.

**Test output location:** `tests/phase-2/` and `tests/reports/phase-2-report.md`

### Features to verify

| Feature | Pass criteria |
|---------|---------------|
| **Search** | Filter list by name; uses cached name index |
| **Infinite scroll** | Scrolling loads more Pokemon without "Load more" button |
| **Evolution chain** | Shows evolution sprites + levels; clickable to switch Pokemon |
| **Pokedex entry** | English flavor text displayed in detail panel |
| **Panel slide animation** | Detail panel slides in/out on Pokemon change (desktop) |
| **Mobile responsive** | Full-screen modal + colored backdrop at `< 1100px` |
| **Loading screen** | Rotating Pokeball (or equivalent) on initial app load |
| **GitHub Actions CI** | Optional — workflow runs lint + build on push |

### Automated checks

```powershell
npm run lint
npm run build
npm test
```

### Browser test script

Saved to `tests/phase-2/browser-scenarios.md`:

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Search "pika" | Only matching Pokemon shown |
| 2 | Scroll to bottom | More Pokemon load automatically |
| 3 | Select Pokemon with evolutions | Evolution chain visible with level labels |
| 4 | Detail panel | Pokedex entry text displayed |
| 5 | Change Pokemon (desktop) | Slide animation on detail panel |
| 6 | Viewport < 1100px | Modal overlay + close button; backdrop tinted by type |
| 7 | Fresh page load | Loading screen appears then dismisses |

### Phase 2 success criteria

Add and check off **Phase 2 success criteria** in PLAN.md when that section is defined.

---

## phase-3

**Prerequisite:** All Phase 3 tasks marked `[x]` in PLAN.md:

`fix-card-names`, `fix-fetch-cache`, `fixed-detail-panel`, `smooth-select-ux`, `detail-scroll-layout`, `stats-reference-ui`, `detail-loading-pokeball`, `back-to-top`, `production-polish`, `phase-3-verify`

**Test output location:** `tests/phase-3/` and `tests/reports/phase-3-report.md`

### Pass criteria (implementation)

| Area | Pass criteria |
|------|---------------|
| **Card names** | Names show immediately on cards from name index (not `#id` placeholder) |
| **Fetch cache** | No sidebar double-jump when selecting Pokemon; cached data reused |
| **Fixed panel** | Desktop detail panel fixed/sticky while list scrolls |
| **Smooth select** | Selection and panel transitions smooth without layout flicker |
| **Detail scroll** | Detail content scrolls independently when it overflows |
| **Stats layout** | Stats use reference horizontal layout |
| **Detail loader** | Rotating Pokeball in detail loading state |
| **Back to top** | Floating button after one viewport scroll; smooth scroll to top |
| **Production** | Metadata, openGraph, error boundary present |

### Automated checks

```powershell
npm run lint
npm run build
npm test
```

### Browser test script

Saved to `tests/phase-3/browser-scenarios.md`:

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Initial load | Card names visible immediately (not `#id`) |
| 2 | Select cached Pokemon | No sidebar double-jump; detail updates smoothly |
| 3 | Scroll list (desktop) | Detail panel stays fixed while list scrolls |
| 4 | Select different Pokemon | Smooth highlight + panel transition |
| 5 | Long detail content | Detail panel scrolls internally |
| 6 | Stats section | Horizontal reference-style layout |
| 7 | Select while loading | Rotating Pokeball shown in detail |
| 8 | Scroll past one viewport | Back-to-top button appears; click returns to top |

### Phase 3 success criteria

All items in **Phase 3 success criteria** in PLAN.md must pass before marking phase complete.
