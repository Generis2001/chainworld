// Chain World — Jobs Panel (Block Validator, Gwei Grifter, Liquidity Hermit)

import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle, XCircle, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import type { GameState, ZoneId } from '../game/types'
import { getZoneGwei } from '../game/zones'
import { earnGChog } from '../game/gameEngine'
import { toast } from 'sonner'

interface Props {
  gameState: GameState
  onEarn: (newState: GameState) => void
  isDegenSpiral: boolean
  eventMultiplier: number
}

// ─── Block Validator ───────────────────────────────────────────────────────────
function BlockValidatorGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [blocks, setBlocks] = useState<{ id: number; valid: boolean; clicked: boolean; expired: boolean }[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(20)
  const [running, setRunning] = useState(false)
  const nextId = useRef(0)

  const start = () => {
    setBlocks([])
    setScore(0)
    setTimeLeft(20)
    setRunning(true)
  }

  useEffect(() => {
    if (!running) return
    const spawn = setInterval(() => {
      const id = nextId.current++
      setBlocks(prev => [
        ...prev.filter(b => !b.expired).slice(-8),
        { id, valid: Math.random() > 0.4, clicked: false, expired: false },
      ])
      // Expire after 1.5s
      setTimeout(() => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, expired: true } : b))
      }, 1500)
    }, 600)
    return () => clearInterval(spawn)
  }, [running])

  useEffect(() => {
    if (!running) return
    const tick = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setRunning(false)
          clearInterval(tick)
          onComplete(score)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [running, score, onComplete])

  const click = (id: number, valid: boolean) => {
    if (!running) return
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, clicked: true } : b))
    if (valid) setScore(s => s + 10)
    else setScore(s => Math.max(0, s - 5))
  }

  if (!running && timeLeft === 20) {
    return (
      <button
        onClick={start}
        className="w-full py-2 rounded-lg text-sm font-semibold transition-colors"
        style={{ background: 'var(--accent)', color: '#0a0f1e' }}
      >
        Start Validating
      </button>
    )
  }

  if (!running && timeLeft === 0) {
    return (
      <div className="text-center py-2">
        <p className="text-sm font-semibold" style={{ color: 'var(--success)' }}>Score: {score}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Earnings applied</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="tabular text-xs mono" style={{ color: 'var(--muted)' }}>Score: {score}</span>
        <span className="tabular text-xs mono" style={{ color: timeLeft < 5 ? 'var(--danger)' : 'var(--ink-2)' }}>
          {timeLeft}s
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 min-h-12">
        {blocks.filter(b => !b.expired && !b.clicked).map(b => (
          <button
            key={b.id}
            onClick={() => click(b.id, b.valid)}
            className="rounded-lg py-2 text-xs font-bold transition-all active:scale-95"
            style={{
              background: b.valid ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
              border: `1px solid ${b.valid ? '#4ade80' : '#f87171'}`,
              color: b.valid ? '#4ade80' : '#f87171',
            }}
          >
            {b.valid ? '✓' : '✗'}
          </button>
        ))}
      </div>
      <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
        Click valid blocks (✓), avoid invalid ones (✗)
      </p>
    </div>
  )
}

// ─── Gwei Grifter ──────────────────────────────────────────────────────────────
function GweiGrifterGame({
  zoneId,
  onComplete,
}: {
  zoneId: ZoneId
  onComplete: (correct: boolean, streak: number) => void
}) {
  const [currentGwei, setCurrentGwei] = useState<number | null>(null)
  const [_prediction, setPrediction] = useState<'up' | 'down' | null>(null)
  const [streak, setStreak] = useState(0)
  const [waiting, setWaiting] = useState(false)
  const [result, setResult] = useState<{ correct: boolean; newGwei: number } | null>(null)

  useEffect(() => {
    void getZoneGwei(zoneId).then(d => setCurrentGwei(d.gwei))
  }, [zoneId])

  const predict = async (dir: 'up' | 'down') => {
    if (waiting || currentGwei === null) return
    setPrediction(dir)
    setWaiting(true)
    // Wait 10s then fetch again
    await new Promise(r => setTimeout(r, 10000))
    const newData = await getZoneGwei(zoneId)
    const newGwei = newData.gwei ?? currentGwei
    const wentUp = newGwei >= currentGwei
    const correct = (dir === 'up' && wentUp) || (dir === 'down' && !wentUp)
    const newStreak = correct ? streak + 1 : 0
    setStreak(newStreak)
    setResult({ correct, newGwei })
    setCurrentGwei(newGwei)
    setWaiting(false)
    setPrediction(null)
    onComplete(correct, newStreak)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Current Gwei</p>
          <p className="tabular text-lg font-bold mono" style={{ color: 'var(--accent)' }}>
            {currentGwei != null ? currentGwei : '—'}
          </p>
        </div>
        {streak > 0 && (
          <div className="px-2 py-1 rounded-lg" style={{ background: 'rgba(245,197,66,0.15)', border: '1px solid #f5c542' }}>
            <p className="text-xs font-bold" style={{ color: '#f5c542' }}>🔥 {streak}× streak</p>
          </div>
        )}
      </div>

      {result && (
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
          style={{
            background: result.correct ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
            color: result.correct ? 'var(--success)' : 'var(--danger)',
          }}
        >
          {result.correct ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {result.correct ? 'Correct!' : 'Wrong'} — now {result.newGwei} gwei
        </div>
      )}

      {waiting ? (
        <div className="text-center py-2">
          <Clock size={16} className="mx-auto mb-1" style={{ color: 'var(--muted)' }} />
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Watching the mempool... (10s)</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { void predict('up') }}
            className="py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-95"
            style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid #4ade80', color: '#4ade80' }}
          >
            <TrendingUp size={14} /> Higher
          </button>
          <button
            onClick={() => { void predict('down') }}
            className="py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-95"
            style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid #f87171', color: '#f87171' }}
          >
            <TrendingDown size={14} /> Lower
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Liquidity Hermit ──────────────────────────────────────────────────────────
function LiquidityHermit({ earnPerMinute }: { earnPerMinute: number }) {
  const [ticks, setTicks] = useState(0)
  const [earned, setEarned] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTicks(t => t + 1)
      setEarned(e => e + earnPerMinute)
    }, 60_000) // every 60s real time
    return () => clearInterval(interval)
  }, [earnPerMinute])

  return (
    <div className="text-center py-2 space-y-1">
      <p className="text-xs" style={{ color: 'var(--muted)' }}>Idling as Liquidity Hermit</p>
      <p className="tabular text-base font-bold mono" style={{ color: 'var(--accent)' }}>
        +{earned} gCHOG
      </p>
      <p className="text-xs" style={{ color: 'var(--muted)' }}>
        {earnPerMinute} gCHOG/min • {ticks} min active
      </p>
      <div className="live-dot mx-auto" />
    </div>
  )
}

