import { TYPE_COLORS } from "@/lib/constants";
import { capitalizeName } from "@/utils/format";

interface TypeBadgeProps {
  type: string;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const color = TYPE_COLORS[type] ?? "#BCBCAC";

  return (
    <span className="type-badge" style={{ backgroundColor: color }}>
      {capitalizeName(type)}
    </span>
  );
}
