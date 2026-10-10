# Chain World — Project Memory

## Deployed Contracts

### ChainWorldRegistry
- **Network:** Monad Testnet (Chain ID: 10143)
- **Address:** `0x6706b660883ce7f209eb5ea61a6114a1cac41a97`
- **Explorer:** https://testnet.monadexplorer.com/address/0x6706b660883ce7f209eb5ea61a6114a1cac41a97
- **Tx Hash:** `0x423b8f7c3b32c2cf23c0bdd10bcc13afa1028f635d918e589b7cd2e2250519a8`
- **Constructor arg:** Chog NFT (testnet) `0x32A325b0640594377D0708Ca9081c93da95e1908`
- **Deployed:** 2026-10-09

## NFT Contracts
- **Chog Genesis (Testnet):** `0x32A325b0640594377D0708Ca9081c93da95e1908` — Monad Testnet
- **Chog Genesis (Mainnet):** `0xc96d31f8626c6d03fae5dcd3d61e3fb9f4a73763` — Monad Mainnet
- **$CHOG Token (Mainnet):** `0x350035555e10d9afaf1566aaebfced5ba6c27777` — Monad Mainnet

## Environment Variables
- `VITE_REGISTRY_ADDRESS` — ChainWorldRegistry contract address (written to .env)

## Architecture
- Frontend: React + Vite + Tailwind + wagmi + ConnectKit → Monad Testnet
- Game state: localStorage (keyed per wallet+tokenId)
- Smart contract: ChainWorldRegistry.sol — on-chain NFT gate + lot registration
- Gwei oracle: 5-chain eth_gasPrice fetcher (60s cache)
- Character: Derived from Chog NFT traits via tokenURI at runtime

## Build Phases Completed
1. wagmi config (Monad Testnet)
2. NFT gate (balanceOf + tokenURI + trait parser)
3. Character builder (trait→stat→CSS avatar)
4. HUD + 5 life meters + localStorage + time decay
5. ChainWorldRegistry.sol (deployed)
6. Registration flow (contract wired)
7. Gwei oracle (5-chain, 60s cache)
8. Jobs (Block Validator, Gwei Grifter, Liquidity Hermit)
9. World Map (6x6 grid, getLot reads)
10. $CHOG bonus (balanceOf + badge system)
11. Daily events (block-timestamp seeded)
