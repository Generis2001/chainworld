/**
 * wagmi configuration — Chain World
 * Target: Monad Testnet (chainId 10143)
 */

import { http, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { defineChain } from 'viem'
import { injected } from 'wagmi/connectors'
import { registerChain } from './tracing'

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'MonadExplorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
})

// Pre-register chain RPC URLs so trace events show correct chain names immediately
registerChain(monadTestnet.id, monadTestnet.rpcUrls.default.http[0])
registerChain(mainnet.id, mainnet.rpcUrls.default.http[0])

export const config = createConfig({
  chains: [monadTestnet, mainnet],
  connectors: [injected()],
  transports: {
    [monadTestnet.id]: http('https://testnet-rpc.monad.xyz'),
    [mainnet.id]: http(),
  },
})
