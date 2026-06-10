import type { KeyboardEvent } from 'react';
import type { OrganId } from '../data/effectsContent';

export type FigureKind = 'male' | 'female' | 'neutral';

interface Props {
  figure: FigureKind;
  affected: OrganId[];
  emergencyOrgans: OrganId[];
  selected: OrganId | null;
  bodyWarning: boolean;
  onSelect: (id: OrganId) => void;
  organLabel: (id: OrganId) => string;
  affectedLabel: string;
}

// Stylised organ shapes drawn in-house (no licensed/external art). All organs
// keep the SAME coordinates across the three figures — only the body outline
// changes — so labels and tap targets stay consistent.
const ORGAN_COLORS: Record<OrganId, string> = {
  brain: '#c4b5fd',
  lungs: '#fda4af',
  heart: '#f87171',
  liver: '#c89b78',
  stomach: '#fcd34d',
  kidneys: '#6ee7b7',
};

interface Geom {
  halo: { cx: number; cy: number; r: number };
  badge: { x: number; y: number };
  shapes: string[];
  extra?: string[]; // decorative (non-filled) detail strokes
}

const GEOM: Record<OrganId, Geom> = {
  brain: {
    halo: { cx: 100, cy: 33, r: 20 },
    badge: { x: 115, y: 21 },
    shapes: ['M83,33 C83,22 92,19 100,19 C108,19 117,22 117,33 C117,44 108,47 100,47 C92,47 83,44 83,33 Z'],
    extra: ['M100,20 L100,46', 'M90,24 C94,28 94,38 90,42', 'M110,24 C106,28 106,38 110,42'],
  },
  lungs: {
    halo: { cx: 100, cy: 126, r: 30 },
    badge: { x: 126, y: 108 },
    shapes: [
      'M90,104 C80,106 76,124 79,144 C81,154 90,154 92,146 C94,130 94,114 92,104 Z',
      'M110,104 C120,106 124,124 121,144 C119,154 110,154 108,146 C106,130 106,114 108,104 Z',
    ],
    extra: ['M100,100 L100,118'],
  },
  heart: {
    halo: { cx: 99, cy: 120, r: 13 },
    badge: { x: 110, y: 111 },
    shapes: ['M99,114 C96,109 89,110 89,117 C89,124 99,130 99,130 C99,130 109,124 109,117 C109,110 102,109 99,114 Z'],
  },
  liver: {
    halo: { cx: 88, cy: 162, r: 18 },
    badge: { x: 101, y: 150 },
    shapes: ['M73,152 C90,147 103,151 103,159 C103,171 90,177 78,175 C71,173 69,162 73,152 Z'],
  },
  stomach: {
    halo: { cx: 117, cy: 165, r: 15 },
    badge: { x: 127, y: 154 },
    shapes: ['M109,153 C119,150 127,157 125,167 C123,178 112,180 108,173 C105,168 104,158 109,153 Z'],
  },
  kidneys: {
    halo: { cx: 100, cy: 196, r: 23 },
    badge: { x: 122, y: 187 },
    shapes: [
      'M86,186 C80,186 78,195 81,203 C83,209 91,208 91,200 C91,194 90,188 86,186 Z',
      'M114,186 C120,186 122,195 119,203 C117,209 109,208 109,200 C109,194 110,188 114,186 Z',
    ],
  },
};

const ORGAN_ORDER: OrganId[] = ['brain', 'lungs', 'heart', 'liver', 'stomach', 'kidneys'];

const FIG_PARAMS: Record<FigureKind, { sh: number; wa: number; hipw: number }> = {
  male: { sh: 58, wa: 46, hipw: 48 },
  female: { sh: 46, wa: 37, hipw: 56 },
  neutral: { sh: 52, wa: 42, hipw: 50 },
};

