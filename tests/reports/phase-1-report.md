# Verification: phase-1

**Date:** 2026-06-14
**Result:** PASS

## Automated checks

| Check | Result | Output |
|-------|--------|--------|
| lint | PASS | exit 0, eslint clean |
| build | PASS | exit 0, Next.js 16.2.9 compiled, TypeScript finished, routes / and /_not-found |
| unit tests | PASS | exit 0, Vitest 3 files 14 tests passed |

## Browser tests

| # | Scenario | Result | Notes |
|---|----------|--------|-------|
| 1 | Initial load | NOT RUN | Manual — requires browser at localhost:3100 with live PokeAPI |
| 2 | Load more | NOT RUN | Partial code review PASS (button + 30-id pagination); visual confirmation pending |
| 3 | Empty detail | PASS (code review) | Exact message in PokemonDetail when selectedId is null |
| 4 | Select Pikachu (#25) | NOT RUN | Detail fields code-verified; GIF animation needs manual check |
| 5 | Select Charizard (#6) | NOT RUN | Manual — animated GIF playback |
| 6 | Select Pokemon #650+ | NOT RUN | PNG URL logic code-verified (id >= 650); image render needs manual check |
| 7 | Selected highlight | PASS (code review) | .pokemon-card-selected border-color #7195dc |
| 8 | Rapid switching | PASS (code review) | AbortController cancels in-flight; data reset on id change |
| 9 | Error retry | NOT RUN | Error message + retry button code-verified; offline simulation manual |
| 10 | Mobile width (<1100px) | PASS (code review) | globals.css flex-direction: column at max-width 1099px |

## Code review

**Files checked:** All expected phase-1 files present (see phase-checklists.md).

**Scaffold & config:** App Router with src/, TypeScript, global CSS (no Tailwind). next.config.ts remotePatterns for raw.githubusercontent.com/PokeAPI/sprites.

**Data layer:** fetchPokemonById maps speciesUrl, stats by stat.name, typed PokemonDetail with optional Phase 2 fields. getAnimatedSpriteUrl (GIF if id < 650 else PNG), getStaticSpriteUrl. TYPE_COLORS, STAT_COLORS, TOTAL_POKEMON=1025.

**Components & hooks:** AnimatedSprite uses plain img, naturalHeight*3 scaling, onError and naturalWidth===0 PNG fallback, pixelated rendering. usePokemonList paginates IDs 1–1025 in batches of 30 with Load more and cache. PokemonCard uses next/image, button accessibility, selected highlight. usePokemonDetail with AbortController, empty/loading/error/retry states. page.tsx lifts only selectedId; two-panel desktop (320px detail) and stacked mobile layout.

**Accessibility:** Keyboard-accessible list cards (button), descriptive alt text on sprites.

**Unit test coverage:** pokeapi (sprite URLs, stat mapping, speciesUrl, error throw), constants (TYPE_COLORS, STAT_COLORS, TOTAL_POKEMON, SPRITE_BASE), format (capitalizeName, formatHeight, formatWeight).

## Failures

None

## Recommended fixes

None — optional: run browser-scenarios.md manually at http://localhost:3100 to confirm visual/GIF behavior before Phase 2.
