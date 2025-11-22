import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, type AppKitNetwork } from '@reown/appkit/networks'

// 1. Get projectId at https://cloud.reown.com
// Using a public testing ID for demonstration. In production, replace with your own.
export const projectId = '34e72eb2a845abb5d7d0f041f6cd8125'

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
  allWallets: 'HIDE',
  enableWalletConnect: false,
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96' // MetaMask
  ],
  excludeWalletIds: [
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Ledger Live
    'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
    '163d2cf19babf05eb8962e9748f9ebe613ed52ebf9c8107c9a0f104bfcf161b3'  // WalletConnect
  ],
  features: {
    email: false,
    socials: false,
    emailShowWallets: false,
    allWallets: false
  }
})