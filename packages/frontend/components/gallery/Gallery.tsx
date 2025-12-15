"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Grid3x3, List, Heart, Share2, Eye, Sparkles, TrendingUp, Clock, Palette, Layers } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useAccount, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS, aiArtNFTAbi } from '@/lib/web3'
import Image from 'next/image'

// Mock data 
const MOCK_ARTWORKS = [
  {
    id: 1,
    title: "Neon Dreams",
    artist: "0x8f1...c3d2",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&auto=format&fit=crop",
    price: "0.5 MATIC",
    likes: 142,
    views: 1500,
    style: "Cyberpunk",
    createdAt: "2 days ago",
    royalty: "5%",
    tokenId: 1,
    prompt: "A futuristic city with neon lights and flying cars",
    attributes: [
      { trait_type: "Style", value: "Cyberpunk" },
      { trait_type: "Mood", value: "Futuristic" },
      { trait_type: "Colors", value: "Neon" }
    ]
  },
  {
    id: 2,
    title: "Cosmic Waves",
    artist: "0x5a9...b8e1",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop",
    price: "1.2 MATIC",
    likes: 89,
    views: 890,
    style: "Abstract",
    createdAt: "1 week ago",
    royalty: "5%",
    tokenId: 2,
    prompt: "Abstract representation of cosmic energy waves",
    attributes: [
      { trait_type: "Style", value: "Abstract" },
      { trait_type: "Mood", value: "Cosmic" },
      { trait_type: "Colors", value: "Blue" }
    ]
  },
  {
    id: 3,
    title: "Forest Guardian",
    artist: "0x3d2...f7c4",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format&fit=crop",
    price: "0.8 MATIC",
    likes: 234,
    views: 2100,
    style: "Fantasy",
    createdAt: "3 days ago",
    royalty: "5%",
    tokenId: 3,
    prompt: "Magical forest spirit watching over ancient woods",
    attributes: [
      { trait_type: "Style", value: "Fantasy" },
      { trait_type: "Mood", value: "Mystical" },
      { trait_type: "Colors", value: "Green" }
    ]
  },
  {
    id: 4,
    title: "Digital Rain",
    artist: "0x9b1...e5d3",
    image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&auto=format&fit=crop",
    price: "0.3 MATIC",
    likes: 67,
    views: 750,
    style: "Glitch",
    createdAt: "5 hours ago",
    royalty: "5%",
    tokenId: 4,
    prompt: "Matrix-style digital rain with green code",
    attributes: [
      { trait_type: "Style", value: "Glitch" },
      { trait_type: "Mood", value: "Digital" },
      { trait_type: "Colors", value: "Green" }
    ]
  },
  {
    id: 5,
    title: "Sunset Symphony",
    artist: "0x2c4...a9f8",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop",
    price: "1.5 MATIC",
    likes: 312,
    views: 3200,
    style: "Impressionist",
    createdAt: "2 weeks ago",
    royalty: "5%",
    tokenId: 5,
    prompt: "Colorful sunset over ocean with impressionist brush strokes",
    attributes: [
      { trait_type: "Style", value: "Impressionist" },
      { trait_type: "Mood", value: "Peaceful" },
      { trait_type: "Colors", value: "Warm" }
    ]
  },
  {
    id: 6,
    title: "Quantum Realm",
    artist: "0x7e3...d1a6",
    image: "https://images.unsplash.com/photo-1518834103328-6340cce5a14c?w=800&auto=format&fit=crop",
    price: "2.1 MATIC",
    likes: 421,
    views: 4500,
    style: "Abstract",
    createdAt: "1 month ago",
    royalty: "5%",
    tokenId: 6,
    prompt: "Visualization of quantum particles and energy fields",
    attributes: [
      { trait_type: "Style", value: "Abstract" },
      { trait_type: "Mood", value: "Scientific" },
      { trait_type: "Colors", value: "Purple" }
    ]
  }
]

const STYLE_FILTERS = [
  "All",
  "Cyberpunk",
  "Abstract",
  "Fantasy",
  "Realistic",
  "Anime",
  "Impressionist",
  "Glitch",
  "Pixel Art"
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest", icon: Clock },
  { value: "trending", label: "Trending", icon: TrendingUp },
  { value: "popular", label: "Most Liked", icon: Heart },
  { value: "price-high", label: "Price: High to Low" },
  { value: "price-low", label: "Price: Low to High" }
]

