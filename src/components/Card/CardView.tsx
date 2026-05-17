import type { CardDef, Effect, Faction } from '../../engine/types';

const factionConfig: Record<string, {
  border: string;
  bg: string;
  frameBg: string;
  icon: string;
  label: string;
  costBg: string;
  costText: string;
}> = {
  trade: {
    border: '#2563eb',
    bg: '#0c1a2e',
    frameBg: 'linear-gradient(180deg, #1e3a5f 0%, #0c1a2e 40%, #0c1a2e 100%)',
    icon: '🔵',
    label: 'Trade Federation',
    costBg: '#eab308',
    costText: '#000',
  },
  blob: {
    border: '#16a34a',
    bg: '#0a1f0a',
    frameBg: 'linear-gradient(180deg, #14532d 0%, #0a1f0a 40%, #0a1f0a 100%)',
    icon: '🟢',
    label: 'Blob',
    costBg: '#eab308',
    costText: '#000',
  },
  empire: {
    border: '#ca8a04',
    bg: '#1a1400',
    frameBg: 'linear-gradient(180deg, #422006 0%, #1a1400 40%, #1a1400 100%)',
    icon: '🟡',
    label: 'Star Empire',
    costBg: '#eab308',
    costText: '#000',
  },
  cult: {
    border: '#dc2626',
    bg: '#1a0a0a',
    frameBg: 'linear-gradient(180deg, #450a0a 0%, #1a0a0a 40%, #1a0a0a 100%)',
    icon: '🔴',
    label: 'Machine Cult',
    costBg: '#eab308',
    costText: '#000',
  },
  unaligned: {
    border: '#6b7280',
    bg: '#111318',
    frameBg: 'linear-gradient(180deg, #1f2937 0%, #111318 40%, #111318 100%)',
    icon: '⚪',
    label: 'Unaligned',
    costBg: '#eab308',
    costText: '#000',
  },
};

function getFaction(def: CardDef): string {
  return def.factions[0] || 'unaligned';
}

function getFactionLabel(factions: Faction[]): string {
  if (factions.length > 1) return 'All Factions';
  const f = factions[0];
  return factionConfig[f]?.label || 'Unaligned';
}

function getTypeLabel(def: CardDef): string {
  const faction = getFactionLabel(def.factions);
  switch (def.type) {
    case 'ship': return `${faction} Ship`;
    case 'base': return `${faction} Base`;
    case 'outpost': return `${faction} Outpost`;
  }
}

/* ── Effect icon circles ── */
function EffectIcon({ effect, small }: { effect: Effect; small: boolean }) {
  const sz = small ? 'w-5 h-5 text-[8px]' : 'w-7 h-7 text-[11px]';

  switch (effect.kind) {
    case 'trade':
      return (
        <div className={`${sz} rounded-full bg-yellow-500 flex items-center justify-center font-bold text-black`}>
          {effect.amount}
        </div>
      );
    case 'combat':
      return (
        <div className={`${sz} rounded-full bg-red-600 flex items-center justify-center font-bold text-white`}>
          {effect.amount}
        </div>
      );
    case 'authority':
      return (
        <div className={`${sz} rounded-full bg-green-500 flex items-center justify-center font-bold text-black`}>
          {effect.amount}
        </div>
      );
    case 'draw':
      return (
        <span className={`${small ? 'text-[8px]' : 'text-[10px]'} text-gray-200`}>
          Draw {effect.amount} card{effect.amount > 1 ? 's' : ''}.
        </span>
      );
    case 'discardOpponent':
      return (
        <span className={`${small ? 'text-[8px]' : 'text-[10px]'} text-gray-200`}>
          Target opponent discards.
        </span>
      );
    case 'destroyBase':
      return (
        <span className={`${small ? 'text-[8px]' : 'text-[10px]'} text-gray-200`}>
          Destroy target base.
        </span>
      );
    case 'scrapTradeRow':
      return (
        <span className={`${small ? 'text-[8px]' : 'text-[10px]'} text-gray-200`}>
          Scrap from trade row.
        </span>
      );
    case 'scrapFromHandOrDiscard':
      return (
        <span className={`${small ? 'text-[8px]' : 'text-[10px]'} text-gray-200`}>
          Scrap from hand/discard.
        </span>
      );
    case 'acquireShipFree':
      return (
        <span className={`${small ? 'text-[8px]' : 'text-[10px]'} text-gray-200`}>
          Acquire free ship (≤{effect.maxCost}).
        </span>
      );
    case 'acquireToTopOfDeck':
      return (
        <span className={`${small ? 'text-[8px]' : 'text-[10px]'} text-gray-200`}>
          Next acquire → top of deck.
        </span>
      );
    case 'copyShip':
      return (
        <span className={`${small ? 'text-[8px]' : 'text-[10px]'} text-gray-200`}>
          Copy another ship.
        </span>
      );
    case 'putShipOnDeck':
      return (
        <span className={`${small ? 'text-[8px]' : 'text-[10px]'} text-gray-200`}>
          Put ship on top of deck.
        </span>
      );
    case 'choice':
      return (
        <span className={`${small ? 'text-[8px]' : 'text-[10px]'} text-gray-200`}>
          {effect.options.map(o => o.map(formatEffectShort).join(', ')).join(' OR ')}
        </span>
      );
  }
}

