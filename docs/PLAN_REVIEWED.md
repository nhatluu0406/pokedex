# Pokedex App — Plan Review (Future Roadmap)

> **Completed work:** [COMPLETED.md](./COMPLETED.md)  
> **Active tasks:** [PLAN.md](./PLAN.md)  
> **Live:** [pokedex-delta-seven-41.vercel.app](https://pokedex-delta-seven-41.vercel.app)

---

## Phase 9 — completed (2026-06-17)

| Item | Status |
|------|--------|
| Showdown sprites (650+) | Done — `--showdown` flag |
| Type effectiveness chart | Done — `types.json` + `TypeEffectiveness` |
| Pokémon cries | Done — `--cries` + play button |
| Genus + Legendary/Mythical badges | Done — fetch script + `PokemonMeta` |
| SW v4 | Done — precache `types.json`, cache `/cries/` |

**Before deploy:** run full data refresh:

```bash
npm run fetch-types
npm run fetch-data:force -- --cries --showdown
```

---

## Phase 10 — Best Pokedex Ever (UX & Advanced Features)

To make this the ultimate, premium Pokedex experience, the following features are proposed for the next major iteration:

### 1. Advanced Search & Filtering (UI Implementation)
- **Search by Number:** Support typing a National Dex number (e.g., "1000") in the search bar to instantly jump to or filter for that specific Pokémon.
- **Tactical Filters:** Filter by "Weak to [Type]" or "Resists [Type]".
- **Undeployed Filters (Data ready, UI needed):** 
  - **Baby Pokémon:** Add UI filter for "Baby" category.
  - **Color Filters:** Add UI chips/dropdowns to filter by color (e.g., "Red", "Blue").
  - **Habitat Filters:** Add UI chips/dropdowns to filter by habitat (e.g., "Cave", "Forest", "Sea").

### 2. Dashboard Interactivity & Animation
- **Hover Animations:** When hovering over a Pokémon card on the dashboard, animate the image (e.g., smoothly switch from static PNG to the animated Showdown GIF, or add a dynamic CSS levitate/bounce effect).
- **Smart Scroll Positioning:** When selecting a Pokémon with a high number (like #1000) or returning from its detail view, automatically scroll the dashboard to the exact position of that Pokémon. This ensures the user never loses their place in the infinite scroll.

### 3. Detail Page Depth & Premium Features
- **Compare Mode:** Select two Pokémon to view their stats, types, and sizes side-by-side in a comparison chart.
- **Global Shiny Mode:** A master toggle that turns every sprite in the entire dashboard and detail views into their Shiny variants.
- **Smooth Page Transitions:** Implement seamless view transitions between the dashboard list and the detail page, making the app feel like a native mobile application.
- **Evolution Methods (Triggers):** Parse `evolution_details` from the `/evolution-chain` API to show exactly *how* a Pokémon evolves directly on the evolution tree (e.g., "Level 36", "Use Thunder Stone", "High Friendship + Day").
- **Gender Differences (♂/♀ Sprites):** Many Pokémon have visual gender differences (e.g., Pikachu's tail, Wobbuffet's lipstick). Expose a Male/Female toggle on the detail page using the API's `front_female` and `front_shiny_female` sprites when available.

---

## Future Plan (Mobile App & Complex Features)

These features are planned for future iterations and will only be developed upon explicit request:
- **Mobile App (Capacitor):** Wrap the application using Capacitor to create a native mobile app experience for iOS and Android.
- **Team Builder:** Allow users to build, save, and share custom teams of 6 Pokémon. The app would analyze the team's combined type weaknesses and strengths.

---

## Optional backlog

| Item | QV | Notes |
|------|-----|-------|
| Shiny toggle | QV-2 | Showdown `front_shiny` |
| SVG icon migration | QV-14 | Retina + dark-mode tinting |
| CSP header | QV-11 | Deferred from Phase 7 |
| Ability descriptions | QV-6 | `GET /ability/{id}` |
| Error boundary | — | Simpler local data failure UX |
| `TOTAL_POKEMON` from `meta.json` | QV-9 | Drop hardcoded count |

---

## PokeAPI opportunities (lower priority)

| Feature | Source |
|---------|--------|
| Location areas | `GET /pokemon/{id}/encounters` |
| Official artwork | `sprites.other.official-artwork` |
| Moves tab | `moves[]` on pokemon |
| Pre-built search index | Generate `search-index.json` at fetch time |
| `meta.json` in UI | Show last-updated date |

---

## Open questions

| # | Question | Priority |
|---|----------|----------|
| **QV-2** | Shiny mode toggle in detail panel? | Medium |
| **QV-6** | Ability descriptions on hover/click? | Low |
| **QV-9** | Raise `TOTAL_POKEMON` beyond 1025? | Low |
| **QV-10** | Git LFS for `public/sprites/`? | Medium |
| **QV-11** | Strict CSP header now that resources are local? | Low |
| **QV-12** | Capacitor native wrapper still in scope? | Low |
| **QV-14** | Replace PNG UI icons with SVG library? | Medium |
| **QV-15** | **Hover Animations:** Should we switch to Showdown GIFs on hover, or use CSS transforms (like levitate/bounce) to keep the dashboard lightweight? | High |
| **QV-16** | **Scroll Preservation:** When returning from a detail page, should we use Next.js experimental `scrollRestoration` or implement a custom layout state? | High |
| **QV-17** | **Advanced Filters:** Does the API data model easily support filtering by "Weak To / Resists" globally, or do we need to calculate/index this in the fetch script first? | Medium |
| **QV-18** | **Undeployed Filters:** Where should the Color, Habitat, and Baby filters live in the UI? A dropdown, a sidebar, or horizontal scrollable chips? | High |
| **QV-19** | **Mobile App (Capacitor):** When migrating to Capacitor, will we need offline-first SQLite or stick to local JSON files? | Low |
| **QV-20** | **Team Builder:** Since it's deferred to the future, should we keep its data structures in mind now, or completely ignore it until requested? | Low |

*Resolved: QV-1 (Showdown), QV-3 (genus), QV-4 (badges), QV-5 (type chart), QV-7 (Vercel), QV-8 (partial RSC), QV-13 (cries) — see [COMPLETED.md](./COMPLETED.md).*

---

## PokeAPI fair use (fetch script)

Rate limiting removed from PokeAPI v2 (2018). Script throttle (10 concurrent) is courtesy, not requirement. Use manual `npm run fetch-data` only when data changes (new generations).
