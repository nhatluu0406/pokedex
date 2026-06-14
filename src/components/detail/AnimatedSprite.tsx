"use client";

import { useCallback, useState } from "react";
import {
  getAnimatedSpriteUrl,
  getStaticSpriteUrl,
} from "@/lib/pokeapi";
import { capitalizeName } from "@/utils/format";

interface AnimatedSpriteProps {
  pokemonId: number;
  name: string;
}

export function AnimatedSprite({ pokemonId, name }: AnimatedSpriteProps) {
  const [src, setSrc] = useState(() => getAnimatedSpriteUrl(pokemonId));
  const [imgHeight, setImgHeight] = useState<number | undefined>();

  const displayName = capitalizeName(name);
  const staticUrl = getStaticSpriteUrl(pokemonId);

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;

      if (img.naturalWidth === 0) {
        setSrc(staticUrl);
        return;
      }

      const scaledHeight = img.naturalHeight * 3;
      const maxHeight = window.innerHeight * 0.22;
      setImgHeight(Math.min(scaledHeight, maxHeight));
    },
    [staticUrl],
  );

  const handleError = useCallback(() => {
    setSrc(staticUrl);
  }, [staticUrl]);

  return (
    <div className="animated-sprite-container">
      {/* eslint-disable-next-line @next/next/no-img-element -- animated GIFs need plain img for onLoad height scaling */}
      <img
        key={src}
        src={src}
        alt={`${displayName} sprite`}
        className="animated-sprite"
        style={imgHeight ? { height: `${imgHeight}px`, width: "auto" } : undefined}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
