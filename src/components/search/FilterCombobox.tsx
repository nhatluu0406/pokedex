"use client";

import { useEffect, useId, useRef, useState } from "react";
import { TYPE_COLORS } from "@/lib/constants";
import type {
  CategoryFilter,
  FilterGroup,
  TacticalFilter,
} from "@/utils/pokemonFilters";
import { capitalizeName, getTypeTextColor } from "@/utils/format";

const COLOR_OPTIONS = [
  "black",
  "blue",
  "brown",
  "gray",
  "green",
  "pink",
  "purple",
  "red",
  "white",
  "yellow",
] as const;

const HABITAT_OPTIONS = [
  "cave",
  "forest",
  "grassland",
  "mountain",
  "rare",
  "rough-terrain",
  "sea",
  "urban",
  "waters-edge",
] as const;

const TYPE_OPTIONS = Object.keys(TYPE_COLORS).filter(
  (type) => type !== "shadow",
);

const CATEGORY_OPTIONS: {
  value: Exclude<CategoryFilter, "all">;
  label: string;
  badgeClass: string;
}[] = [
  { value: "legendary", label: "Legendary", badgeClass: "detail-rarity-legendary" },
  { value: "mythical", label: "Mythical", badgeClass: "detail-rarity-mythical" },
  { value: "baby", label: "Baby", badgeClass: "detail-rarity-baby" },
];

const FILTER_GROUP_OPTIONS: { value: FilterGroup; label: string }[] = [
  { value: "type", label: "Type" },
  { value: "weak", label: "Weak to" },
  { value: "resist", label: "Resist" },
  { value: "color", label: "Color" },
  { value: "habitat", label: "Habitat" },
];

interface FilterCategorySelectProps {
  group: FilterGroup;
  hasActiveSelection: boolean;
  onGroupChange: (group: FilterGroup) => void;
}

export function FilterCategorySelect({
  group,
  hasActiveSelection,
  onGroupChange,
}: FilterCategorySelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selectedLabel =
    FILTER_GROUP_OPTIONS.find((option) => option.value === group)?.label ??
    "Type";

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selectGroup = (value: FilterGroup) => {
    onGroupChange(value);
    setOpen(false);
  };

  return (
    <div className="filter-dropdown" ref={rootRef}>
      <button
        type="button"
        className={`filter-dropdown-trigger${open ? " filter-dropdown-trigger-open" : ""}${hasActiveSelection ? " filter-dropdown-trigger-active" : ""}`}
        aria-label="Filter category"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="filter-dropdown-label">{selectedLabel}</span>
        <span className="filter-dropdown-chevron" aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <ul
          id={listboxId}
          className="filter-dropdown-menu"
          role="listbox"
          aria-label="Filter category"
        >
          {FILTER_GROUP_OPTIONS.map(({ value, label }) => {
            const selected = value === group;
            return (
              <li key={value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`filter-dropdown-option${selected ? " filter-dropdown-option-selected" : ""}`}
                  onClick={() => selectGroup(value)}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

interface FilterValueBarProps {
  group: FilterGroup;
  categoryFilter: CategoryFilter;
  tactical: TacticalFilter;
  selectedTypes: string[];
  selectedColors: string[];
  selectedHabitats: string[];
  onCategorySelect: (category: CategoryFilter) => void;
  onTacticalSelect: (type: string) => void;
  onTypeToggle: (type: string) => void;
  onColorToggle: (color: string) => void;
  onHabitatToggle: (habitat: string) => void;
}

function formatLabel(value: string): string {
  return value
    .replaceAll("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function TypeFilterChip({
  value,
  selected,
  onClick,
}: {
  value: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`filter-value-chip${selected ? " filter-value-chip-colored-selected" : ""}`}
      style={{
        backgroundColor: TYPE_COLORS[value],
        color: getTypeTextColor(TYPE_COLORS[value]),
      }}
      aria-pressed={selected}
      onClick={onClick}
    >
      {capitalizeName(value)}
    </button>
  );
}

export function FilterValueBar({
  group,
  categoryFilter,
  tactical,
  selectedTypes,
  selectedColors,
  selectedHabitats,
  onCategorySelect,
  onTacticalSelect,
  onTypeToggle,
  onColorToggle,
  onHabitatToggle,
}: FilterValueBarProps) {
  if (group === "type") {
    return (
      <div
        className="filter-value-bar-stack"
        role="group"
        aria-label="Filter values"
      >
        <div className="filter-value-bar-row">
          {TYPE_OPTIONS.map((value) => (
            <TypeFilterChip
              key={value}
              value={value}
              selected={selectedTypes.includes(value)}
              onClick={() => onTypeToggle(value)}
            />
          ))}
        </div>
        <div className="filter-value-bar-row">
          {CATEGORY_OPTIONS.map(({ value, label, badgeClass }) => {
            const selected = categoryFilter === value;
            return (
              <button
                key={value}
                type="button"
                className={`filter-value-chip ${badgeClass}${selected ? " filter-value-chip-colored-selected" : ""}`}
                aria-pressed={selected}
                onClick={() => onCategorySelect(value)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const valueOptions = ((): string[] => {
    switch (group) {
      case "weak":
      case "resist":
        return TYPE_OPTIONS;
      case "color":
        return [...COLOR_OPTIONS];
      case "habitat":
        return [...HABITAT_OPTIONS];
      default:
        return [];
    }
  })();

  const isValueSelected = (value: string): boolean => {
    switch (group) {
      case "weak":
        return tactical.mode === "weak" && tactical.type === value;
      case "resist":
        return tactical.mode === "resist" && tactical.type === value;
      case "color":
        return selectedColors.includes(value);
      case "habitat":
        return selectedHabitats.includes(value);
      default:
        return false;
    }
  };

  const handleValueClick = (value: string) => {
    switch (group) {
      case "weak":
      case "resist":
        onTacticalSelect(value);
        break;
      case "color":
        onColorToggle(value);
        break;
      case "habitat":
        onHabitatToggle(value);
        break;
      default:
        break;
    }
  };

  const usesTypeBadge = group === "weak" || group === "resist";

  return (
    <div className="filter-value-bar" role="group" aria-label="Filter values">
      {valueOptions.map((value) => {
        const selected = isValueSelected(value);
        if (usesTypeBadge) {
          return (
            <TypeFilterChip
              key={value}
              value={value}
              selected={selected}
              onClick={() => handleValueClick(value)}
            />
          );
        }

        return (
          <button
            key={value}
            type="button"
            className={`filter-value-chip${selected ? " filter-value-chip-selected" : ""}`}
            aria-pressed={selected}
            onClick={() => handleValueClick(value)}
          >
            {formatLabel(value)}
          </button>
        );
      })}
    </div>
  );
}
