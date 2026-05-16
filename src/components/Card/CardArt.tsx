interface CardArtProps {
  cardId: string;
  factions: string[];
  type: string;
  width: number;
  height: number;
}

const factionPalettes: Record<string, { primary: string; secondary: string; accent: string; bg: string }> = {
  trade: { primary: '#3b82f6', secondary: '#1d4ed8', accent: '#93c5fd', bg: '#0f1b3d' },
  blob: { primary: '#22c55e', secondary: '#15803d', accent: '#86efac', bg: '#0a1f12' },
  empire: { primary: '#eab308', secondary: '#a16207', accent: '#fde047', bg: '#1f1a05' },
  cult: { primary: '#a855f7', secondary: '#7e22ce', accent: '#d8b4fe', bg: '#1a0a2e' },
  unaligned: { primary: '#6b7280', secondary: '#374151', accent: '#d1d5db', bg: '#111318' },
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function ShipArt({ cardId, palette, w, h }: { cardId: string; palette: typeof factionPalettes.trade; w: number; h: number }) {
  const seed = hashStr(cardId);
  const rng = seededRandom(seed);
  const cx = w / 2;
  const cy = h / 2;

  const trailCount = 3 + Math.floor(rng() * 4);
  const trails = Array.from({ length: trailCount }, () => {
    const x = rng() * w;
    const y = h * 0.4 + rng() * h * 0.5;
    const len = 8 + rng() * 20;
    return { x, y, len };
  });

  const hullW = 14 + rng() * 12;
  const hullH = 20 + rng() * 16;
  const wingSpread = 8 + rng() * 10;
  const noseLen = 8 + rng() * 8;

  const shipPoints = [
    `${cx},${cy - hullH / 2 - noseLen}`,
    `${cx + hullW / 2 + wingSpread},${cy + hullH / 2}`,
    `${cx + hullW / 4},${cy + hullH / 3}`,
    `${cx},${cy + hullH / 2 + 4}`,
    `${cx - hullW / 4},${cy + hullH / 3}`,
    `${cx - hullW / 2 - wingSpread},${cy + hullH / 2}`,
  ].join(' ');

  const starCount = 8 + Math.floor(rng() * 12);
  const stars = Array.from({ length: starCount }, () => ({
    x: rng() * w,
    y: rng() * h,
    r: 0.3 + rng() * 0.8,
    o: 0.3 + rng() * 0.7,
  }));

  const detailLines = Math.floor(rng() * 3) + 1;
  const details = Array.from({ length: detailLines }, (_, i) => {
    const offset = (i + 1) * (hullH / (detailLines + 1)) - hullH / 2;
    const lineW = hullW * (0.3 + rng() * 0.3);
    return { y: cy + offset, w: lineW };
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="absolute inset-0">
      <defs>
        <radialGradient id={`bg-${cardId}`} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor={palette.secondary} stopOpacity="0.3" />
          <stop offset="100%" stopColor={palette.bg} stopOpacity="0.9" />
        </radialGradient>
        <linearGradient id={`hull-${cardId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.accent} />
          <stop offset="50%" stopColor={palette.primary} />
          <stop offset="100%" stopColor={palette.secondary} />
        </linearGradient>
      </defs>

      <rect width={w} height={h} fill={`url(#bg-${cardId})`} />

      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o} />
      ))}

      {trails.map((t, i) => (
        <line key={i} x1={t.x} y1={t.y} x2={t.x - t.len * 0.3} y2={t.y + t.len}
          stroke={palette.accent} strokeWidth="1" opacity="0.25" />
      ))}

      <polygon points={shipPoints} fill={`url(#hull-${cardId})`} stroke={palette.accent}
        strokeWidth="0.5" />

      {details.map((d, i) => (
        <line key={i} x1={cx - d.w / 2} y1={d.y} x2={cx + d.w / 2} y2={d.y}
          stroke={palette.accent} strokeWidth="0.5" opacity="0.6" />
      ))}

      <ellipse cx={cx} cy={cy + hullH / 2 + 6} rx={4 + rng() * 3} ry={6 + rng() * 4}
        fill={palette.accent} opacity="0.4" />
    </svg>
  );
}

function BaseArt({ cardId, palette, w, h }: { cardId: string; palette: typeof factionPalettes.trade; w: number; h: number }) {
  const seed = hashStr(cardId);
  const rng = seededRandom(seed);
  const cx = w / 2;
  const cy = h / 2;

  const sides = 5 + Math.floor(rng() * 4);
  const outerR = 16 + rng() * 8;
  const innerR = outerR * (0.5 + rng() * 0.2);

  const outerPoints = Array.from({ length: sides }, (_, i) => {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    return `${cx + Math.cos(angle) * outerR},${cy + Math.sin(angle) * outerR}`;
  }).join(' ');

  const innerPoints = Array.from({ length: sides }, (_, i) => {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2 + Math.PI / sides;
    return `${cx + Math.cos(angle) * innerR},${cy + Math.sin(angle) * innerR}`;
  }).join(' ');

  const ringCount = 2 + Math.floor(rng() * 3);
  const rings = Array.from({ length: ringCount }, (_, i) => ({
    r: outerR * 1.2 + i * (4 + rng() * 3),
    opacity: 0.15 - i * 0.03,
    dash: `${2 + rng() * 4} ${2 + rng() * 3}`,
  }));

  const starCount = 6 + Math.floor(rng() * 8);
  const stars = Array.from({ length: starCount }, () => ({
    x: rng() * w, y: rng() * h,
    r: 0.3 + rng() * 0.6, o: 0.3 + rng() * 0.5,
  }));

  const connectorCount = sides;
  const connectors = Array.from({ length: connectorCount }, (_, i) => {
    const outerAngle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const innerAngle = outerAngle + Math.PI / sides;
    return {
      x1: cx + Math.cos(outerAngle) * outerR,
      y1: cy + Math.sin(outerAngle) * outerR,
      x2: cx + Math.cos(innerAngle) * innerR,
      y2: cy + Math.sin(innerAngle) * innerR,
    };
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="absolute inset-0">
      <defs>
        <radialGradient id={`bg-${cardId}`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor={palette.secondary} stopOpacity="0.4" />
          <stop offset="100%" stopColor={palette.bg} stopOpacity="0.9" />
        </radialGradient>
      </defs>

      <rect width={w} height={h} fill={`url(#bg-${cardId})`} />

      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o} />
      ))}

      {rings.map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r.r} fill="none"
          stroke={palette.primary} strokeWidth="0.5" opacity={r.opacity}
          strokeDasharray={r.dash} />
      ))}

      <polygon points={outerPoints} fill={palette.secondary} fillOpacity="0.5"
        stroke={palette.primary} strokeWidth="1" />

      {connectors.map((c, i) => (
        <line key={i} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
          stroke={palette.accent} strokeWidth="0.5" opacity="0.4" />
      ))}

      <polygon points={innerPoints} fill={palette.primary} fillOpacity="0.3"
        stroke={palette.accent} strokeWidth="0.5" />

      <circle cx={cx} cy={cy} r={3} fill={palette.accent} opacity="0.8"
        />
    </svg>
  );
}

