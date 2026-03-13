'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Video, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Radio, Tv } from 'lucide-react'

const liveChannels = [
  { id: '1', name: 'CNN International', logo: '🔴', viewers: '125K', category: 'World News' },
  { id: '2', name: 'BBC World', logo: '🟠', viewers: '98K', category: 'World News' },
  { id: '3', name: 'Bloomberg TV', logo: '🟢', viewers: '67K', category: 'Business' },
  { id: '4', name: 'ESPN News', logo: '🔵', viewers: '89K', category: 'Sports' },
  { id: '5', name: 'TechCrunch', logo: '🟣', viewers: '45K', category: 'Technology' },
]

export default function LiveVideoSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState(liveChannels[0])

  return (
    <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-red-400" />
          <h3 className="font-semibold">Live News Streams</h3>
          <span className="relative flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        </div>
      </div>

      {/* Main Video Player */}
      <div className={`relative bg-black rounded-xl overflow-hidden mb-4 ${isFullscreen ? 'fixed inset-0 z-[100] rounded-none' : 'aspect-video'}`}>
        {/* Placeholder Video */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
          <motion.div
            animate={{ scale: isPlaying ? [1, 1.02, 1] : 1 }}
            transition={{ repeat: isPlaying ? Infinity : 0, duration: 2 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">{selectedChannel.logo}</div>
            <p className="text-white/60 text-sm">{selectedChannel.name}</p>
            <p className="text-white/40 text-xs">{selectedChannel.category}</p>
          </motion.div>
        </div>

        {/* Live Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </span>
          <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white/80 text-xs rounded">
            {selectedChannel.viewers} watching
          </span>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-white/40" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Channel List */}
      <div className="space-y-2">
        <p className="text-xs text-white/40 mb-2">Available Channels</p>
        {liveChannels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => setSelectedChannel(channel)}
            className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${
              selectedChannel.id === channel.id 
                ? 'bg-red-500/20 border border-red-500/30' 
                : 'bg-white/5 hover:bg-white/10 border border-transparent'
            }`}
          >
            <span className="text-xl">{channel.logo}</span>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">{channel.name}</p>
              <p className="text-xs text-white/40">{channel.category}</p>
            </div>
            <span className="text-xs text-white/40">{channel.viewers}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
