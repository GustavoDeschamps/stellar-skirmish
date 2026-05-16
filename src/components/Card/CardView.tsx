import { Rocket, Building2, ShieldX } from 'lucide-react';
import type { CardDef, Effect } from '../../engine/types';

const factionColors: Record<string, string> = {
  trade: '#3b82f6',
  blob: '#22c55e',
  empire: '#eab308',
  cult: '#a855f7',
  unaligned: '#6b7280',
};

function getFactionBorder(factions: string[]): string {
  if (factions.length <= 1) {
    return factionColors[factions[0]] || factionColors.unaligned;
  }
  const colors = factions.map(f => factionColors[f] || factionColors.unaligned);
  return `linear-gradient(135deg, ${colors.join(', ')})`;
}

function TypeIcon({ type }: { type: string }) {
  const cls = "w-4 h-4";
  switch (type) {
    case 'ship': return <Rocket className={cls} />;
    case 'base': return <Building2 className={cls} />;
    case 'outpost': return <ShieldX className={cls} />;
    default: return null;
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

function EffectSection({ label, effects, color }: { label: string; effects: Effect[]; color: string }) {
  if (effects.length === 0) return null;
  return (
    <div className="mt-1">
      <div className="text-[9px] uppercase tracking-wider opacity-60" style={{ color }}>{label}</div>
      <div className="text-[10px] leading-tight">
        {effects.map((e, i) => (
          <div key={i}>{formatEffect(e)}</div>
        ))}
      </div>
    </div>
  );
}

interface CardViewProps {
  def: CardDef;
  onClick?: () => void;
  disabled?: boolean;
  highlight?: boolean;
  small?: boolean;
  className?: string;
}

export default function CardView({ def, onClick, disabled, highlight, small, className = '' }: CardViewProps) {
  const borderColor = getFactionBorder(def.factions);
  const isGradient = def.factions.length > 1;
  const w = small ? 'w-24' : 'w-32';
  const h = small ? 'h-32' : 'h-44';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`${def.name}, ${def.type}, cost ${def.cost}. ${def.primary.map(formatEffect).join(', ')}`}
      className={`
        ${w} ${h} rounded-lg p-2 flex flex-col text-left
        bg-gray-900 text-gray-100 border-2 relative
        transition-all duration-150 select-none
        ${onClick && !disabled ? 'cursor-pointer hover:scale-105 hover:brightness-110' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${highlight ? 'animate-ally-glow ring-2 ring-white/40' : ''}
        ${className}
      `}
      style={
        isGradient
          ? { borderImage: `${borderColor} 1` }
          : { borderColor: borderColor as string }
      }
    >
      {/* Card art background */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <img
          src={`/cards/${def.id}.png`}
          alt=""
          className="w-full h-full object-cover opacity-70"
          loading="lazy"
        />
      </div>

      {/* Cost badge */}
      <div
        className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white z-10"
        style={{ background: factionColors[def.factions[0]] || factionColors.unaligned }}
      >
        {def.cost}
      </div>

      {/* Type icon */}
      <div className="absolute top-1 right-1 opacity-70 z-10">
        <TypeIcon type={def.type} />
      </div>

      {/* Defense badge for bases/outposts */}
      {def.defense != null && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white z-10">
          {def.defense}
        </div>
      )}

      {/* Name */}
      <div className={`relative z-10 font-bold ${small ? 'text-[10px]' : 'text-xs'} mt-2 leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]`}>
        {def.name}
      </div>

      {/* Effects */}
      <div className={`relative z-10 flex-1 overflow-hidden ${small ? 'text-[8px]' : ''} drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]`}>
        <EffectSection label="Primary" effects={def.primary} color="#94a3b8" />
        <EffectSection label="Ally" effects={def.ally} color="#fbbf24" />
        <EffectSection label="Scrap" effects={def.scrap} color="#f87171" />
      </div>
    </button>
  );
}
