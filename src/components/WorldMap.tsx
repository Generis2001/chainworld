// Chain World — 6x6 World Map (lot grid)

import { useReadContract } from 'wagmi'
import { CHAIN_WORLD_REGISTRY_ABI } from '../contracts/chainWorldRegistryAbi'
import type { GameState } from '../game/types'

const REGISTRY_ADDRESS = import.meta.env.VITE_REGISTRY_ADDRESS as `0x${string}` | undefined

const LOT_COUNT = 36 // 6x6 grid

interface Props {
  gameState: GameState
  onVisit?: (walletAddress: string) => void
}

// Single lot reader
function LotCell({
  lotId,
  isOwnLot,
  currentWallet,
  onVisit,
}: {
  lotId: number
  isOwnLot: boolean
  currentWallet: string
  onVisit?: (wallet: string) => void
}) {
  const { data } = useReadContract(
    REGISTRY_ADDRESS
      ? {
          address: REGISTRY_ADDRESS,
          abi: CHAIN_WORLD_REGISTRY_ABI,
          functionName: 'getLot',
          args: [lotId],
          chainId: 10143,
        }
      : undefined
  )

  const owner = data ? (data as [string, bigint])[0] : null
  const isEmpty =
    !owner || owner === '0x0000000000000000000000000000000000000000'
  const isMe = owner?.toLowerCase() === currentWallet.toLowerCase()

  const handleClick = () => {
    if (!isEmpty && !isMe && owner && onVisit) {
      onVisit(owner)
    }
  }

  return (
    <div
      onClick={handleClick}
      title={
        isOwnLot
          ? 'Your lot'
          : !isEmpty && owner
          ? `Visit ${owner.slice(0, 8)}...`
          : 'Empty lot'
      }
      className="aspect-square rounded-md flex items-center justify-center transition-all duration-150"
      style={{
        background: isOwnLot
          ? 'rgba(126,179,248,0.25)'
          : !isEmpty
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(255,255,255,0.03)',
        border: isOwnLot
          ? '1px solid var(--accent)'
          : !isEmpty
          ? '1px solid var(--border)'
          : '1px solid rgba(255,255,255,0.04)',
        cursor: !isEmpty && !isMe ? 'pointer' : 'default',
        boxShadow: isOwnLot ? '0 0 8px rgba(126,179,248,0.3)' : undefined,
      }}
    >
      {isOwnLot ? (
        <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
      ) : !isEmpty ? (
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: 'var(--muted)' }}
        />
      ) : null}
    </div>
  )
}

export default function WorldMap({ gameState, onVisit }: Props) {
  const lots = Array.from({ length: LOT_COUNT }, (_, i) => i)

  return (
    <div className="glass p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold display" style={{ color: 'var(--ink)' }}>
          Chog World Map
        </h3>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
            You
          </span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--muted)' }} />
            Player
          </span>
        </div>
      </div>

      {!REGISTRY_ADDRESS ? (
        <div
          className="rounded-xl p-4 text-center"
          style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            World map available after contract deployment
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-1">
          {lots.map(id => (
            <LotCell
              key={id}
              lotId={id}
              isOwnLot={gameState.registeredLot === id}
              currentWallet={gameState.walletAddress}
              onVisit={onVisit}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-center" style={{ color: 'var(--subtle)' }}>
        {REGISTRY_ADDRESS ? 'Click an occupied lot to visit' : ''}
      </p>
    </div>
  )
}
