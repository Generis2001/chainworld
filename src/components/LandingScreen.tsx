// Chain World — Landing / Connect Screen

import { ConnectKitButton } from 'connectkit'
import { useAccount, useSwitchChain } from 'wagmi'
import { Globe, AlertTriangle } from 'lucide-react'
import { MONAD_TESTNET_ID } from '../hooks/useChogNFT'

interface Props {
  hasChog: boolean
  isLoading: boolean
  ownsChog: boolean
}

export default function LandingScreen({ isLoading, ownsChog }: Props) {
  const { isConnected, chainId } = useAccount()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const isWrongChain = isConnected && chainId !== MONAD_TESTNET_ID

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg-gradient)' }}
    >
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Globe size={36} style={{ color: 'var(--accent)' }} />
          <h1
            className="display text-5xl font-bold"
            style={{ color: 'var(--ink)', letterSpacing: '-0.04em' }}
          >
            Chain World
          </h1>
        </div>
        <p className="text-base" style={{ color: 'var(--muted)' }}>
          A blockchain life simulator powered by Chog NFTs
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--subtle)' }}>
          Your Chog = Your Character. Live costs tied to real blockchain gas.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-3 gap-3 max-w-sm w-full mb-8">
        {[
          { title: 'NFT Identity', desc: 'Your Chog traits build your character' },
          { title: 'Live Gas Costs', desc: 'Cost of living = real-time gwei' },
          { title: 'Earn gCHOG', desc: 'Jobs, quests, and events' },
        ].map(f => (
          <div
            key={f.title}
            className="glass p-3 text-center"
          >
            <p
              className="text-xs font-semibold mb-1"
              style={{ color: 'var(--ink)' }}
            >
              {f.title}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.4 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Connect / chain warning / no NFT */}
      <div className="w-full max-w-xs space-y-3">
        {!isConnected ? (
          <div className="flex flex-col items-center gap-3">
            <ConnectKitButton label="Connect Wallet to Enter" />
            <p className="text-xs text-center" style={{ color: 'var(--subtle)' }}>
              Requires a Chog Genesis NFT on Monad Testnet
            </p>
          </div>
        ) : isWrongChain ? (
          <div className="space-y-3">
            <div
              className="flex items-start gap-2 p-3 rounded-xl"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}
            >
              <AlertTriangle size={16} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>Wrong Network</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  Chain World runs on Monad Testnet. Switch to continue.
                </p>
              </div>
            </div>
            <button
              onClick={() => switchChain({ chainId: MONAD_TESTNET_ID })}
              disabled={isSwitching}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity"
              style={{ background: 'var(--accent)', color: '#0a0f1e', opacity: isSwitching ? 0.6 : 1 }}
            >
              {isSwitching ? 'Switching...' : 'Switch to Monad Testnet'}
            </button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-4">
            <div
              className="w-6 h-6 border-2 rounded-full mx-auto mb-2 animate-spin"
              style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
            />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Checking your Chog NFT...</p>
          </div>
        ) : !ownsChog ? (
          <div
            className="p-4 rounded-xl text-center space-y-2"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)' }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>
              No Chog Genesis NFT Found
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
              A Chog Genesis NFT on Monad Testnet is required to enter Chain World.
              The NFT determines your character, home, and life standard.
            </p>
            <a
              href="https://testnet.monadexplorer.com/address/0x32A325b0640594377D0708Ca9081c93da95e1908"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline"
              style={{ color: 'var(--accent)' }}
            >
              View Chog Contract on Monad Testnet
            </a>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 p-3 rounded-xl"
            style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)' }}
          >
            <div className="live-dot" />
            <p className="text-sm font-medium" style={{ color: 'var(--success)' }}>
              Chog NFT detected — loading your world...
            </p>
          </div>
        )}
      </div>

      {/* Hackathon badge */}
      <div className="mt-8 text-center">
        <p className="text-xs" style={{ color: 'var(--subtle)' }}>
          Chogathon 2026 Entry
        </p>
      </div>
    </div>
  )
}
