"use client";

import Image from "next/image";
import { useState } from "react";

interface SearchBarProps {
  onChange: (value: string) => void;
}

export function SearchBar({ onChange }: SearchBarProps) {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    window.setTimeout(() => onChange(value), 1);
  };

  const handleClear = () => {
    setInputValue("");
    onChange("");
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        role="searchbox"
        className="search-bar-input"
        placeholder="Search your Pokemon"
        value={inputValue}
        onChange={handleChange}
        aria-label="Search Pokémon by name"
      />
      {inputValue.length > 0 && (
        <button
          type="button"
          className="search-bar-clear"
          aria-label="Clear search"
          onClick={handleClear}
        >
          ×
        </button>
      )}
      <span className="search-bar-icon" aria-hidden="true">
        <Image
          src="/assets/search-icon.png"
          alt=""
          width={16}
          height={16}
        />
      </span>
    </div>
  );
}
