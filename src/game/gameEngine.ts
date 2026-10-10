// Chain World — Game State Engine (localStorage persistence + time decay)

import type { GameState, GameMeters, ZoneId } from './types'
import { rankToTier, estimateRarityRank, tierToStartingFunds, tierToUnlockedZones, tierToHousingLevel, mapTraitsToCharacter } from './traitMapper'
import type { ChogTrait } from './types'

const STORAGE_KEY_PREFIX = 'chainworld_v1_'

// ─── Decay rates per simulated hour ───────────────────────────────────────────
const BASE_DECAY = {
  hunger: 4,    // -4 per hour
  social: 2,    // -2 per hour
  reputation: 1 // -1 per hour
}

function storageKey(walletAddress: string, tokenId: number) {
  return `${STORAGE_KEY_PREFIX}${walletAddress.toLowerCase()}_${tokenId}`
}

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(storageKey(state.walletAddress, state.tokenId), JSON.stringify({
      ...state,
      lastSaved: Date.now(),
    }))
  } catch (e) {
    console.warn('[ChainWorld] Failed to save game state:', e)
  }
}

export function loadGameState(walletAddress: string, tokenId: number): GameState | null {
  try {
    const raw = localStorage.getItem(storageKey(walletAddress, tokenId))
    if (!raw) return null
    return JSON.parse(raw) as GameState
  } catch {
    return null
  }
}

// ─── Apply time-based decay since last save ────────────────────────────────────
export function applyTimeDecay(state: GameState, dailyCostGwei: number): GameState {
  const now = Date.now()
  const elapsedMs = now - state.lastSaved
  const elapsedHours = elapsedMs / (1000 * 60 * 60)

  if (elapsedHours < 0.016) return state // less than 1 minute, skip

  const decayMult = state.stats.meterDecayMultiplier
  const meters = { ...state.meters }

  // Hunger
  meters.hunger = Math.max(0, meters.hunger - BASE_DECAY.hunger * elapsedHours * decayMult)

  // Social
  meters.social = Math.max(0, meters.social - BASE_DECAY.social * elapsedHours * decayMult)

  // Reputation
  meters.reputation = Math.max(0, meters.reputation - BASE_DECAY.reputation * elapsedHours * decayMult)

  // Funds: cost of living per day = dailyCostGwei, so per-hour = dailyCostGwei / 24
  const fundsDrain = (dailyCostGwei / 24) * elapsedHours
  const newFunds = Math.max(0, state.gChog - fundsDrain)

  // Eviction: if funds hit 0 and housing > 0, downgrade housing
  let newHousingTier = meters.housingTier
  if (newFunds === 0 && state.gChog > 0 && newHousingTier > 0) {
    newHousingTier = Math.max(0, newHousingTier - 1)
  }
  meters.housingTier = newHousingTier

  return {
    ...state,
    meters,
    gChog: newFunds,
    lastSaved: now,
  }
}

// ─── Create new game state for a first-time player ────────────────────────────
export function createNewGameState(
  walletAddress: string,
  tokenId: number,
  traits: ChogTrait[],
  chogBadgeTier: number
): GameState {
  const rank = estimateRarityRank(traits, tokenId)
  const tier = rankToTier(rank)
  const { stats, appearance, startingZone } = mapTraitsToCharacter(traits, tokenId)
  const unlockedZones = tierToUnlockedZones(tier)
  const housingTier = tierToHousingLevel(tier)
  let startingFunds = tierToStartingFunds(tier)

  // $CHOG badge bonus
  if (chogBadgeTier >= 4) {
    startingFunds *= 2
  } else if (chogBadgeTier >= 3) {
    startingFunds = Math.round(startingFunds * 1.5)
  }

  const meters: GameMeters = {
    funds: Math.min(1000, startingFunds / 50),  // display as 0-1000 meter
    hunger: 100,
    social: 75,
    reputation: chogBadgeTier >= 1 ? 60 : 50,
    housingTier,
  }

  return {
    walletAddress,
    tokenId,
    registeredLot: null,
    currentZone: unlockedZones.includes(startingZone) ? startingZone : 0,
    meters,
    gChog: startingFunds,
    lastSaved: Date.now(),
    stats,
    appearance,
    rarityTier: tier,
    rarityRank: rank,
    chogBadgeTier,
    registeredOnChain: false,
    unlockedZones,
  }
}

// ─── Meter helpers ─────────────────────────────────────────────────────────────
export function isDegenSpiral(meters: GameMeters): boolean {
  return meters.hunger < 20 && meters.social < 20
}

export function isChogLegend(meters: GameMeters): boolean {
  return meters.reputation >= 400
}

export function meterColor(value: number, max: number): string {
  const pct = value / max
  if (pct > 0.6) return '#4ade80'   // green
  if (pct > 0.3) return '#f59e0b'   // amber
  return '#f87171'                   // red
}

// ─── Earn gCHOG from a job ─────────────────────────────────────────────────────
export function earnGChog(state: GameState, baseAmount: number): GameState {
  const earned = Math.round(baseAmount * state.stats.incomeMultiplier)
  const newFunds = state.gChog + earned
  const newMeter = Math.min(1000, state.meters.funds + earned / 100)
  return {
    ...state,
    gChog: newFunds,
    meters: { ...state.meters, funds: newMeter },
  }
}

// ─── Replenish meter ───────────────────────────────────────────────────────────
export function replenishMeter(
  state: GameState,
  meter: 'hunger' | 'social' | 'reputation',
  amount: number,
  cost: number
): GameState | null {
  if (state.gChog < cost) return null // can't afford
  const meters = { ...state.meters }
  const max = meter === 'reputation' ? 500 : 100
  meters[meter] = Math.min(max, meters[meter] + amount)
  return {
    ...state,
    meters,
    gChog: state.gChog - cost,
  }
}

// ─── Travel to zone ────────────────────────────────────────────────────────────
export function travelToZone(state: GameState, zoneId: ZoneId): GameState | { error: string } {
  if (!state.unlockedZones.includes(zoneId)) {
    return { error: 'Zone locked — improve your rarity tier to unlock it.' }
  }
  const travelCost = zoneId * 50  // more distant = more expensive
  if (state.gChog < travelCost) {
    return { error: `Not enough gCHOG. Travel costs ${travelCost} gCHOG.` }
  }
  return {
    ...state,
    currentZone: zoneId,
    gChog: state.gChog - travelCost,
  }
}

// ─── Housing labels ────────────────────────────────────────────────────────────
export const HOUSING_LABELS = [
  'Cardboard Box Node',
  'Shared Dorm',
  'Mid-tier Flat',
  'High-Rise Apartment',
  'Smart Contract Villa',
  'Blockchain Tower Penthouse',
]

export const TIER_LABELS: Record<string, string> = {
  genesis: 'Genesis',
  legendary: 'Legendary',
  rare: 'Rare',
  uncommon: 'Uncommon',
  common: 'Common',
  floor: 'Floor Chog',
}
