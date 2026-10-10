// Chain World — Main Game HUD

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Home, Briefcase, Map, Zap, Star, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import type { GameState, ZoneId } from '../game/types'
import {
  saveGameState,
  applyTimeDecay,
  isDegenSpiral,
  isChogLegend,
  HOUSING_LABELS,
  TIER_LABELS,
} from '../game/gameEngine'
import { ZONES, getAllZoneGwei, computeDailyCost } from '../game/zones'
import { getTodaysEvent, getEventMultiplier } from '../game/events'
import { CHAIN_WORLD_REGISTRY_ABI } from '../contracts/chainWorldRegistryAbi'
import ChogAvatar from './ChogAvatar'
import MeterBar from './MeterBar'
import ZoneCard from './ZoneCard'
import JobsPanel from './JobsPanel'
import WorldMap from './WorldMap'

const REGISTRY_ADDRESS = import.meta.env.VITE_REGISTRY_ADDRESS as `0x${string}` | undefined

type Tab = 'home' | 'jobs' | 'map' | 'zones'

interface Props {
  gameState: GameState
  onStateChange: (s: GameState) => void
}

export default function GameHUD({ gameState, onStateChange }: Props) {
  const { address } = useAccount()
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [dailyCost, setDailyCost] = useState<number | null>(null)
  const todayEvent = getTodaysEvent()
  const eventMult = getEventMultiplier(todayEvent, gameState.currentZone)

  const degenSpiral = isDegenSpiral(gameState.meters)
  const chogLegend = isChogLegend(gameState.meters)

  // ─── Registration ────────────────────────────────────────────────────────────
  const { writeContract: registerOnChain, data: regHash, isPending: regPending } = useWriteContract()
  const { isLoading: regConfirming, isSuccess: regSuccess } = useWaitForTransactionReceipt({ hash: regHash })

  useEffect(() => {
    if (regSuccess && !gameState.registeredOnChain) {
      const updated = { ...gameState, registeredOnChain: true }
      onStateChange(updated)
      saveGameState(updated)
      toast.success('Registered on-chain! Your lot is claimed.')
    }
  }, [regSuccess, gameState, onStateChange])

  const handleRegister = () => {
    if (!REGISTRY_ADDRESS || !address) return
    registerOnChain({
      address: REGISTRY_ADDRESS,
      abi: CHAIN_WORLD_REGISTRY_ABI,
      functionName: 'register',
      args: [BigInt(gameState.tokenId)],
      chainId: 10143,
    })
  }

  // ─── Daily cost calculation ────────────────────────────────────────────────
  useEffect(() => {
    const zone = ZONES[gameState.currentZone]
    const currentZone = gameState.currentZone
    const rarityRank = gameState.rarityRank
    const gChog = gameState.gChog
    const hungerMeter = gameState.meters.hunger
    void getAllZoneGwei().then(allData => {
      const zData = allData.find(d => d.zoneId === currentZone)
      const cost = computeDailyCost(zone, zData?.gwei ?? null, rarityRank, eventMult)
      setDailyCost(cost)
      // Apply time decay now
      const decayed = applyTimeDecay(gameState, cost)
      if (
        Math.round(decayed.gChog) !== Math.round(gChog) ||
        Math.round(decayed.meters.hunger) !== Math.round(hungerMeter)
      ) {
        onStateChange(decayed)
        saveGameState(decayed)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.currentZone, eventMult])

  // ─── Replenish actions ─────────────────────────────────────────────────────
  const buyFood = () => {
    const cost = 50
    if (gameState.gChog < cost) { toast.error('Not enough gCHOG for food!'); return }
    const updated = {
      ...gameState,
      gChog: gameState.gChog - cost,
      meters: { ...gameState.meters, hunger: Math.min(100, gameState.meters.hunger + 50) },
    }
    onStateChange(updated)
    saveGameState(updated)
    toast.success('Fed your Chog! +50 Hunger')
  }

  const socialise = () => {
    const updated = {
      ...gameState,
      meters: {
        ...gameState.meters,
        social: Math.min(100, gameState.meters.social + gameState.stats.socialGainRate),
      },
    }
    onStateChange(updated)
    saveGameState(updated)
    toast.success(`Socialised! +${gameState.stats.socialGainRate} Social`)
  }

  // ─── Zone travel ────────────────────────────────────────────────────────────
  const handleTravel = (zoneId: ZoneId) => {
    if (!gameState.unlockedZones.includes(zoneId)) {
      toast.error('Zone locked. Improve your rarity tier to unlock it.')
      return
    }
    const cost = zoneId * 50
    if (gameState.gChog < cost) {
      toast.error(`Travel costs ${cost} gCHOG. Earn more first.`)
      return
    }
    const updated = {
      ...gameState,
      currentZone: zoneId,
      gChog: gameState.gChog - cost,
    }
    onStateChange(updated)
    saveGameState(updated)
    toast.success(`Moved to ${ZONES[zoneId].name}!`)
  }

  const currentZone = ZONES[gameState.currentZone]

  // ─── Tabs ──────────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'zones', label: 'Zones', icon: Zap },
    { id: 'map', label: 'Map', icon: Map },
  ]

  return (
    <div
      className="min-h-dvh flex flex-col max-w-md mx-auto"
      style={{ background: 'var(--bg-gradient)' }}
    >
      {/* Top bar */}
      <div
        className="px-4 pt-4 pb-2 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <h1
            className="display text-lg font-bold"
            style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}
          >
            Chain World
          </h1>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {currentZone.name}
            {' '}
            <span style={{ color: currentZone.color }}>●</span>
          </p>
        </div>
        <div className="text-right">
          <p
            className="tabular text-base font-bold mono"
            style={{ color: 'var(--chog-gold)' }}
          >
            {Math.round(gameState.gChog).toLocaleString()} gCHOG
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {dailyCost != null ? `${dailyCost}/day burn` : '...'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">

        {/* Degen spiral warning */}
        {degenSpiral && (
          <div
            className="p-3 rounded-xl flex items-start gap-2 danger-pulse border"
            style={{ background: 'rgba(248,113,113,0.08)' }}
          >
            <Zap size={14} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--danger)' }}>Degen Spiral!</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Low Hunger + Low Social = -60% earnings. Feed and socialise!
              </p>
            </div>
          </div>
        )}

        {/* Chog Legend badge */}
        {chogLegend && (
          <div
            className="p-3 rounded-xl flex items-center gap-2"
            style={{ background: 'rgba(245,197,66,0.1)', border: '1px solid rgba(245,197,66,0.3)' }}
          >
            <Trophy size={14} style={{ color: 'var(--chog-gold)' }} />
            <p className="text-xs font-bold" style={{ color: 'var(--chog-gold)' }}>
              Chog Legend — players who visit you gain a buff
            </p>
          </div>
        )}

        {/* Daily event */}
        <div
          className="p-3 rounded-xl flex items-center justify-between"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>
              {todayEvent.name}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{todayEvent.effect}</p>
          </div>
          <div
            className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(126,179,248,0.15)', color: 'var(--accent)' }}
          >
            Active
          </div>
        </div>

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-3">
            {/* Character card */}
            <div className={`glass-strong p-4 frame-${gameState.rarityTier}`} style={{ borderRadius: 16 }}>
              <div className="flex items-center gap-4">
                <ChogAvatar
                  appearance={gameState.appearance}
                  tier={gameState.rarityTier}
                  size={80}
                  animated={chogLegend}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p
                      className="display text-base font-bold truncate"
                      style={{ color: 'var(--ink)' }}
                    >
                      Chog #{gameState.tokenId}
                    </p>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        color: gameState.rarityTier === 'genesis' || gameState.rarityTier === 'legendary'
                          ? 'var(--chog-gold)' : 'var(--ink-2)',
                      }}
                    >
                      {TIER_LABELS[gameState.rarityTier]}
                    </span>
                  </div>
                  <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>
                    {gameState.appearance.profession.charAt(0).toUpperCase() + gameState.appearance.profession.slice(1)}
                    {gameState.appearance.specialAbility && (
                      <span style={{ color: 'var(--chog-gold)' }}> • {gameState.appearance.specialAbility.replace(/_/g, ' ')}</span>
                    )}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {HOUSING_LABELS[gameState.meters.housingTier]}
                  </p>
                  {/* $CHOG badge */}
                  {gameState.chogBadgeTier > 0 && (
                    <div
                      className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(245,197,66,0.15)', color: 'var(--chog-gold)' }}
                    >
                      <Star size={9} />
                      {gameState.chogBadgeTier === 4 ? 'Diamond' : gameState.chogBadgeTier === 3 ? 'Gold' : gameState.chogBadgeTier === 2 ? 'Silver' : 'Bronze'} $CHOG Holder
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Life meters */}
            <div
              className="glass p-4 space-y-3"
            >
              <MeterBar label="Funds" value={gameState.meters.funds} max={1000} icon="" />
              <MeterBar label="Hunger" value={gameState.meters.hunger} max={100} icon="" />
              <MeterBar label="Social" value={gameState.meters.social} max={100} icon="" />
              <MeterBar label="Reputation" value={gameState.meters.reputation} max={500} icon="" />

              {/* Quick actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={buyFood}
                  disabled={gameState.gChog < 50}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold transition-opacity"
                  style={{
                    background: 'var(--surface-strong)',
                    color: 'var(--ink)',
                    opacity: gameState.gChog < 50 ? 0.4 : 1,
                    border: '1px solid var(--border)',
                  }}
                >
                  Buy Food (50 gCHOG)
                </button>
                <button
                  onClick={socialise}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold"
                  style={{
                    background: 'var(--surface-strong)',
                    color: 'var(--ink)',
                    border: '1px solid var(--border)',
                  }}
                >
                  Socialise
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="glass p-4">
              <p className="text-xs font-semibold mb-2 display" style={{ color: 'var(--ink)' }}>Character Stats</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Charisma', val: gameState.stats.charisma },
                  { label: 'Persuasion', val: gameState.stats.persuasion },
                  { label: 'Endurance', val: gameState.stats.endurance },
                  { label: 'Intelligence', val: gameState.stats.intelligence },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{s.label}</span>
                    <div className="flex items-center gap-1">
                      <div
                        className="h-1 rounded-full"
                        style={{ width: `${s.val * 0.4}px`, background: 'var(--accent)', minWidth: 4 }}
                      />
                      <span className="tabular text-xs mono" style={{ color: 'var(--ink-2)' }}>{s.val}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* On-chain registration */}
            {!gameState.registeredOnChain && REGISTRY_ADDRESS && (
              <div
                className="glass p-4 space-y-2"
              >
                <p className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>Claim Your Lot</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Register on-chain to claim a lot on the World Map. Your Chog ownership is verified by the contract.
                </p>
                <button
                  onClick={handleRegister}
                  disabled={regPending || regConfirming}
                  className="w-full py-2 rounded-lg text-sm font-semibold transition-opacity"
                  style={{
                    background: 'var(--accent)',
                    color: '#0a0f1e',
                    opacity: regPending || regConfirming ? 0.6 : 1,
                  }}
                >
                  {regPending ? 'Confirm in wallet...' : regConfirming ? 'Registering...' : 'Register On-Chain'}
                </button>
              </div>
            )}
            {gameState.registeredOnChain && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl"
                style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}
              >
                <div className="live-dot" />
                <p className="text-xs" style={{ color: 'var(--success)' }}>
                  Registered on-chain {gameState.registeredLot != null ? `• Lot #${gameState.registeredLot}` : ''}
                </p>
              </div>
            )}
          </div>
        )}

        {/* JOBS TAB */}
        {activeTab === 'jobs' && (
          <JobsPanel
            gameState={gameState}
            onEarn={(newState) => { onStateChange(newState); saveGameState(newState) }}
            isDegenSpiral={degenSpiral}
            eventMultiplier={eventMult}
          />
        )}

        {/* ZONES TAB */}
        {activeTab === 'zones' && (
          <div className="space-y-2">
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Travel costs scale with zone distance. Rarer NFTs get cost discounts.
            </p>
            {ZONES.map(zone => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                isCurrentZone={gameState.currentZone === zone.id}
                isUnlocked={gameState.unlockedZones.includes(zone.id)}
                rarityRank={gameState.rarityRank}
                onTravel={handleTravel}
                eventMultiplier={eventMult}
              />
            ))}
          </div>
        )}

        {/* MAP TAB */}
        {activeTab === 'map' && (
          <WorldMap
            gameState={gameState}
            onVisit={(wallet) => toast.info(`Visiting ${wallet.slice(0, 8)}...`)}
          />
        )}
      </div>

      {/* Bottom tab bar */}
      <div
        className="px-4 py-2 flex gap-1"
        style={{ borderTop: '1px solid var(--border)', background: 'rgba(10,15,30,0.8)', backdropFilter: 'blur(20px)' }}
      >
        {tabs.map(t => {
          const Icon = t.icon
          const active = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors"
              style={{
                background: active ? 'var(--surface-strong)' : 'transparent',
                color: active ? 'var(--ink)' : 'var(--subtle)',
              }}
            >
              <Icon size={18} />
              <span className="text-xs">{t.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
