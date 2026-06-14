# Phase 2 browser scenarios

Manual test script for phase-2 verification. Run at http://localhost:3100 after `npm run dev`.

| # | Scenario | Expected | Result | Notes |
|---|----------|----------|--------|-------|
| 1 | Search "pika" | Only matching Pokemon shown | Code verified | `usePokemonNameIndex.filterByName` + SearchBar wired in PokemonList |
| 2 | Scroll to bottom | More Pokemon load automatically | Code verified | `useInfinitePokemonList` + IntersectionObserver sentinel |
| 3 | Select Pokemon with evolutions | Evolution chain visible with level labels | Code verified | `EvolutionChain.tsx` parses chain, shows Lv. labels |
| 4 | Detail panel | Pokedex entry text displayed | Code verified | `fetchPokemonSpecies` + flavor text section in PokemonDetail |
| 5 | Change Pokemon (desktop) | Slide animation on detail panel | Code verified | `slide-in` / `slide-out` classes on desktop selection change |
| 6 | Viewport < 1100px | Modal overlay + close button; backdrop tinted by type | Code verified | Mobile modal, backdrop, close icon at `< 1100px` |
| 7 | Fresh page load | Loading screen appears then dismisses | Code verified | `LoadingScreen` shown while name index loads |

Manual confirmation recommended before release; automated code review PASS.
