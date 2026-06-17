"use client";

import { useCallback, useRef, useState } from "react";

interface PokemonCryButtonProps {
  cryUrl: string;
  pokemonName: string;
}

export function PokemonCryButton({ cryUrl, pokemonName }: PokemonCryButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(cryUrl);
      audioRef.current.onended = () => setPlaying(false);
      audioRef.current.onerror = () => setPlaying(false);
    }

    const audio = audioRef.current;
    audio.currentTime = 0;
    setPlaying(true);
    void audio.play().catch(() => setPlaying(false));
  }, [cryUrl]);

  return (
    <button
      type="button"
      className={`detail-cry-btn${playing ? " detail-cry-btn-playing" : ""}`}
      aria-label={`Play ${pokemonName} cry`}
      onClick={handlePlay}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {playing ? (
          <path
            d="M8 5v14l11-7L8 5z"
            fill="currentColor"
          />
        ) : (
          <>
            <path
              d="M11 5L6 9H3v6h3l5 4V5z"
              fill="currentColor"
            />
            <path
              d="M15.5 8.5a5 5 0 010 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M18 6a8.5 8.5 0 010 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </button>
  );
}
