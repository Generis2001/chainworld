// Chain World — Zone Definitions & Gwei Oracle

import type { Zone, ZoneId, GweiData } from './types'

export const ZONES: Zone[] = [
  {
    id: 0,
    name: 'Monad Slums',
    chain: 'Monad Testnet',
    rpc: 'https://testnet-rpc.monad.xyz',
    vibe: 'Chaotic, fast, home zone',
    baseDailyCost: 10,
    multiplier: 1.0,
    color: '#8b5cf6',
    bgClass: 'from-purple-900/30 to-indigo-900/20',
    locked: false,
  },
  {
    id: 1,
    name: 'Ethereum Heights',
    chain: 'Ethereum',
    rpc: 'https://ethereum.reth.rs/rpc',
    vibe: 'Prestige, expensive, high earners',
    baseDailyCost: 80,
    multiplier: 3.0,
    color: '#6366f1',
    bgClass: 'from-indigo-900/30 to-blue-900/20',
    locked: true,
  },
  {
    id: 2,
    name: 'Base Borough',
    chain: 'Base',
    rpc: 'https://mainnet.base.org',
    vibe: 'Stable, mid-tier grind',
    baseDailyCost: 25,
    multiplier: 1.5,
    color: '#3b82f6',
    bgClass: 'from-blue-900/30 to-cyan-900/20',
    locked: true,
  },
  {
    id: 3,
    name: 'Arbitrum Alley',
    chain: 'Arbitrum One',
    rpc: 'https://arb1.arbitrum.io/rpc',
    vibe: 'Trader district, hustle',
    baseDailyCost: 20,
    multiplier: 1.3,
    color: '#06b6d4',
    bgClass: 'from-cyan-900/30 to-teal-900/20',
    locked: true,
  },
  {
    id: 4,
    name: 'Solana Burnyard',
    chain: 'Solana',
    rpc: null, // Solana uses different RPC format
    vibe: 'Volatile, chaotic',
    baseDailyCost: 15,
    multiplier: 1.2,
    color: '#f97316',
    bgClass: 'from-orange-900/30 to-red-900/20',
    locked: true,
  },
  {
    id: 5,
    name: 'The Void',
    chain: 'Offline',
    rpc: null,
    vibe: 'Ghost mode, rest state',
    baseDailyCost: 0,
    multiplier: 0,
    color: '#475569',
    bgClass: 'from-slate-900/30 to-gray-900/20',
    locked: true,
  },
]

// ─── Gwei Cache ────────────────────────────────────────────────────────────────
const CACHE_TTL_MS = 60_000 // 60 seconds
const gweiCache = new Map<ZoneId, GweiData>()

async function fetchGwei(rpcUrl: string): Promise<number | null> {
  try {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_gasPrice', params: [], id: 1 }),
      signal: AbortSignal.timeout(5000),
    })
    const json = (await res.json()) as { result?: string }
    const hex = json.result
    if (!hex) return null
    const wei = BigInt(hex)
    const gwei = Number(wei) / 1e9
    return Math.round(gwei * 100) / 100
  } catch {
    return null
  }
}

export async function getZoneGwei(zoneId: ZoneId): Promise<GweiData> {
  const zone = ZONES[zoneId]
  const now = Date.now()
  const cached = gweiCache.get(zoneId)

  // Return fresh cache
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached
  }

  // Void and Solana — no gwei
  if (zone.rpc === null) {
    const data: GweiData = { zoneId, gwei: null, fetchedAt: now, stale: false }
    gweiCache.set(zoneId, data)
    return data
  }

  const gwei = await fetchGwei(zone.rpc)
  const data: GweiData = {
    zoneId,
    gwei,
    fetchedAt: now,
    stale: gwei === null && cached != null,
  }
  // If fetch failed and we have old cache, preserve old value but mark stale
  if (gwei === null && cached?.gwei != null) {
    data.gwei = cached.gwei
    data.stale = true
  }
  gweiCache.set(zoneId, data)
  return data
}

export async function getAllZoneGwei(): Promise<GweiData[]> {
  return Promise.all(ZONES.map(z => getZoneGwei(z.id)))
}

// ─── Cost of Living Calculation ────────────────────────────────────────────────
export function computeDailyCost(
  zone: Zone,
  gweiValue: number | null,
  rarityRank: number,
  eventMultiplier: number = 1
): number {
  if (zone.id === 5) return 0 // Void is free
  const gwei = gweiValue ?? 10 // fallback to 10 if unknown
  const rarityDiscount = 1 - 0.5 * (1 - rarityRank / 1969) // better rank = more discount
  const cost = zone.baseDailyCost * (gwei / 10) * zone.multiplier * rarityDiscount * eventMultiplier
  return Math.max(1, Math.round(cost))
}
