"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Wand2, Palette, Sparkles } from 'lucide-react'
import { useAccount, useWriteContract } from 'wagmi'
import { CONTRACT_ADDRESS, aiArtNFTAbi } from '@/lib/web3'

const STYLES = [
  "Cyberpunk",
  "Impressionist",
  "Abstract",
  "Realistic",
  "Anime",
  "Oil Painting",
  "Watercolor",
  "Pixel Art"
]

export function GenerateArtForm() {
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const handleGenerate = async () => {
    if (!prompt || !selectedStyle) return
    
    setIsGenerating(true)
    
    try {
      // Call AI generation API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style: selectedStyle })
      })
      
      const { imageUrl, cid } = await response.json()
      setGeneratedImage(imageUrl)
      
      // Mint NFT
      if (address) {
        await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: aiArtNFTAbi,
          functionName: 'mintWithPrompt',
          args: [prompt, selectedStyle],
          value: BigInt(0.01 * 10 ** 18) // 0.01 MATIC
        })
      }
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-purple-900/50">
          <Wand2 className="h-6 w-6 text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold">Generate AI Art</h2>
      </div>

      <div className="space-y-6">
        {/* Prompt Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Describe your artwork
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A majestic dragon flying over neon-lit cyberpunk city at night..."
            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Style Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">
            <Palette className="inline-block mr-2 h-4 w-4" />
            Select Style
          </label>
          <div className="flex flex-wrap gap-3">
            {STYLES.map((style) => (
              <motion.button
                key={style}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStyle(style)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  selectedStyle === style
                    ? 'bg-purple-600 border-purple-500'
                    : 'bg-white/5 border-white/10 hover:border-purple-500/50'
                }`}
              >
                {style}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          size="lg"
          variant="gradient"
          loading={isGenerating}
          onClick={handleGenerate}
          className="w-full py-6 text-lg"
          disabled={!prompt || !selectedStyle || !address}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          {address ? 'Generate & Mint NFT' : 'Connect Wallet to Generate'}
        </Button>

        {/* Generated Image Preview */}
        <AnimatePresence>
          {generatedImage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <h3 className="text-lg font-semibold mb-4">Your Generated Art</h3>
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={generatedImage}
                  alt="Generated art"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="inline-block px-3 py-1 bg-black/50 rounded-full text-sm">
                    Ready to Mint
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}