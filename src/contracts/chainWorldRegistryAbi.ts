// Chain World Registry — ABI (matches ChainWorldRegistry.sol)

export const CHAIN_WORLD_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'register',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setZone',
    inputs: [{ name: 'zoneId', type: 'uint8' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'saveMeterSnapshot',
    inputs: [
      { name: 'fundsPercent', type: 'uint8' },
      { name: 'hunger', type: 'uint8' },
      { name: 'social', type: 'uint8' },
      { name: 'rep', type: 'uint8' },
      { name: 'housing', type: 'uint8' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getLot',
    inputs: [{ name: 'lotId', type: 'uint8' }],
    outputs: [
      { name: 'owner', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPlayer',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'zone', type: 'uint8' },
      { name: 'meters', type: 'uint8[5]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isRegistered',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalRegistered',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'Registered',
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: false },
      { name: 'lotId', type: 'uint8', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ZoneMoved',
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'zoneId', type: 'uint8', indexed: false },
    ],
  },
] as const
