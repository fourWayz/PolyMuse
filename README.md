# 🎨 Polymuse - AI Art NFT Studio

Polymuse is a cutting-edge decentralized application (DApp) that allows users to generate AI-powered art and mint it directly as NFTs on the Polygon Amoy testnet. Built with modern web3 technologies, Polymuse combines artificial intelligence with blockchain to create a seamless art creation and collection experience.

![Polymuse Banner](https://images.unsplash.com/photo-1543857778-c4a1a569e388?w=1920&auto=format&fit=crop)

## ✨ Features

### 🎨 AI Art Generation
- **Prompt-to-Art**: Generate unique artworks using Stable Diffusion via Hugging Face
- **Style Blending**: Mix multiple artistic styles for unique creations
- **Remix Generation**: Create variations of existing artworks
- **Multiple AI Models**: Support for different AI art generation models

### 🔗 Web3 Integration
- **Polygon Amoy**: Gas-efficient NFT minting on Polygon testnet
- **Lazy Minting**: Save gas with on-demand NFT creation
- **Royalty Support**: 5% royalties on secondary sales via ERC2981
- **IPFS Storage**: Decentralized metadata and image storage
- **On-chain Metadata**: Immutable art information stored on blockchain

### 🖼️ Gallery & Marketplace
- **Modern Gallery**: 3D interactive gallery with multiple view modes
- **Advanced Filtering**: Filter by style, artist, and attributes
- **Real-time Updates**: Live updates of new mints and transactions
- **Art Details**: Comprehensive artwork information and attributes
- **Share Functionality**: Share artworks across social platforms

### 🎯 User Experience
- **Responsive Design**: Mobile-first, fully responsive interface
- **Glass Morphism**: Modern UI with blur effects and gradients
- **3D Interactions**: Immersive 3D art previews using Three.js
- **Smooth Animations**: Framer Motion for fluid transitions
- **Wallet Integration**: Seamless wallet connection with WalletConnect

## 🏗️ Tech Stack

### Smart Contracts
- **Solidity 0.8.23**: Latest stable version with security features
- **Foundry**: Modern smart contract development framework
- **OpenZeppelin**: Battle-tested contract libraries
- **Polygon Amoy**: Ethereum-compatible testnet for development

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Wagmi & Viem**: Modern Ethereum libraries
- **Framer Motion**: Production-ready motion library
- **React Three Fiber**: 3D visualization library
- **Radix UI**: Accessible UI component primitives

### Backend & Storage
- **IPFS**: Decentralized file storage
- **Hugging Face**: AI model inference API
- **Next.js API Routes**: Serverless functions for AI generation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Foundry
- MetaMask or compatible wallet
- Hugging Face API token
- IPFS node (or Infura IPFS)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/fourWayz/polymuse.git
cd polymuse
```

2. **Install dependencies**
```bash
# Install frontend dependencies
cd packages/frontend
npm install

# Install contract dependencies
cd ../contracts
forge install
```

3. **Set up environment variables**
```bash
# Create .env files
cp .env.example .env
```

Configure your environment variables:
```env
# Polygon Amoy RPC
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology

# Contract Address
NEXT_PUBLIC_CONTRACT_ADDRESS=

# IPFS Configuration
IPFS_INFURA_PROJECT_ID=
IPFS_INFURA_PROJECT_SECRET=

# AI Services
HUGGING_FACE_TOKEN=
OPENAI_API_KEY=

# WalletConnect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=

# Deployment
PRIVATE_KEY=
```

4. **Deploy smart contracts**
```bash
cd packages/contracts
forge build
forge script script/Deploy.s.sol --rpc-url https://rpc-amoy.polygon.technology --broadcast --verify
```

5. **Start the development server**
```bash
cd packages/frontend
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📱 Usage Guide

### 1. Connect Wallet
- Click "Connect Wallet" in the top right corner
- Select your preferred wallet (MetaMask, Coinbase Wallet, etc.)
- Switch to Polygon Amoy testnet

### 2. Get Test MATIC
- Visit the [Polygon Faucet](https://faucet.polygon.technology/)
- Request test MATIC for Amoy testnet
- Wait for confirmation (usually 1-2 minutes)

### 3. Create AI Art
1. Navigate to the "Create" section
2. Enter your art prompt (e.g., "A majestic dragon over neon city")
3. Select an artistic style (Cyberpunk, Abstract, Impressionist, etc.)
4. Click "Generate & Mint NFT"
5. Approve the transaction in your wallet
6. Wait for AI generation (typically 30-60 seconds)
7. Your NFT will appear in the gallery once minted

### 4. Explore Gallery
- Browse all generated artworks
- Filter by style, artist, or attributes
- View detailed information about each piece
- Like and share your favorite artworks
- Purchase artworks from other creators

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


<p align="center">
  Made with ❤️ by the Polymuse<br>
  Empowering artists with AI and blockchain technology
</p>