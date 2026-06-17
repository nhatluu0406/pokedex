import { capitalizeName } from "@/utils/format";

interface PokemonMetaProps {
  genera?: string;
  isLegendary?: boolean;
  isMythical?: boolean;
}

export function PokemonMeta({
  genera,
  isLegendary,
  isMythical,
}: PokemonMetaProps) {
  const hasBadges = isLegendary || isMythical;

  if (!genera && !hasBadges) {
    return null;
  }

  return (
    <div className="detail-meta">
      {genera && <p className="detail-genus">{capitalizeName(genera)}</p>}
      {hasBadges && (
        <div className="detail-rarity-badges">
          {isLegendary && (
            <span className="detail-rarity-badge detail-rarity-legendary">
              Legendary
            </span>
          )}
          {isMythical && (
            <span className="detail-rarity-badge detail-rarity-mythical">
              Mythical
            </span>
          )}
        </div>
      )}
    </div>
  );
}
