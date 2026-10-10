// Chain World — Core Type Definitions

export type RarityTier = 'genesis' | 'legendary' | 'rare' | 'uncommon' | 'common' | 'floor'

export interface ChogTrait {
  trait_type: string
  value: string
}

export interface ChogMetadata {
  name: string
  description?: string
  image: string
  attributes: ChogTrait[]
}

export interface CharacterStats {
  charisma: number        // 0–100
  persuasion: number      // 0–100
  endurance: number       // 0–100
  intelligence: number    // 0–100
  // Derived
  incomeMultiplier: number
  meterDecayMultiplier: number
  socialGainRate: number
}

export interface CharacterAppearance {
  bodyColor: string
  eyeType: string
  mouthType: string
  hatType: string
  clothesType: string
  accessoryType: string
  backgroundTrait: string
  profession: Profession
  specialAbility: string | null
}

export type Profession = 'banker' | 'dev' | 'validator' | 'degen' | 'freelancer'

export type ZoneId = 0 | 1 | 2 | 3 | 4 | 5
export const ZONE_IDS: ZoneId[] = [0, 1, 2, 3, 4, 5]

export interface Zone {
  id: ZoneId
  name: string
  chain: string
  rpc: string | null
  vibe: string
  baseDailyCost: number   // in gCHOG
  multiplier: number
  color: string
  bgClass: string
  locked: boolean
}

export interface GameMeters {
  funds: number           // 0–1000 gCHOG
  hunger: number          // 0–100
  social: number          // 0–100
  reputation: number      // 0–500
  housingTier: number     // 0–5 (maps to rarity tier)
}

export interface GameState {
  walletAddress: string
  tokenId: number
  registeredLot: number | null
  currentZone: ZoneId
  meters: GameMeters
  gChog: number           // in-game currency balance
  lastSaved: number       // unix timestamp ms
  stats: CharacterStats
  appearance: CharacterAppearance
  rarityTier: RarityTier
  rarityRank: number      // 1–1969 (estimated from traits)
  chogBadgeTier: number   // 0–4 based on $CHOG balance
  registeredOnChain: boolean
  unlockedZones: ZoneId[]
}

export interface GweiData {
  zoneId: ZoneId
  gwei: number | null
  fetchedAt: number
  stale: boolean
}

export interface DailyEvent {
  id: string
  name: string
  description: string
  effect: string
  icon: string            // lucide icon name
  endsAt: number          // unix ms
  multiplier: number
  affectedZone: ZoneId | 'all'
}