function formatEffectShort(e: Effect): string {
  switch (e.kind) {
    case 'trade': return `+${e.amount} Trade`;
    case 'combat': return `+${e.amount} Combat`;
    case 'authority': return `+${e.amount} Authority`;
    case 'draw': return `Draw ${e.amount}`;
    default: return '';
  }
}

function formatEffect(e: Effect): string {
  switch (e.kind) {
    case 'trade': return `+${e.amount} Trade`;
    case 'combat': return `+${e.amount} Combat`;
    case 'authority': return `+${e.amount} Authority`;
    case 'draw': return `Draw ${e.amount}`;
    case 'discardOpponent': return `Opp. discard ${e.amount}`;
    case 'destroyBase': return 'Destroy base';
    case 'scrapTradeRow': return `Scrap ≤${e.upTo} from row`;
    case 'scrapFromHandOrDiscard': return `Scrap ≤${e.upTo} hand/discard`;
    case 'acquireShipFree': return `Free ship ≤${e.maxCost}`;
    case 'acquireToTopOfDeck': return 'Next buy → top deck';
    case 'putShipOnDeck': return 'Ship → top deck';
    case 'copyShip': return 'Copy a ship';
    case 'choice': return e.options.map(o => o.map(formatEffect).join(', ')).join(' OR ');
  }
}

/* ── Ability section ── */
function AbilitySection({ label, effects, factionIcon, bgColor, small }: {
  label: 'primary' | 'ally' | 'scrap';
  effects: Effect[];
  factionIcon: string;
  bgColor: string;
  small: boolean;
}) {
  if (effects.length === 0) return null;

  const hasIcons = effects.some(e => e.kind === 'trade' || e.kind === 'combat' || e.kind === 'authority');
  const iconEffects = effects.filter(e => e.kind === 'trade' || e.kind === 'combat' || e.kind === 'authority');
  const textEffects = effects.filter(e => e.kind !== 'trade' && e.kind !== 'combat' && e.kind !== 'authority');

  const sectionBorder = label === 'ally' ? bgColor : label === 'scrap' ? '#6b7280' : 'transparent';

  return (
    <div
      className="flex items-center gap-1 px-1.5 py-0.5"
      style={{ borderTop: `1px solid ${sectionBorder}33` }}
    >
      {/* Ally/Scrap indicator */}
      {label === 'ally' && (
        <span className={`${small ? 'text-[8px]' : 'text-[10px]'} shrink-0`}>{factionIcon}</span>
      )}
      {label === 'scrap' && (
        <span className={`${small ? 'text-[8px]' : 'text-[10px]'} shrink-0`}>🗑️</span>
      )}

      {/* Icon circles for trade/combat/authority */}
      {hasIcons && (
        <div className="flex items-center gap-0.5">
          {iconEffects.map((e, i) => (
            <EffectIcon key={i} effect={e} small={small} />
          ))}
        </div>
      )}

      {/* Text effects */}
      {textEffects.map((e, i) => (
        <EffectIcon key={`t${i}`} effect={e} small={small} />
      ))}
    </div>
  );
}

/* ── Main CardView ── */
interface CardViewProps {
  def: CardDef;
  onClick?: () => void;
  disabled?: boolean;
  highlight?: boolean;
  small?: boolean;
  className?: string;
}

