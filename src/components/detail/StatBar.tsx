import { STAT_COLORS } from "@/lib/constants";

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "SPD",
};

const STAT_COLOR_KEYS: Record<string, keyof typeof STAT_COLORS> = {
  hp: "hp",
  attack: "atk",
  defense: "def",
  "special-attack": "spa",
  "special-defense": "spd",
  speed: "speed",
};

const STAT_ORDER = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
] as const;

interface PokemonStatsProps {
  stats: { name: string; value: number }[];
}

export function PokemonStats({ stats }: PokemonStatsProps) {
  const statsByName = Object.fromEntries(
    stats.map((stat) => [stat.name, stat.value]),
  );
  const total = stats.reduce((sum, stat) => sum + stat.value, 0);

  return (
    <div className="detail-stats">
      <h3 className="detail-section-title">Stats</h3>
      <div className="stats-pills-row">
        {STAT_ORDER.map((statName) => (
          <div key={statName} className="stat-pill-item">
            <StatPill
              label={STAT_LABELS[statName]}
              value={statsByName[statName] ?? 0}
              color={STAT_COLORS[STAT_COLOR_KEYS[statName]]}
            />
          </div>
        ))}
        <div className="stat-pill-tot-wrap">
          <StatPill label="TOT" value={total} color={STAT_COLORS.total} />
        </div>
      </div>
    </div>
  );
}

interface StatPillProps {
  label: string;
  value: number;
  color: string;
}

function StatPill({ label, value, color }: StatPillProps) {
  return (
    <div className="stat-row stat-pill">
      <span
        className="stat-pill-label"
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
      <span className="stat-pill-value">{value}</span>
    </div>
  );
}