function OutpostArt({ cardId, palette, w, h }: { cardId: string; palette: typeof factionPalettes.trade; w: number; h: number }) {
  const seed = hashStr(cardId);
  const rng = seededRandom(seed);
  const cx = w / 2;
  const cy = h / 2;

  const shieldW = 22 + rng() * 8;
  const shieldH = 26 + rng() * 8;

  const shieldPath = `M ${cx} ${cy - shieldH / 2}
    Q ${cx + shieldW / 2 + 4} ${cy - shieldH / 4} ${cx + shieldW / 2} ${cy + shieldH / 6}
    Q ${cx + shieldW / 3} ${cy + shieldH / 2} ${cx} ${cy + shieldH / 2 + 2}
    Q ${cx - shieldW / 3} ${cy + shieldH / 2} ${cx - shieldW / 2} ${cy + shieldH / 6}
    Q ${cx - shieldW / 2 - 4} ${cy - shieldH / 4} ${cx} ${cy - shieldH / 2} Z`;

  const hexR = 4 + rng() * 3;
  const hexPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 6;
    return `${cx + Math.cos(angle) * hexR},${cy + Math.sin(angle) * hexR}`;
  }).join(' ');

  const fieldLines = 3 + Math.floor(rng() * 3);
  const fields = Array.from({ length: fieldLines }, () => {
    const angle = rng() * Math.PI * 2;
    const dist = shieldW * 0.7 + rng() * 10;
    return {
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      r: 6 + rng() * 8,
    };
  });

  const starCount = 5 + Math.floor(rng() * 6);
  const stars = Array.from({ length: starCount }, () => ({
    x: rng() * w, y: rng() * h,
    r: 0.3 + rng() * 0.5, o: 0.2 + rng() * 0.4,
  }));

  const crossbars = 1 + Math.floor(rng() * 2);
  const bars = Array.from({ length: crossbars }, (_, i) => {
    const yOff = (i + 1) * (shieldH / (crossbars + 2)) - shieldH / 3;
    const barW = shieldW * (0.4 + rng() * 0.3);
    return { y: cy + yOff, w: barW };
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="absolute inset-0">
      <defs>
        <radialGradient id={`bg-${cardId}`} cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor={palette.primary} stopOpacity="0.2" />
          <stop offset="100%" stopColor={palette.bg} stopOpacity="0.95" />
        </radialGradient>
        <linearGradient id={`shield-${cardId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.accent} stopOpacity="0.6" />
          <stop offset="50%" stopColor={palette.primary} stopOpacity="0.4" />
          <stop offset="100%" stopColor={palette.secondary} stopOpacity="0.6" />
        </linearGradient>
      </defs>

      <rect width={w} height={h} fill={`url(#bg-${cardId})`} />

      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o} />
      ))}

      {fields.map((f, i) => (
        <circle key={i} cx={f.x} cy={f.y} r={f.r} fill="none"
          stroke={palette.accent} strokeWidth="0.5" opacity="0.15"
          strokeDasharray="2 2" />
      ))}

      <path d={shieldPath} fill={`url(#shield-${cardId})`} stroke={palette.primary}
        strokeWidth="1.5" />

      {bars.map((b, i) => (
        <line key={i} x1={cx - b.w / 2} y1={b.y} x2={cx + b.w / 2} y2={b.y}
          stroke={palette.accent} strokeWidth="0.7" opacity="0.5" />
      ))}

      <polygon points={hexPoints} fill={palette.accent} fillOpacity="0.5"
        stroke={palette.accent} strokeWidth="0.5" />
    </svg>
  );
}

export default function CardArt({ cardId, factions, type, width, height }: CardArtProps) {
  const faction = factions[0] || 'unaligned';
  const palette = factionPalettes[faction] || factionPalettes.unaligned;

  switch (type) {
    case 'ship':
      return <ShipArt cardId={cardId} palette={palette} w={width} h={height} />;
    case 'base':
      return <BaseArt cardId={cardId} palette={palette} w={width} h={height} />;
    case 'outpost':
      return <OutpostArt cardId={cardId} palette={palette} w={width} h={height} />;
    default:
      return <ShipArt cardId={cardId} palette={palette} w={width} h={height} />;
  }
}
