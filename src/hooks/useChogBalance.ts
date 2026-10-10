// Chain World — $CHOG token balance (Monad Mainnet, read-only)
// Determines in-game badge tier

import { useReadContract } from 'wagmi'
import { useAccount } from 'wagmi'

const CHOG_TOKEN_ADDRESS = '0x350035555e10d9afaf1566aaebfced5ba6c27777' as const
const MONAD_MAINNET_ID = 41455 // Monad Mainnet

const ERC20_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

export function useChogTokenBalance() {
  const { address } = useAccount()

  const { data, isLoading } = useReadContract({
    address: CHOG_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: MONAD_MAINNET_ID,
    query: { enabled: !!address },
  })

  const rawBalance = data ? BigInt(data) : 0n
  // $CHOG is 18 decimals
  const balance = Number(rawBalance / BigInt(1e15)) / 1000 // display in whole tokens

  const badgeTier =
    balance >= 1_000_000 ? 4
    : balance >= 100_000 ? 3
    : balance >= 10_000 ? 2
    : balance >= 1_000 ? 1
    : 0

  const badgeLabel =
    badgeTier === 4 ? 'Diamond Whale'
    : badgeTier === 3 ? 'Gold Holder'
    : badgeTier === 2 ? 'Silver Holder'
    : badgeTier === 1 ? '$CHOG Holder'
    : null

  const badgeBonus =
    badgeTier >= 4 ? 'All zones unlocked, housing +1, 2× start funds'
    : badgeTier >= 3 ? 'Whale Zone housing, +50 Reputation'
    : badgeTier >= 2 ? 'Gwei Grifter unlocked, Silver badge'
    : badgeTier >= 1 ? '+10 starting Reputation'
    : null

  return {
    balance,
    badgeTier,
    badgeLabel,
    badgeBonus,
    isLoading,
  }
}
