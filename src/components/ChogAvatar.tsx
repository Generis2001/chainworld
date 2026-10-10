// Chain World — Chog Character Avatar (CSS/SVG layered renderer)

import type { CharacterAppearance, RarityTier } from '../game/types'

interface Props {
  appearance: CharacterAppearance
  tier: RarityTier
  size?: number
  animated?: boolean
}

const EYE_SHAPES: Record<string, JSX.Element> = {
  laser: (
    <g>
      <circle cx="35" cy="42" r="5" fill="#f87171" />
      <circle cx="65" cy="42" r="5" fill="#f87171" />
      <line x1="0" y1="42" x2="35" y2="42" stroke="#f87171" strokeWidth="2" opacity="0.6" />
      <line x1="65" y1="42" x2="100" y2="42" stroke="#f87171" strokeWidth="2" opacity="0.6" />
    </g>
  ),
  smirk: (
    <g>
      <ellipse cx="35" cy="42" rx="6" ry="5" fill="#1a1a2e" />
      <ellipse cx="65" cy="42" rx="6" ry="5" fill="#1a1a2e" />
      <circle cx="37" cy="41" r="2" fill="white" opacity="0.8" />
      <circle cx="67" cy="41" r="2" fill="white" opacity="0.8" />
    </g>
  ),
  happy: (
    <g>
      <path d="M29 40 Q35 48 41 40" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M59 40 Q65 48 71 40" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  ),
  shades: (
    <g>
      <rect x="25" y="37" width="20" height="12" rx="6" fill="#1a1a2e" />
      <rect x="55" y="37" width="20" height="12" rx="6" fill="#1a1a2e" />
      <line x1="45" y1="43" x2="55" y2="43" stroke="#1a1a2e" strokeWidth="2" />
      <rect x="26" y="38" width="8" height="4" rx="2" fill="white" opacity="0.2" />
    </g>
  ),
  dead: (
    <g>
      <line x1="28" y1="38" x2="42" y2="48" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="42" y1="38" x2="28" y2="48" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="58" y1="38" x2="72" y2="48" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="72" y1="38" x2="58" y2="48" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  ),
  cry: (
    <g>
      <circle cx="35" cy="42" r="5" fill="#1a1a2e" />
      <circle cx="65" cy="42" r="5" fill="#1a1a2e" />
      <path d="M32 48 Q35 56 38 48" fill="#60a5fa" opacity="0.8" />
      <path d="M62 48 Q65 56 68 48" fill="#60a5fa" opacity="0.8" />
    </g>
  ),
  angry: (
    <g>
      <circle cx="35" cy="44" r="5" fill="#1a1a2e" />
      <circle cx="65" cy="44" r="5" fill="#1a1a2e" />
      <line x1="28" y1="36" x2="42" y2="40" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="58" y1="40" x2="72" y2="36" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  ),
  heart: (
    <g>
      <path d="M35 46 C35 40 27 38 27 44 C27 50 35 54 35 54 C35 54 43 50 43 44 C43 38 35 40 35 46Z" fill="#f43f5e" />
      <path d="M65 46 C65 40 57 38 57 44 C57 50 65 54 65 54 C65 54 73 50 73 44 C73 38 65 40 65 46Z" fill="#f43f5e" />
    </g>
  ),
  default: (
    <g>
      <circle cx="35" cy="42" r="6" fill="#1a1a2e" />
      <circle cx="65" cy="42" r="6" fill="#1a1a2e" />
      <circle cx="37" cy="40" r="2" fill="white" opacity="0.7" />
      <circle cx="67" cy="40" r="2" fill="white" opacity="0.7" />
    </g>
  ),
}

const MOUTH_SHAPES: Record<string, JSX.Element> = {
  grin: <path d="M30 65 Q50 80 70 65" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round" />,
  smirk: <path d="M35 65 Q55 72 68 62" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
  frown: <path d="M30 72 Q50 60 70 72" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round" />,
  open: (
    <g>
      <ellipse cx="50" cy="68" rx="14" ry="9" fill="#1a1a2e" />
      <ellipse cx="50" cy="70" rx="10" ry="5" fill="#7f1d1d" />
    </g>
  ),
  tongue: (
    <g>
      <path d="M30 65 Q50 78 70 65" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="76" rx="8" ry="5" fill="#f43f5e" />
    </g>
  ),
  default: <path d="M35 66 Q50 74 65 66" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
}

const HAT_SHAPES: Record<string, JSX.Element> = {
  crown: (
    <g>
      <rect x="25" y="12" width="50" height="14" rx="2" fill="#f5c542" />
      <polygon points="25,26 30,12 37,22 44,12 50,22 56,12 63,22 70,12 75,26" fill="#f5c542" />
      <circle cx="37" cy="14" r="3" fill="#ef4444" />
      <circle cx="50" cy="12" r="3" fill="#3b82f6" />
      <circle cx="63" cy="14" r="3" fill="#ef4444" />
    </g>
  ),
  wizard: (
    <g>
      <polygon points="50,2 30,26 70,26" fill="#7c3aed" />
      <rect x="22" y="24" width="56" height="7" rx="3" fill="#6d28d9" />
      <circle cx="50" cy="10" r="3" fill="#f5c542" />
    </g>
  ),
  cap: (
    <g>
      <path d="M20 24 Q50 10 80 24 L75 28 Q50 18 25 28Z" fill="#1e293b" />
      <rect x="15" y="24" width="70" height="6" rx="3" fill="#0f172a" />
    </g>
  ),
  tophat: (
    <g>
      <rect x="32" y="6" width="36" height="22" rx="3" fill="#0f172a" />
      <rect x="22" y="26" width="56" height="5" rx="2" fill="#0f172a" />
      <rect x="34" y="19" width="32" height="3" fill="#f5c542" opacity="0.6" />
    </g>
  ),
  halo: (
    <ellipse cx="50" cy="10" rx="24" ry="7" fill="none" stroke="#f5c542" strokeWidth="4" opacity="0.9" />
  ),
  none: <></>,
  other: (
    <g>
      <rect x="28" y="14" width="44" height="14" rx="7" fill="#334155" />
    </g>
  ),
}

const CLOTHES_COLORS: Record<string, string> = {
  suit: '#1e293b',
  hoodie: '#7c3aed',
  armor: '#64748b',
  none: 'transparent',
  other: '#374151',
}

const ACCESSORY_ELEMENTS: Record<string, JSX.Element> = {
  chain: (
    <path d="M30 82 Q50 88 70 82" stroke="#f5c542" strokeWidth="3" fill="none" opacity="0.9" />
  ),
  glasses: (
    <g>
      <circle cx="35" cy="42" r="8" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <circle cx="65" cy="42" r="8" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="43" y1="42" x2="57" y2="42" stroke="#94a3b8" strokeWidth="1.5" />
    </g>
  ),
  earring: (
    <g>
      <circle cx="17" cy="55" r="3" fill="#f5c542" />
      <circle cx="83" cy="55" r="3" fill="#f5c542" />
    </g>
  ),
  pipe: (
    <g>
      <path d="M55 70 Q65 70 68 65" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="68" cy="63" r="4" fill="#451a03" />
    </g>
  ),
  none: <></>,
}

const TIER_FRAME_STYLE: Record<RarityTier, React.CSSProperties> = {
  genesis:   { boxShadow: '0 0 0 2px #f5c542, 0 0 20px 4px rgba(245,197,66,0.5)' },
  legendary: { boxShadow: '0 0 0 2px #f5c542' },
  rare:      { boxShadow: '0 0 0 2px #a855f7' },
  uncommon:  { boxShadow: '0 0 0 2px #3b82f6' },
  common:    { boxShadow: '0 0 0 1px #475569' },
  floor:     {},
}

export default function ChogAvatar({ appearance, tier, size = 100, animated = false }: Props) {
  const { bodyColor, eyeType, mouthType, hatType, clothesType, accessoryType } = appearance

  const eyeSvg = EYE_SHAPES[eyeType] ?? EYE_SHAPES.default
  const mouthSvg = MOUTH_SHAPES[mouthType] ?? MOUTH_SHAPES.default
  const hatSvg = HAT_SHAPES[hatType] ?? HAT_SHAPES.none
  const accessorySvg = ACCESSORY_ELEMENTS[accessoryType] ?? ACCESSORY_ELEMENTS.none
  const clothesColor = CLOTHES_COLORS[clothesType] ?? CLOTHES_COLORS.other

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        ...TIER_FRAME_STYLE[tier],
        animation: animated ? 'glow-pulse 3s ease-in-out infinite' : undefined,
      }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        {/* Background circle */}
        <circle cx="50" cy="50" r="50" fill="#1e293b" />

        {/* Hat (behind head) */}
        {hatSvg}

        {/* Head */}
        <ellipse cx="50" cy="55" rx="32" ry="30" fill={bodyColor} />

        {/* Ears */}
        <ellipse cx="18" cy="50" rx="8" ry="10" fill={bodyColor} />
        <ellipse cx="82" cy="50" rx="8" ry="10" fill={bodyColor} />
        <ellipse cx="18" cy="50" rx="4" ry="6" fill={bodyColor} opacity="0.6" />
        <ellipse cx="82" cy="50" rx="4" ry="6" fill={bodyColor} opacity="0.6" />

        {/* Eyes */}
        {eyeSvg}

        {/* Nose */}
        <ellipse cx="50" cy="56" rx="5" ry="3" fill="rgba(0,0,0,0.2)" />

        {/* Mouth */}
        {mouthSvg}

        {/* Clothes strip at bottom */}
        {clothesType !== 'none' && (
          <path d="M18 82 Q50 95 82 82 L82 100 L18 100Z" fill={clothesColor} />
        )}

        {/* Accessory */}
        {accessorySvg}
      </svg>
    </div>
  )
}
