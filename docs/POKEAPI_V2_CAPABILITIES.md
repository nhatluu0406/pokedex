# PokeAPI v2 Capabilities Review

> **Documentation Source:** [PokeAPI v2 Docs](https://pokeapi.co/docs/v2)  
> **Status:** Full API surface area review for Pokedex project expansion.

This document outlines the complete capabilities of PokeAPI v2, categorized by resource types. It highlights what the API can provide to help brainstorm future features for the "Best Pokedex Ever" vision.

---

## 1. Pokémon Core Data (`/pokemon`, `/pokemon-species`)
This is the heart of the API and provides everything needed for a comprehensive Pokémon profile.

### Basic Information
*   **Base Data:** Name, height, weight, base experience, order.
*   **Sprites:**
    *   Front/Back/Shiny sprites.
    *   `front_female` / `front_shiny_female` for gender differences.
    *   High-res official artwork (`sprites.other.official-artwork`).
    *   Animated Showdown GIFs (`sprites.other.showdown`).
*   **Cries (Audio):** OGG audio files for latest and legacy generation cries.
*   **Forms & Varieties:** Alternate forms (e.g., Alolan, Galarian, Mega Evolutions) and variations.

### Species Data (`/pokemon-species`)
*   **Flavor Text (Pokédex Entries):** Multi-language descriptions across all game versions.
*   **Taxonomy:** `genera` (e.g., "Seed Pokémon").
*   **Categories:** `is_legendary`, `is_mythical`, `is_baby`.
*   **Physical Traits:** `color` (Red, Blue), `shape` (Bipedal, Quadruped).
*   **Habitats:** The natural environment (Cave, Forest, Grassland).
*   **Breeding:** `egg_groups`, `hatch_counter` (steps to hatch), `gender_rate` (male/female ratio).
*   **Capture Data:** `capture_rate`, `base_happiness`.

### Battle Stats & Types
*   **Base Stats:** HP, Attack, Defense, Sp. Atk, Sp. Def, Speed. Includes Effort Values (EVs) yielded upon defeat.
*   **Types:** Primary and secondary typing (`/type`).
*   **Type Effectiveness:** The `/type/{id}` endpoint provides complete damage relations (double damage to/from, half damage to/from, no damage to/from).

---

## 2. Abilities & Moves (`/ability`, `/move`)

### Abilities
*   **Effect Text:** Detailed descriptions of what the ability does in battle (`effect_entries`) and a short summary (`short_effect`).
*   **Pokémon with Ability:** A reverse-lookup list of all Pokémon that can have this ability (including hidden abilities).

### Moves
*   **Move Mechanics:** Power, Accuracy, PP (Power Points), Priority, Damage Class (Physical, Special, Status).
*   **Status Effects:** `meta` object contains details on ailments caused (e.g., Paralysis, Burn), flinch chance, stat changes, and critical hit rates.
*   **Targeting:** Who the move hits (e.g., specific opponent, all opponents, user, field).
*   **Learnset (`/pokemon/{id}.moves`):** Exactly how and when a Pokémon learns a move (Level up, TM/HM, Egg Move, Move Tutor).

---

## 3. Evolution (`/evolution-chain`, `/evolution-trigger`)
*   **Evolution Trees:** Deeply nested JSON representing the entire evolutionary family (e.g., Pichu → Pikachu → Raichu).
*   **Evolution Details (Triggers):** The precise conditions required for an evolution to occur:
    *   `min_level` (e.g., Level 36).
    *   `item` (e.g., Thunder Stone).
    *   `min_happiness`, `min_affection`, `time_of_day`.
    *   Location-based or trade-based requirements.

---

## 4. Items & Berries (`/item`, `/berry`)

### Items
*   **Categories:** Healing items, Poké Balls, Held Items, Evolution Stones, Key Items.
*   **Attributes:** Cost, Fling power, and effect text.
*   **Sprites:** Small 30x30 icons for every item.

### Berries
*   **Growth Mechanics:** Growth time, max harvest, soil dryness.
*   **Flavors:** Spicy, Dry, Sweet, Bitter, Sour (used for Poffins/Pokéblocks).
*   **Firmness:** Soft, Hard, Super Hard.

---

## 5. Encounters & Locations (`/location`, `/encounter-method`)
*   **Regions:** Kanto, Johto, Hoenn, etc.
*   **Location Areas:** Specific routes or dungeon floors.
*   **Encounter Data (`/pokemon/{id}/encounters`):** Tells you exactly where to catch a Pokémon, in which game version, at what level range, and the percentage chance of encountering it.
*   **Methods:** Walking in tall grass, surfing, fishing (Old Rod vs. Super Rod).

---

## 6. Games (`/generation`, `/version`, `/pokedex`)
*   **Generations:** Groupings of games, species, and moves introduced at the same time (Gen 1 through Gen 9).
*   **Versions:** Specific game releases (Red, Blue, Emerald, Scarlet, Violet).
*   **Pokédexes:** Regional Pokédex orderings (e.g., Kanto Pokédex vs. National Pokédex).

---

## Strategic Recommendations for Pokedex Expansion

Based on the full capabilities of PokeAPI v2, here is a summary of the most highly recommended integrations for our project's future:

1.  **Type Effectiveness Engine:** Use `/type` data to build a universal Weakness/Resistance calculator for both individual Pokémon and custom Teams.
2.  **Detailed Evolution UI:** Leverage `evolution_details` to show the exact items, levels, or friendship requirements on the evolution tree.
3.  **Comprehensive Filtering:** Use `color`, `habitat`, `shape`, `egg_groups`, and `growth_rate` for advanced dashboard filters.
4.  **Gender toggles:** Utilize `gender_rate` and `front_female` sprites to show visual differences.
5.  **Interactive Audio:** Download and play the `.ogg` files from the `cries` object.
6.  **"Where to Catch" Tab:** Use `/pokemon/{id}/encounters` to add a location tab detailing where to find the Pokémon across different game versions.
7.  **Moveset Explorer:** Build a comprehensive moves tab showing Level-up moves vs. TM moves, complete with Power/Accuracy stats.
