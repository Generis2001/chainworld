// Chain World — Main App Entry

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useChogNFT } from './hooks/useChogNFT'
import { useChogTokenBalance } from './hooks/useChogBalance'
import { loadGameState, createNewGameState, saveGameState } from './game/gameEngine'
import type { GameState } from './game/types'
import LandingScreen from './components/LandingScreen'
import GameHUD from './components/GameHUD'

export default function App() {
  const { isConnected } = useAccount()
  const { ownsChog, tokenId, metadata, isLoading, address } = useChogNFT()
  const { badgeTier } = useChogTokenBalance()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [gameReady, setGameReady] = useState(false)

  // Bootstrap game state once NFT is loaded
  useEffect(() => {
    if (!ownsChog || !tokenId || !metadata || !address) {
      queueMicrotask(() => {
        setGameState(null)
        setGameReady(false)
      })
      return
    }

    // Try to load existing save
    const existing = loadGameState(address, tokenId)
    if (existing) {
      queueMicrotask(() => {
        setGameState(existing)
        setGameReady(true)
      })
      return
    }

    // First time — create new state
    const traits = metadata.attributes ?? []
    const newState = createNewGameState(address, tokenId, traits, badgeTier)
    saveGameState(newState)
    queueMicrotask(() => {
      setGameState(newState)
      setGameReady(true)
    })
  }, [ownsChog, tokenId, metadata, address, badgeTier])

  const handleStateChange = (newState: GameState) => {
    setGameState(newState)
  }

  // Show landing when not connected, no NFT, or still loading
  const showLanding = !isConnected || isLoading || !ownsChog || !gameReady

  return (
    <>
      {showLanding ? (
        <LandingScreen
          hasChog={ownsChog}
          isLoading={isLoading}
          ownsChog={ownsChog}
        />
      ) : gameState ? (
        <GameHUD
          gameState={gameState}
          onStateChange={handleStateChange}
        />
      ) : null}
    </>
  )
}
