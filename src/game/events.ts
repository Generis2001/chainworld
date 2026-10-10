// Chain World — Daily Events (block-timestamp seeded)

import type { DailyEvent, ZoneId } from './types'

const EVENT_DURATION_MS = 2 * 60 * 60 * 1000 // 2 hours

const EVENT_TEMPLATES: Omit<DailyEvent, 'endsAt'>[] = [
  {
    id: 'gas_war',
    name: 'Gas War',
    description: 'Network congestion spikes! Zone costs are doubled.',
    effect: 'All zones cost 2x for 2 hours',
    icon: 'Flame',
    multiplier: 2,
    affectedZone: 'all',
  },
  {
    id: 'airdrop_season',
    name: 'Airdrop Season',
    description: 'Free money is raining! All earnings increased.',
    effect: 'All earnings 1.5x for 2 hours',
    icon: 'Gift',
    multiplier: 1.5,
    affectedZone: 'all',
  },
  {
    id: 'chog_parade',
    name: 'Chog Parade',
    description: 'The Chog World Order marches! Social gains tripled.',
    effect: 'Social gain rate 3x for 2 hours',
    icon: 'Users',
    multiplier: 3,
    affectedZone: 0,
  },
  {
    id: 'rug_pull',
    name: 'Rug Pull',
    description: 'A shadowy dev has rugged the floor. Floor Chogs take losses.',
    effect: 'Floor tier loses 50% gCHOG',
    icon: 'TrendingDown',
    multiplier: 0.5,
    affectedZone: 0,
  },
  {
    id: 'bull_run',
    name: 'Bull Run',
    description: 'Number go up! NFT Flipper payouts are doubled.',
    effect: 'NFT Flipper 2x payouts for 2 hours',
    icon: 'TrendingUp',
    multiplier: 2,
    affectedZone: 'all',
  },
  {
    id: 'eth_surge',
    name: 'ETH Gas Surge',
    description: 'Ethereum Heights is CONGESTED. Fees are brutal.',
    effect: 'Ethereum Heights costs 4x',
    icon: 'Zap',
    multiplier: 4,
    affectedZone: 1,
  },
  {
    id: 'monad_speed',
    name: 'Monad Speed Demon',
    description: 'Monad hits peak throughput. Monad Slums earns 2x.',
    effect: 'Monad Slums earnings 2x',
    icon: 'Rocket',
    multiplier: 2,
    affectedZone: 0,
  },
]

// Seed from today's date — same event for all players on the same day
export function getTodaysEvent(): DailyEvent {
  const today = new Date()
  const dayNumber = Math.floor(today.getTime() / (1000 * 60 * 60 * 24))
  const idx = dayNumber % EVENT_TEMPLATES.length
  const template = EVENT_TEMPLATES[idx]
  const startOfDay = dayNumber * 1000 * 60 * 60 * 24
  return {
    ...template,
    endsAt: startOfDay + EVENT_DURATION_MS,
  }
}

export function isEventActive(event: DailyEvent): boolean {
  return Date.now() < event.endsAt
}

export function getEventMultiplier(event: DailyEvent, zoneId: ZoneId): number {
  if (!isEventActive(event)) return 1
  if (event.affectedZone === 'all') return event.multiplier
  if (event.affectedZone === zoneId) return event.multiplier
  return 1
}
