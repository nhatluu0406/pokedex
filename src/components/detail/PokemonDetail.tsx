"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatedSprite } from "./AnimatedSprite";
import { EvolutionChain } from "./EvolutionChain";
import { PokemonStats } from "./StatBar";
import { TypeBadge } from "@/components/shared/TypeBadge";
import { usePokemonDetail } from "@/hooks/usePokemonDetail";
import { TYPE_COLORS } from "@/lib/constants";
import {
  capitalizeName,
  formatHeight,
  formatPokemonId,
  formatWeight,
} from "@/utils/format";

const MOBILE_BREAKPOINT = 1100;
const SLIDE_DURATION_MS = 350;

interface PokemonDetailProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

export function PokemonDetail({
  selectedId,
  onSelect,
  onClose,
  isFavorite,
  onToggleFavorite,
}: PokemonDetailProps) {
  const [displayId, setDisplayId] = useState<number | null>(null);
  const displayIdRef = useRef<number | null>(null);
  const { data, loading, error, retry } = usePokemonDetail(displayId);
  const [isMobile, setIsMobile] = useState(false);
  const [panelClass, setPanelClass] = useState("");
  const [backdropVisible, setBackdropVisible] = useState(false);
  const slideTimerRef = useRef<number | null>(null);

  const clearSlideTimer = useCallback(() => {
    if (slideTimerRef.current !== null) {
      window.clearTimeout(slideTimerRef.current);
      slideTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (selectedId === null) {
      clearSlideTimer();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset panel when detail closes
      setBackdropVisible(false);
      document.documentElement.style.overflow = "";
      displayIdRef.current = null;
      setDisplayId(null);
      setPanelClass("");
      return;
    }

    if (isMobile) {
      displayIdRef.current = selectedId;
      setDisplayId(selectedId);
      setBackdropVisible(true);
      document.documentElement.style.overflow = "hidden";
      setPanelClass("slide-in");
      return () => {
        document.documentElement.style.overflow = "";
      };
    }

    const currentDisplayId = displayIdRef.current;

    if (currentDisplayId === selectedId) {
      return clearSlideTimer;
    }

    if (currentDisplayId === null) {
      displayIdRef.current = selectedId;
      setDisplayId(selectedId);
      setPanelClass("slide-in");
      return clearSlideTimer;
    }

    clearSlideTimer();
    setPanelClass("slide-out");
    slideTimerRef.current = window.setTimeout(() => {
      displayIdRef.current = selectedId;
      setDisplayId(selectedId);
      setPanelClass("slide-in");
    }, SLIDE_DURATION_MS);

    return clearSlideTimer;
  }, [selectedId, isMobile, clearSlideTimer]);

  const handleClose = () => {
    if (isMobile) {
      setBackdropVisible(false);
      setPanelClass("slide-out");
      document.documentElement.style.overflow = "";
      window.setTimeout(() => {
        onClose();
        setPanelClass("");
      }, SLIDE_DURATION_MS);
      return;
    }

    onClose();
  };

  const handleShare = useCallback(async (displayName: string) => {
    const url = window.location.href;
    const shareData = {
      title: displayName,
      text: `Check out ${displayName} in the Pokedex`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled share sheet.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard unavailable.
    }
  }, []);

  if (selectedId === null) {
    if (isMobile) return null;

    return (
      <aside className="pokemon-detail pokemon-detail-empty">
        <div className="detail-empty-card">
          <div className="detail-empty-sprite">
            <Image
              src="/assets/no-pokemon-selected.png"
              alt=""
              width={140}
              height={140}
              aria-hidden="true"
            />
          </div>
          <p className="detail-empty-message">
            Select a Pokemon
            <br />
            to display here.
          </p>
        </div>
      </aside>
    );
  }

  const primaryType = data?.types[0];
  const backdropColor = primaryType ? TYPE_COLORS[primaryType] : "#f6f8fc";

  const panelContent = (() => {
    if (error && !data) {
      return (
        <div className="pokemon-detail-error">
          <p>{error}</p>
          <button type="button" className="retry-btn" onClick={retry}>
            Try again
          </button>
        </div>
      );
    }

    if (loading && !data) {
      return (
        <div
          className="detail-card detail-card-loading"
          aria-busy="true"
          aria-label="Loading Pokémon data"
        />
      );
    }

    if (!data) return null;

    const displayName = capitalizeName(data.name);

    const spriteBlock = (
      <div className="detail-sprite-wrapper">
        <AnimatedSprite
          key={data.id}
          pokemonId={data.id}
          name={data.name}
        />
      </div>
    );

    return (
      <>
        {!isMobile && spriteBlock}
        <div className="detail-card" aria-busy={loading || undefined}>
          <div className="detail-actions">
            <button
              type="button"
              className={`favorite-btn detail-favorite-btn${
                isFavorite ? " favorite-btn-active" : ""
              }`}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
              aria-pressed={isFavorite}
              onClick={() => onToggleFavorite(data.id)}
            >
              {isFavorite ? "★" : "☆"}
            </button>
            <button
              type="button"
              className="detail-share-btn"
              aria-label={`Share ${displayName}`}
              onClick={() => handleShare(displayName)}
            >
              <Image
                src="/assets/share-icon.png"
                alt=""
                width={18}
                height={18}
              />
            </button>
          </div>
          {isMobile && spriteBlock}
          <span className="detail-id">{formatPokemonId(data.id)}</span>
          <h2 className="detail-name">{displayName}</h2>
          <div className="detail-types">
            {data.types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>

          {data.flavorText && (
            <div className="detail-entry">
              <h3 className="detail-section-title">Pokedex Entry</h3>
              <p className="detail-flavor-text">{data.flavorText}</p>
            </div>
          )}

          <div className="detail-info">
            <div className="detail-info-pill">
              <span className="detail-info-label">Height</span>
              <span>{formatHeight(data.height)}</span>
            </div>
            <div className="detail-info-pill">
              <span className="detail-info-label">Weight</span>
              <span>{formatWeight(data.weight)}</span>
            </div>
          </div>

          <div className="detail-abilities">
            <h3 className="detail-section-title">Abilities</h3>
            <div className="detail-abilities-pills">
              {data.abilities.map((ability) => (
                <div key={ability} className="detail-info-pill detail-ability-pill">
                  {capitalizeName(ability)}
                </div>
              ))}
            </div>
          </div>

          <PokemonStats stats={data.stats} />

          <EvolutionChain
            key={data.id}
            evolution={data.evolution}
            onSelect={onSelect}
          />
        </div>
      </>
    );
  })();

  return (
    <>
      {isMobile && (
        <div
          className={`pokemon-detail-backdrop${
            backdropVisible ? " pokemon-detail-backdrop-visible" : ""
          }`}
          style={{ backgroundColor: backdropColor }}
          aria-hidden="true"
        />
      )}
      <aside
        className={`pokemon-detail pokemon-detail-panel ${panelClass}${
          isMobile ? " pokemon-detail-modal" : ""
        }`}
      >
        {isMobile && (
          <button
            type="button"
            className="pokemon-detail-close"
            onClick={handleClose}
            aria-label="Close Pokémon details"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
        {panelContent}
        {loading && (
          <div className="detail-panel-loading" aria-hidden="true">
            <Image
              src="/assets/pokeball-icon.png"
              alt=""
              width={72}
              height={72}
              className="detail-loading-ball"
            />
          </div>
        )}
      </aside>
    </>
  );
}
