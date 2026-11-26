import React from 'react';

export function IsoSvgDefs({ prefix = 'iso' }: { prefix?: string }) {
  return (
    <defs>
      <linearGradient id={`${prefix}-orange-top`} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stopColor="var(--iso-orange-top-1)" />
        <stop offset="1" stopColor="var(--iso-orange-top-2)" />
      </linearGradient>
      <linearGradient id={`${prefix}-orange-side`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="var(--iso-orange-side-1)" />
        <stop offset="1" stopColor="var(--iso-orange-side-2)" />
      </linearGradient>

      <linearGradient id={`${prefix}-green-top`} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stopColor="var(--iso-green-top-1)" />
        <stop offset="1" stopColor="var(--iso-green-top-2)" />
      </linearGradient>
      <linearGradient id={`${prefix}-green-side`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="var(--iso-green-side-1)" />
        <stop offset="1" stopColor="var(--iso-green-side-2)" />
      </linearGradient>

      <linearGradient id={`${prefix}-blue-top`} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stopColor="var(--iso-blue-top-1)" />
        <stop offset="1" stopColor="var(--iso-blue-top-2)" />
      </linearGradient>
      <linearGradient id={`${prefix}-blue-side`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="var(--iso-blue-side-1)" />
        <stop offset="1" stopColor="var(--iso-blue-side-2)" />
      </linearGradient>

      <linearGradient id={`${prefix}-yellow-top`} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stopColor="var(--iso-yellow-top-1)" />
        <stop offset="1" stopColor="var(--iso-yellow-top-2)" />
      </linearGradient>
      <linearGradient id={`${prefix}-yellow-side`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="var(--iso-yellow-side-1)" />
        <stop offset="1" stopColor="var(--iso-yellow-side-2)" />
      </linearGradient>

      <linearGradient id={`${prefix}-purple-top`} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stopColor="var(--iso-purple-top-1)" />
        <stop offset="1" stopColor="var(--iso-purple-top-2)" />
      </linearGradient>
      <linearGradient id={`${prefix}-purple-side`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="var(--iso-purple-side-1)" />
        <stop offset="1" stopColor="var(--iso-purple-side-2)" />
      </linearGradient>

      <linearGradient id={`${prefix}-slab-top`} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stopColor="var(--iso-slab-top-1)" />
        <stop offset="1" stopColor="var(--iso-slab-top-2)" />
      </linearGradient>
      <linearGradient id={`${prefix}-slab-side`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="var(--iso-slab-side-1)" />
        <stop offset="1" stopColor="var(--iso-slab-side-2)" />
      </linearGradient>

      <linearGradient id={`${prefix}-cyl-sheen`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
        <stop offset="0.3" stopColor="#ffffff" stopOpacity="0.28" />
        <stop offset="0.6" stopColor="#ffffff" stopOpacity="0.04" />
        <stop offset="1" stopColor="#cbb8e0" stopOpacity="0.08" />
      </linearGradient>

      <filter id={`${prefix}-blur-sm`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.2" />
      </filter>
      <filter id={`${prefix}-blur-lg`} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="5.5" />
      </filter>

      <marker
        id={`${prefix}-arrow`}
        viewBox="0 0 10 10"
        refX="8.5"
        refY="5"
        markerWidth="5.2"
        markerHeight="5.2"
        orient="auto-start-reverse"
        markerUnits="strokeWidth"
      >
        <path d="M1,1.2 L9,5 L1,8.8 Z" fill="var(--iso-stroke)" stroke="var(--iso-stroke)" strokeWidth="1" strokeLinejoin="round" />
      </marker>

      <marker
        id={`${prefix}-arrow-active`}
        viewBox="0 0 10 10"
        refX="8.5"
        refY="5"
        markerWidth="5.5"
        markerHeight="5.5"
        orient="auto-start-reverse"
        markerUnits="strokeWidth"
      >
        <path d="M1,1.2 L9,5 L1,8.8 Z" fill="var(--c-3fa456)" stroke="var(--c-3fa456)" strokeWidth="1" strokeLinejoin="round" />
      </marker>

      <pattern id={`${prefix}-grid`} patternUnits="userSpaceOnUse" width="28" height="14">
        <path d="M0 7 L14 0 L28 7 L14 14 Z" fill="none" stroke="var(--iso-grid-stroke)" strokeOpacity="0.26" strokeWidth="0.8" />
      </pattern>

      <radialGradient id={`${prefix}-fade`} cx="50%" cy="50%" r="54%">
        <stop offset="0" stopColor="#fff" />
        <stop offset="0.55" stopColor="#fff" stopOpacity="0.85" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </radialGradient>

      <mask id={`${prefix}-mask`}>
        <rect x="-2000" y="-2000" width="4000" height="4000" fill={`url(#${prefix}-fade)`} />
      </mask>
    </defs>
  );
}

export type IsoTone = 'blue' | 'green' | 'orange' | 'purple' | 'yellow' | 'slab';

interface IsoBlockProps {
  prefix?: string;
  cx: number;
  cy: number;
  w?: number;
  h?: number;
  depth?: number;
  tone: IsoTone;
  label: string;
  sublabel?: string;
  active?: boolean;
  alert?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

/**
 * Hand-crafted isometric rounded 3D block matching the exact geometry and
 * inner specular bevel language from napkin-math-system-design.
 */
export function IsoBlock({
  prefix = 'iso',
  cx,
  cy,
  w = 56,
  h = 28,
  depth = 30,
  tone,
  label,
  sublabel,
  active = false,
  alert = false,
  icon,
  onClick,
}: IsoBlockProps) {
  const strokeColor = alert ? 'var(--c-e5534b)' : active ? 'var(--green-3)' : 'var(--iso-stroke)';
  const strokeW = active || alert ? 2.4 : 1.8;

  return (
    <g
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      {/* Ground drop shadow */}
      <path
        d={`M${cx},${cy - h + depth + 6} L${cx + w},${cy + depth + 6} L${cx},${cy + h + depth + 6} L${cx - w},${cy + depth + 6} Z`}
        fill="#000000"
        opacity="0.22"
        filter={`url(#${prefix}-blur-lg)`}
      />

      {/* Side extrusion */}
      <path
        d={`M${cx - w},${cy} L${cx},${cy + h} L${cx + w},${cy} L${cx + w},${cy + depth} L${cx},${cy + h + depth} L${cx - w},${cy + depth} Z`}
        fill={`url(#${prefix}-${tone}-side)`}
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeLinejoin="round"
      />
      {/* Right face subtle shadow */}
      <path
        d={`M${cx},${cy + h} L${cx + w},${cy} L${cx + w},${cy + depth} L${cx},${cy + h + depth} Z`}
        fill="#000000"
        opacity="0.09"
      />
      {/* Top isometric face */}
      <path
        d={`M${cx},${cy - h} L${cx + w},${cy} L${cx},${cy + h} L${cx - w},${cy} Z`}
        fill={`url(#${prefix}-${tone}-top)`}
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeLinejoin="round"
      />
      {/* Top lip specular highlight */}
      <path
        d={`M${cx - w + 3},${cy + 1.2} L${cx},${cy + h - 1.2} L${cx + w - 3},${cy + 1.2}`}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.65"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {active && (
        <path
          d={`M${cx},${cy - h - 4} L${cx + w + 6},${cy} L${cx},${cy + h + 4} L${cx - w - 6},${cy} Z`}
          fill="none"
          stroke="var(--green-3)"
          strokeWidth="1.8"
          strokeDasharray="5 4"
          className="pulse"
        />
      )}
      {/* Label pill anchored neatly above or inside face */}
      {icon && <g transform={`translate(${cx - 9}, ${cy - 14})`}>{icon}</g>}
      <text
        x={cx}
        y={cy + (icon ? 12 : 4)}
        textAnchor="middle"
        fontSize="11.5"
        fontWeight="800"
        fill="var(--iso-text)"
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={cx}
          y={cy + h + depth + 15}
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill="var(--muted)"
        >
          {sublabel}
        </text>
      )}
    </g>
  );
}

interface IsoCylinderProps {
  prefix?: string;
  cx: number;
  cy: number;
  rx?: number;
  ry?: number;
  height?: number;
  label: string;
  sublabel?: string;
  active?: boolean;
}

export function IsoCylinder({
  prefix = 'iso',
  cx,
  cy,
  rx = 30,
  ry = 13,
  height = 32,
  label,
  sublabel,
  active = false,
}: IsoCylinderProps) {
  const stroke = active ? 'var(--green-3)' : 'var(--iso-stroke)';
  return (
    <g>
      <ellipse cx={cx} cy={cy + height + 5} rx={rx + 4} ry={ry + 2} fill="#000" opacity="0.22" filter={`url(#${prefix}-blur-lg)`} />
      <path
        d={`M${cx - rx},${cy} V${cy + height} A${rx},${ry} 0 0 0 ${cx + rx},${cy + height} V${cy} Z`}
        fill={`url(#${prefix}-purple-side)`}
      />
      <path
        d={`M${cx - rx},${cy} V${cy + height} A${rx},${ry} 0 0 0 ${cx + rx},${cy + height} V${cy} Z`}
        fill={`url(#${prefix}-cyl-sheen)`}
      />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${prefix}-purple-top)`} />
      <path
        d={`M${cx - rx + 3},${cy + 2} A${rx - 3},${ry - 2} 0 0 0 ${cx + rx - 3},${cy + 2}`}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.6"
        strokeWidth="1.3"
      />
      <path
        d={`M${cx - rx},${cy} V${cy + height} A${rx},${ry} 0 0 0 ${cx + rx},${cy + height} V${cy}`}
        fill="none"
        stroke={stroke}
        strokeWidth={active ? 2.4 : 1.8}
        strokeLinejoin="round"
      />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={stroke} strokeWidth={active ? 2.4 : 1.8} />
      <text x={cx} y={cy + height * 0.62} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="var(--iso-text)">
        {label}
      </text>
      {sublabel && (
        <text x={cx} y={cy + height + ry + 15} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--muted)">
          {sublabel}
        </text>
      )}
    </g>
  );
}

interface IsoPillProps {
  x: number;
  y: number;
  width?: number;
  text: string;
  tone?: 'neutral' | 'good' | 'warn' | 'bad';
}

export function IsoPill({ x, y, width = 104, text, tone = 'neutral' }: IsoPillProps) {
  const fill =
    tone === 'good'
      ? 'var(--c-dcefd2)'
      : tone === 'warn'
        ? 'var(--c-fbe5bd)'
        : tone === 'bad'
          ? 'var(--c-f8d5cf)'
          : 'var(--iso-card-bg)';
  const textColor =
    tone === 'good'
      ? 'var(--c-24521c)'
      : tone === 'warn'
        ? 'var(--c-6d4a0c)'
        : tone === 'bad'
          ? 'var(--c-7d241d)'
          : 'var(--iso-text)';

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={-width / 2} y={-9} width={width} height={20} rx={10} fill="var(--drop)" />
      <rect
        x={-width / 2}
        y={-11}
        width={width}
        height={20}
        rx={10}
        fill={fill}
        stroke="var(--iso-stroke)"
        strokeWidth="1.25"
      />
      <text x={0} y={2.5} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={textColor}>
        {text}
      </text>
    </g>
  );
}
