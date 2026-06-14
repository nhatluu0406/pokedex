"use client";

import { TYPE_COLORS } from "@/lib/constants";

interface TypeFilterProps {
  selectedTypes: string[];
  onChange: (types: string[]) => void;
}

const TYPE_OPTIONS = Object.keys(TYPE_COLORS).filter((type) => type !== "shadow");

export function TypeFilter({ selectedTypes, onChange }: TypeFilterProps) {
  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter((value) => value !== type));
      return;
    }
    onChange([...selectedTypes, type]);
  };

  return (
    <div className="type-filter" role="group" aria-label="Filter by type">
      {TYPE_OPTIONS.map((type) => {
        const selected = selectedTypes.includes(type);
        return (
          <button
            key={type}
            type="button"
            className={`type-filter-chip${selected ? " type-filter-chip-selected" : ""}`}
            style={{ "--type-color": TYPE_COLORS[type] } as React.CSSProperties}
            aria-pressed={selected}
            onClick={() => toggleType(type)}
          >
            {type}
          </button>
        );
      })}
    </div>
  );
}