// ─── Main Panel ────────────────────────────────────────────────────────────────
type JobTab = 'validator' | 'grifter' | 'hermit'

export default function JobsPanel({ gameState, onEarn, isDegenSpiral, eventMultiplier }: Props) {
  const [activeJob, setActiveJob] = useState<JobTab>('validator')
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({})

  const inCooldown = useCallback((job: string) => {
    const until = cooldowns[job] ?? 0
    return Date.now() < until
  }, [cooldowns])

  const setCooldown = (job: string, minutes: number) => {
    setCooldowns(prev => ({ ...prev, [job]: Date.now() + minutes * 60_000 }))
  }

  const spiralMult = isDegenSpiral ? 0.4 : 1
  const totalMult = spiralMult * eventMultiplier

  const handleValidatorComplete = useCallback((score: number) => {
    const base = score * 2
    const earned = Math.round(base * totalMult * gameState.stats.incomeMultiplier)
    const newState = earnGChog(gameState, earned)
    onEarn(newState)
    toast.success(`Validated! +${earned} gCHOG`)
    setCooldown('validator', 10)
  }, [gameState, onEarn, totalMult])

  const handleGrifterComplete = useCallback((correct: boolean, streak: number) => {
    if (!correct) {
      toast.error('Wrong prediction! No earnings.')
      return
    }
    const streakBonus = streak >= 3 ? 3 : streak
    const base = 150 * (1 + streakBonus * 0.5)
    const earned = Math.round(base * totalMult * gameState.stats.incomeMultiplier)
    const newState = earnGChog(gameState, earned)
    onEarn(newState)
    toast.success(`Correct prediction! +${earned} gCHOG${streak >= 3 ? ' 🔥 Jackpot!' : ''}`)
  }, [gameState, onEarn, totalMult])

  const hermitEarnPerMin = Math.round(
    (gameState.currentZone + 1) * 5 * totalMult * gameState.stats.incomeMultiplier
  )

  const jobs: { id: JobTab; label: string; desc: string }[] = [
    { id: 'validator', label: 'Block Validator', desc: 'Click valid blocks' },
    { id: 'grifter', label: 'Gwei Grifter', desc: 'Predict gas moves' },
    { id: 'hermit', label: 'Liquidity Hermit', desc: 'Idle income' },
  ]

  return (
    <div className="glass p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold display" style={{ color: 'var(--ink)' }}>Jobs</h3>
        {isDegenSpiral && (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(248,113,113,0.15)', color: 'var(--danger)' }}>
            Degen Spiral: -60% earnings
          </span>
        )}
      </div>

      {/* Job tabs */}
      <div className="flex gap-1">
        {jobs.map(j => (
          <button
            key={j.id}
            onClick={() => setActiveJob(j.id)}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: activeJob === j.id ? 'var(--surface-strong)' : 'transparent',
              color: activeJob === j.id ? 'var(--ink)' : 'var(--muted)',
              border: activeJob === j.id ? '1px solid var(--border-strong)' : '1px solid transparent',
            }}
          >
            {j.label}
          </button>
        ))}
      </div>

      {/* Active job */}
      <div
        className="p-3 rounded-xl"
        style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
      >
        {activeJob === 'validator' && !inCooldown('validator') && (
          <BlockValidatorGame onComplete={handleValidatorComplete} />
        )}
        {activeJob === 'validator' && inCooldown('validator') && (
          <div className="text-center py-2">
            <Clock size={16} className="mx-auto mb-1" style={{ color: 'var(--muted)' }} />
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Cooldown active</p>
          </div>
        )}
        {activeJob === 'grifter' && (
          <GweiGrifterGame zoneId={gameState.currentZone} onComplete={handleGrifterComplete} />
        )}
        {activeJob === 'hermit' && (
          <LiquidityHermit earnPerMinute={hermitEarnPerMin} />
        )}
      </div>

      {eventMultiplier > 1 && (
        <p className="text-xs text-center" style={{ color: 'var(--chog-gold)' }}>
          Event bonus: {eventMultiplier}× active
        </p>
      )}
    </div>
  )
}
