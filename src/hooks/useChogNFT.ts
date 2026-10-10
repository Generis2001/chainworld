// Chain World — Chog NFT hook: ownership check + tokenURI + metadata fetch

import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import type { ChogMetadata } from '../game/types'

export const CHOG_CONTRACT = '0x32A325b0640594377D0708Ca9081c93da95e1908' as const
export const MONAD_TESTNET_ID = 10143

const ERC721_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenOfOwnerByIndex',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenURI',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'ownerOf',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
] as const

function resolveMetadataUri(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${uri.slice(7)}`
  }
  return uri
}

export function useChogNFT() {
  const { address, chainId } = useAccount()
  const [metadata, setMetadata] = useState<ChogMetadata | null>(null)
  const [tokenId, setTokenId] = useState<number | null>(null)
  const [metaLoading, setMetaLoading] = useState(false)
  const [metaError, setMetaError] = useState<string | null>(null)

  const isCorrectChain = chainId === MONAD_TESTNET_ID

  // 1. Read balance
  const { data: balanceData, isLoading: balanceLoading } = useReadContract({
    address: CHOG_CONTRACT,
    abi: ERC721_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: MONAD_TESTNET_ID,
    query: { enabled: !!address && isCorrectChain },
  })

  const balance = balanceData != null ? Number(balanceData) : 0
  const ownsChog = balance > 0

  // 2. Get first token ID (if owns)
  const { data: firstTokenId, isLoading: tokenIdLoading } = useReadContract({
    address: CHOG_CONTRACT,
    abi: ERC721_ABI,
    functionName: 'tokenOfOwnerByIndex',
    args: address ? [address, 0n] : undefined,
    chainId: MONAD_TESTNET_ID,
    query: { enabled: ownsChog && !!address && isCorrectChain },
  })

  // 3. Get token URI
  const resolvedTokenId = firstTokenId != null ? firstTokenId : null
  const { data: tokenURIData, isLoading: uriLoading } = useReadContract({
    address: CHOG_CONTRACT,
    abi: ERC721_ABI,
    functionName: 'tokenURI',
    args: resolvedTokenId != null ? [resolvedTokenId] : undefined,
    chainId: MONAD_TESTNET_ID,
    query: { enabled: resolvedTokenId != null },
  })

  // 4. Fetch metadata JSON
  useEffect(() => {
    if (!tokenURIData) return
    if (!resolvedTokenId) return

    // batch state updates in a microtask to avoid synchronous setState in effect
    const tid = Number(resolvedTokenId)
    queueMicrotask(() => {
      setTokenId(tid)
      setMetaLoading(true)
      setMetaError(null)
    })

    const uri = resolveMetadataUri(tokenURIData)

    fetch(uri)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((json: ChogMetadata) => {
        setMetadata(json)
        setMetaLoading(false)
      })
      .catch(err => {
        console.warn('[ChainWorld] Failed to fetch metadata:', err)
        // Fallback: create minimal metadata so game can still load
        setMetadata({
          name: `Chog #${Number(resolvedTokenId)}`,
          image: '',
          attributes: [],
        })
        setMetaError('Could not load full traits — using defaults')
        setMetaLoading(false)
      })
  }, [tokenURIData, resolvedTokenId])

  return {
    address,
    isCorrectChain,
    balance,
    ownsChog,
    tokenId,
    metadata,
    isLoading: balanceLoading || tokenIdLoading || uriLoading || metaLoading,
    metaError,
  }
}
