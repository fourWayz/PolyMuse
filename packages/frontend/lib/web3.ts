import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { polygonAmoy } from 'viem/chains'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

export const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http()
})

export const walletClient = createWalletClient({
  chain: polygonAmoy,
  transport: custom(window as (any).ethereum!)
})

// Contract ABI
export const aiArtNFTAbi = [
  // ... ABI from compiled contract
] as const

// Contract address (update after deployment)
export const CONTRACT_ADDRESS = '0x...'

// Wagmi config
export const wagmiAdapter = new WagmiAdapter({
  networks: [polygonAmoy],
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  ssr: true,
})