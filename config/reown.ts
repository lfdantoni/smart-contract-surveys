import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, type AppKitNetwork } from '@reown/appkit/networks'

// 1. Get projectId at https://cloud.reown.com
// Using a public testing ID for demonstration. In production, replace with your own.
export const projectId = 'f937665554e68d995799235342427564'

// 2. Create a metadata object
export const metadata = {
  name: 'VotoGenius',
  description: 'AI Voting App',
  url: 'https://votogenius.ai', 
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, arbitrum]

// 3. Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
})

// 4. Create AppKit
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true 
  }
})