export function Gallery() {
  const [artworks, setArtworks] = useState(MOCK_ARTWORKS)
  const [selectedStyle, setSelectedStyle] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedArt, setSelectedArt] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const { address } = useAccount()
  
  // Fetch actual NFTs from contract
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: aiArtNFTAbi,
    functionName: 'totalSupply',
  })

  // Filter artworks
  const filteredArtworks = artworks.filter(art => {
    const matchesStyle = selectedStyle === "All" || art.style === selectedStyle
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         art.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         art.artist.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStyle && matchesSearch
  })

  // Sort artworks
  const sortedArtworks = [...filteredArtworks].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "trending":
        return b.views - a.views
      case "popular":
        return b.likes - a.likes
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price)
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price)
      default:
        return 0
    }
  })

  const handleLike = async (artId: number) => {
    // Implement like functionality
    console.log('Liked artwork:', artId)
  }

  const handleShare = async (art: any) => {
    if (navigator.share) {
      await navigator.share({
        title: art.title,
        text: `Check out this AI-generated artwork: ${art.prompt}`,
        url: window.location.href,
      })
    }
  }

  const openArtDetail = (art: any) => {
    setSelectedArt(art)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-4xl font-bold mb-2">Explore AI Art</h2>
          <p className="text-gray-400">
            Discover {filteredArtworks.length} unique AI-generated artworks
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search artworks, artists, or prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
            />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid3x3 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="space-y-6">
        {/* Style Filters */}
        <div className="flex flex-wrap gap-2">
          {STYLE_FILTERS.map((style) => (
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

        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <Tabs defaultValue="newest" onValueChange={setSortBy}>
            <TabsList className="bg-white/5 border border-white/10">
              {SORT_OPTIONS.map((option) => (
                <TabsTrigger
                  key={option.value}
                  value={option.value}
                  className="data-[state=active]:bg-purple-600"
                >
                  {option.icon && <option.icon className="h-3 w-3 mr-2" />}
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Filter className="h-4 w-4" />
            <span>Filtered by: {selectedStyle}</span>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <AnimatePresence>
        <motion.div
          layout
          className={`grid ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          } gap-6`}
        >
          {sortedArtworks.map((art, index) => (
            <motion.div
              key={art.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8 }}
            >
              <ArtCard
                art={art}
                viewMode={viewMode}
                onLike={handleLike}
                onShare={handleShare}
                onViewDetail={openArtDetail}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {sortedArtworks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/5 mb-6">
            <Palette className="h-12 w-12 text-gray-500" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">No artworks found</h3>
          <p className="text-gray-400 mb-6">
            Try adjusting your filters or create the first artwork!
          </p>
          <Button variant="gradient">
            <Sparkles className="mr-2 h-4 w-4" />
            Create First Artwork
          </Button>
        </motion.div>
      )}

      {/* Art Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedArt && (
          <ArtDetailModal
            art={selectedArt}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onLike={handleLike}
            onShare={handleShare}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Art Card Component
function ArtCard({ 
  art, 
  viewMode,
  onLike,
  onShare,
  onViewDetail 
}: { 
  art: any
  viewMode: "grid" | "list"
  onLike: (id: number) => void
  onShare: (art: any) => void
  onViewDetail: (art: any) => void
}) {
  return (
    <Card className="group bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all overflow-hidden">
      <CardContent className="p-0">
        {/* Image Container */}
        <div 
          className={`relative cursor-pointer ${
            viewMode === "grid" ? "aspect-square" : "h-48"
          }`}
          onClick={() => onViewDetail(art)}
        >
          <Image
            src={art.image}
            alt={art.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-4 left-4 right-4">
              <Button
                variant="gradient"
                size="sm"
                className="w-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
              >
                View Details
              </Button>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="secondary" className="backdrop-blur-sm">
              {art.style}
            </Badge>
            <Badge variant="outline" className="backdrop-blur-sm">
              {art.royalty} Royalty
            </Badge>
          </div>

          {/* Stats */}
          <div className="absolute top-4 right-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onLike(art.id)
              }}
              className="flex items-center gap-1 text-white hover:text-pink-500 transition-colors"
            >
              <Heart className="h-4 w-4" />
              <span className="text-sm">{art.likes}</span>
            </button>
            <div className="flex items-center gap-1 text-white">
              <Eye className="h-4 w-4" />
              <span className="text-sm">{art.views}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-lg truncate">{art.title}</h3>
              <p className="text-sm text-gray-400 truncate">
                by {art.artist}
              </p>
            </div>
            <span className="font-bold text-purple-400">{art.price}</span>
          </div>

          {viewMode === "list" && (
            <p className="text-sm text-gray-300 line-clamp-2 mb-3">
              {art.prompt}
            </p>
          )}

          <div className="flex items-center justify-between text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {art.createdAt}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onLike(art.id)
                }}
                className="hover:text-pink-500 transition-colors"
              >
                <Heart className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onShare(art)
                }}
                className="hover:text-blue-500 transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Art Detail Modal Component
function ArtDetailModal({ 
  art, 
  isOpen, 
  onClose, 
  onLike, 
  onShare 
}: { 
  art: any
  isOpen: boolean
  onClose: () => void
  onLike: (id: number) => void
  onShare: (art: any) => void
}) {
  const [currentImage, setCurrentImage] = useState(art.image)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(art.likes)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
    onLike(art.id)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div 
          className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid lg:grid-cols-2 h-full">
            {/* Image Side */}
            <div className="relative h-96 lg:h-auto">
              <Image
                src={currentImage}
                alt={art.title}
                fill
                className="object-cover"
                sizes="50vw"
              />
              
              {/* Image Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="icon"
                  variant="glass"
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                </Button>
                <Button
                  size="icon"
                  variant="glass"
                  onClick={() => onShare(art)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="glass"
                  onClick={onClose}
                >
                  ✕
                </Button>
              </div>

              {/* Style Badge */}
              <div className="absolute bottom-4 left-4">
                <Badge className="text-lg py-2 px-4">
                  <Palette className="mr-2 h-4 w-4" />
                  {art.style}
                </Badge>
              </div>
            </div>

            {/* Info Side */}
            <div className="p-8 overflow-y-auto">
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-3xl font-bold mb-2">{art.title}</h2>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600" />
                      <div>
                        <p className="font-medium">Artist</p>
                        <p className="text-sm text-gray-400">{art.artist}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-400">{art.price}</p>
                      <p className="text-sm text-gray-400">{art.royalty} Royalty</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/10">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-pink-500">
                      <Heart className="h-5 w-5" />
                      <span className="text-2xl font-bold">{likeCount}</span>
                    </div>
                    <p className="text-sm text-gray-400">Likes</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-blue-500">
                      <Eye className="h-5 w-5" />
                      <span className="text-2xl font-bold">{art.views}</span>
                    </div>
                    <p className="text-sm text-gray-400">Views</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-green-500">
                      <Layers className="h-5 w-5" />
                      <span className="text-2xl font-bold">{art.tokenId}</span>
                    </div>
                    <p className="text-sm text-gray-400">Token ID</p>
                  </div>
                </div>

                {/* Prompt */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">AI Prompt</h3>
                  <p className="text-gray-300 bg-white/5 rounded-xl p-4">
                    {art.prompt}
                  </p>
                </div>

                {/* Attributes */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Attributes</h3>
                  <div className="flex flex-wrap gap-2">
                    {art.attributes.map((attr: any, index: number) => (
                      <div
                        key={index}
                        className="bg-white/5 rounded-lg px-4 py-2 border border-white/10"
                      >
                        <p className="text-sm text-gray-400">{attr.trait_type}</p>
                        <p className="font-medium">{attr.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-white/10">
                  <div className="flex gap-4">
                    <Button 
                      variant="gradient" 
                      size="lg"
                      className="flex-1"
                      onClick={() => console.log('Buy clicked')}
                    >
                      Buy Now
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="flex-1"
                      onClick={() => console.log('Make offer clicked')}
                    >
                      Make Offer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}