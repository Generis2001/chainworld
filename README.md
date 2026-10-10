# ChainWorld

A pixel-survival MMO built on [Monad Testnet](https://monad.xyz) — gate-kept by [Chog Genesis NFTs](https://testnet.monadexplorer.com/address/0x32A325b0640594377D0708Ca9081c93da95e1908).

## Overview

ChainWorld is a browser-based on-chain game where each Chog NFT holder can:

- 🧬 **Build a character** derived from their Chog NFT traits (strength, speed, luck, etc.)
- 🌍 **Claim a world lot** on a 6×6 on-chain grid via `ChainWorldRegistry`
- ⚡ **Run jobs** (Block Validator, Gwei Grifter, Liquidity Hermit) to earn in-game rewards
- 📊 **Track 5 life meters** (hunger, energy, morale, health, reputation) with real-time decay
- 🗺 **Explore the World Map** — see who lives where, on-chain
- 🌐 **Monitor Gwei** across 5 chains with a live oracle (60s cache)
- 🎲 **Experience daily events** seeded by block timestamp
- 💎 **Earn \ badges** for holding the mainnet token

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite 6 + Tailwind CSS v3 |
| Web3 | wagmi v2, viem v2, ConnectKit |
| Contracts | Solidity 0.8.28, Foundry, OpenZeppelin |
| Network | Monad Testnet (Chain ID: 10143) |
| Runtime | Bun |

## Deployed Contracts

| Contract | Network | Address |
|---|---|---|
| ChainWorldRegistry | Monad Testnet | [`0x6706b660883ce7f209eb5ea61a6114a1cac41a97`](https://testnet.monadexplorer.com/address/0x6706b660883ce7f209eb5ea61a6114a1cac41a97) |
| Chog Genesis NFT | Monad Testnet | `0x32A325b0640594377D0708Ca9081c93da95e1908` |
| Chog Genesis NFT | Monad Mainnet | `0xc96d31f8626c6d03fae5dcd3d61e3fb9f4a73763` |
| \ Token | Monad Mainnet | `0x350035555e10d9afaf1566aaebfced5ba6c27777` |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.1
- [Foundry](https://getfoundry.sh) (for contract work)
- A Chog Genesis NFT on Monad Testnet

### Install & Run

`\\ash
bun install
bun run dev
`\\

### Environment

Create a `.env` file:

`\\nv
VITE_REGISTRY_ADDRESS=0x6706b660883ce7f209eb5ea61a6114a1cac41a97
`\\

### Contracts

`\\ash
# Build
bun run contracts:build

# Test
bun run contracts:test
`\\

## Project Structure

`\\
chainworld/
├── contracts/              # Solidity smart contracts (Foundry)
│   └── ChainWorldRegistry.sol
├── src/
│   ├── components/         # React components (GameHUD, WorldMap, …)
│   ├── contracts/          # ABI definitions
│   ├── App.tsx
│   ├── config.ts           # wagmi / chain config
│   ├── onchain-facts.ts    # Chain metadata
│   ├── onchain-money.ts    # \ balance hook
│   └── tracing.ts
├── scripts/                # Deployment scripts (Bun)
├── lib/                    # Foundry libraries (forge-std)
├── docs/
│   └── implementation-plan.md
├── foundry.toml
└── package.json
`\\

## Build Phases

1. wagmi config (Monad Testnet)
2. NFT gate (balanceOf + tokenURI + trait parser)
3. Character builder (trait → stat → CSS avatar)
4. HUD + 5 life meters + localStorage + time decay
5. ChainWorldRegistry.sol (deployed)
6. Registration flow (contract wired)
7. Gwei oracle (5-chain, 60s cache)
8. Jobs (Block Validator, Gwei Grifter, Liquidity Hermit)
9. World Map (6×6 grid, getLot reads)
10. \ bonus (balanceOf + badge system)
11. Daily events (block-timestamp seeded)

## License

MIT