export default function CardView({ def, onClick, disabled, highlight, small, className = '' }: CardViewProps) {
  const faction = getFaction(def);
  const config = factionConfig[faction] || factionConfig.unaligned;
  const isMultiFaction = def.factions.length > 1;

  const multiBorder = isMultiFaction
    ? `linear-gradient(135deg, ${def.factions.map(f => factionConfig[f]?.border || '#6b7280').join(', ')})`
    : undefined;

  const w = small ? 'w-28' : 'w-44';
  const h = small ? 'h-40' : 'h-64';
  const borderW = small ? '2px' : '3px';
  const costSize = small ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-base';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`${def.name}, ${def.type}, cost ${def.cost}. ${def.primary.map(formatEffect).join(', ')}`}
      className={`
        ${w} ${h} rounded-lg flex flex-col overflow-hidden
        text-left relative select-none
        transition-all duration-150
        ${onClick && !disabled ? 'cursor-pointer hover:scale-105 hover:brightness-110' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${highlight ? 'animate-ally-glow ring-2 ring-white/40' : ''}
        ${className}
      `}
      style={{
        background: config.frameBg,
        border: `${borderW} solid ${isMultiFaction ? 'transparent' : config.border}`,
        borderImage: multiBorder ? `${multiBorder} 1` : undefined,
      }}
    >
      {/* ── TOP: Name bar ── */}
      <div className="flex items-start justify-between px-1.5 pt-1 pb-0.5 shrink-0">
        <div className="flex-1 min-w-0">
          <div className={`font-bold text-white leading-tight ${small ? 'text-[10px]' : 'text-sm'}`}>
            {def.name}
          </div>
          <div className={`text-white/50 leading-none ${small ? 'text-[6px]' : 'text-[8px]'}`}>
            {getTypeLabel(def)}
          </div>
        </div>
        {/* Cost circle */}
        <div
          className={`${costSize} rounded-full flex items-center justify-center font-black shrink-0 shadow-md`}
          style={{ background: config.costBg, color: config.costText }}
        >
          {def.cost}
        </div>
      </div>

      {/* ── ART AREA — takes up most of the card ── */}
      <div className="flex-1 relative overflow-hidden mx-1 rounded" style={{ minHeight: 0 }}>
        <img
          src={`/cards/${def.id}.png`}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Art border matching faction */}
        <div
          className="absolute inset-0 pointer-events-none rounded"
          style={{ boxShadow: `inset 0 0 0 1px ${config.border}66` }}
        />
      </div>

      {/* ── BOTTOM: Abilities ── */}
      <div className="shrink-0 mx-1 mb-1 mt-0.5 rounded overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.85)', border: `1px solid ${config.border}44` }}
      >
        {/* Primary */}
        <AbilitySection label="primary" effects={def.primary} factionIcon={config.icon} bgColor={config.border} small={!!small} />

        {/* Ally */}
        <AbilitySection label="ally" effects={def.ally} factionIcon={config.icon} bgColor={config.border} small={!!small} />

        {/* Scrap */}
        <AbilitySection label="scrap" effects={def.scrap} factionIcon={config.icon} bgColor={config.border} small={!!small} />

        {/* Empty state for cards with no abilities shown */}
        {def.primary.length === 0 && def.ally.length === 0 && def.scrap.length === 0 && (
          <div className={`px-1.5 py-0.5 ${small ? 'text-[7px]' : 'text-[9px]'} text-gray-500 italic`}>
            All ships get +1 combat
          </div>
        )}
      </div>

      {/* ── DEFENSE BADGE (bases & outposts) ── */}
      {def.defense != null && (
        <div
          className="absolute bottom-1 right-1 flex items-center justify-center rounded-full font-black text-white shadow-lg"
          style={{
            width: small ? '18px' : '26px',
            height: small ? '18px' : '26px',
            fontSize: small ? '9px' : '13px',
            background: def.type === 'outpost'
              ? `radial-gradient(circle, ${config.border}, ${config.border}cc)`
              : '#374151',
            border: `2px solid ${config.border}`,
          }}
        >
          {def.defense}
        </div>
      )}

      {/* ── OUTPOST LABEL ── */}
      {def.type === 'outpost' && (
        <div
          className="absolute bottom-1 left-1 px-1 py-0.5 rounded text-white font-bold uppercase"
          style={{
            fontSize: small ? '5px' : '7px',
            background: `${config.border}cc`,
            letterSpacing: '0.5px',
          }}
        >
          Outpost
        </div>
      )}
    </button>
  );
}
