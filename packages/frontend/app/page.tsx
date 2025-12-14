"use client"

import { motion } from 'framer-motion'
import { Sparkles, Palette, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import ArtCanvas from '@/components/3d/ArtCanvas'
import { GenerateArtForm } from '@/components/forms/GenerateArtForm'
import { Gallery } from '@/components/gallery/Gallery'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description: "Create unique art with cutting-edge AI models"
  },
  {
    icon: Palette,
    title: "Style Blending",
    description: "Mix and match artistic styles for unique creations"
  },
  {
    icon: Zap,
    title: "Instant Minting",
    description: "Mint directly to Polygon with gas-efficient lazy minting"
  },
  {
    icon: Shield,
    title: "Royalties Protection",
    description: "Earn 5% royalties on all secondary sales"
  }
]

export default function Home() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600" />
            <span className="text-2xl font-bold">AI Art Studio</span>
          </motion.div>
          
          <div className="flex items-center gap-4">
            {isConnected ? (
              <>
                <span className="text-sm bg-white/10 px-3 py-1 rounded-full">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <Button variant="ghost" onClick={() => disconnect()}>
                  Disconnect
                </Button>
              </>
            ) : (
              <Button 
                variant="gradient" 
                onClick={() => connect({ connector: injected() })}
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Create <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI-Powered</span> NFT Art
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Generate stunning digital art with AI, mint directly on Polygon Amoy, 
              and earn royalties from your creations.
            </p>
            <div className="flex gap-4">
              <Button size="lg" variant="gradient">
                Start Creating
              </Button>
              <Button size="lg" variant="outline">
                Explore Gallery
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-30" />
            <ArtCanvas imageUrl="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&auto=format&fit=crop" />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Everything you need to create, mint, and manage your AI-generated NFT art
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all"
            >
              <feature.icon className="h-12 w-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Art Generation Form */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <GenerateArtForm />
        </div>
      </section>

      {/* Gallery */}
      <section className="container mx-auto px-6 py-20">
        <Gallery />
      </section>
    </div>
  )
}