function torsoPath({ sh, wa, hipw }: { sh: number; wa: number; hipw: number }) {
  const cx = 100;
  return `M ${cx - sh},80
    C ${cx - sh - 3},94 ${cx - wa},108 ${cx - wa},140
    C ${cx - wa},178 ${cx - hipw},198 ${cx - hipw},236
    C ${cx - hipw},272 ${cx - hipw + 8},286 ${cx},286
    C ${cx + hipw - 8},286 ${cx + hipw},272 ${cx + hipw},236
    C ${cx + hipw},198 ${cx + wa},178 ${cx + wa},140
    C ${cx + wa},108 ${cx + sh + 3},94 ${cx + sh},80
    C ${cx + sh - 8},73 ${cx - sh + 8},73 ${cx - sh},80 Z`;
}

export function AnatomyFigure({
  figure, affected, emergencyOrgans, selected, bodyWarning, onSelect, organLabel, affectedLabel,
}: Props) {
  const params = FIG_PARAMS[figure];

  const handleKey = (e: KeyboardEvent<SVGGElement>, id: OrganId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(id);
    }
  };

  return (
    <svg
      viewBox="0 0 200 300"
      className="w-full h-auto max-h-[60vh]"
      role="group"
      aria-label="Anatomy figure — tap an organ"
    >
      {/* Body outline (decorative) */}
      <g
        fill="var(--color-surface-2)"
        stroke={bodyWarning ? '#f59e0b' : 'var(--color-border-strong)'}
        strokeWidth={bodyWarning ? 3 : 1.5}
        className={bodyWarning ? 'body-warn' : undefined}
        aria-hidden="true"
      >
        <rect x="92" y="56" width="16" height="26" rx="6" />
        <path d={torsoPath(params)} />
        <circle cx="100" cy="36" r="24" />
      </g>

      {/* Affected glow halos (decorative) */}
      {ORGAN_ORDER.filter((id) => affected.includes(id)).map((id) => {
        const g = GEOM[id];
        const isEmergency = emergencyOrgans.includes(id);
        return (
          <circle
            key={`halo-${id}`}
            cx={g.halo.cx}
            cy={g.halo.cy}
            r={g.halo.r}
            fill={isEmergency ? '#ef4444' : ORGAN_COLORS[id]}
            opacity={0.32}
            className="organ-halo organ-pulse"
            aria-hidden="true"
          />
        );
      })}

      {/* Interactive organs */}
      {ORGAN_ORDER.map((id) => {
        const g = GEOM[id];
        const isAffected = affected.includes(id);
        const isEmergency = emergencyOrgans.includes(id);
        const isSelected = selected === id;
        const fill = isAffected ? ORGAN_COLORS[id] : 'var(--color-surface-3)';
        const stroke = isSelected || isAffected
          ? (isEmergency ? '#dc2626' : 'var(--color-accent)')
          : 'var(--color-border-strong)';
        const strokeWidth = isSelected ? 3 : isAffected ? 2 : 1.2;

        return (
          <g
            key={id}
            className="organ"
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={isAffected ? `${organLabel(id)} — ${affectedLabel}` : organLabel(id)}
            onClick={() => onSelect(id)}
            onKeyDown={(e) => handleKey(e, id)}
            style={{ cursor: 'pointer' }}
          >
            {/* Transparent hit area so taps near the shape register */}
            <circle cx={g.halo.cx} cy={g.halo.cy} r={g.halo.r + 4} fill="transparent" />
            {g.shapes.map((d, i) => (
              <path
                key={i}
                d={d}
                className="organ-shape"
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                opacity={isAffected || isSelected ? 1 : 0.75}
              />
            ))}
            {g.extra?.map((d, i) => (
              <path key={`x-${i}`} d={d} fill="none" stroke={stroke} strokeWidth={0.8} opacity={0.6} aria-hidden="true" />
            ))}
            {isAffected && (
              <g aria-hidden="true">
                <circle cx={g.badge.x} cy={g.badge.y} r="6.5" fill={isEmergency ? '#dc2626' : 'var(--color-accent)'} />
                <text x={g.badge.x} y={g.badge.y + 3.4} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">!</text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
