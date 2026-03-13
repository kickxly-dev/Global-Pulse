'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Radio, List } from 'lucide-react'

const podcasts = [
  {
    id: '1',
    title: 'Morning News Brief',
    duration: '12:45',
    progress: 45,
    host: 'Sarah Chen',
    category: 'Daily Brief',
  },
  {
    id: '2', 
    title: 'Tech Today',
    duration: '24:30',
    progress: 0,
    host: 'Mike Johnson',
    category: 'Technology',
  },
  {
    id: '3',
    title: 'World Watch',
    duration: '18:20',
    progress: 78,
    host: 'Emma Wilson',
    category: 'World News',
  },
]

export default function NewsPodcast() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPodcast, setCurrentPodcast] = useState(0)
  const [progress, setProgress] = useState(podcasts[0].progress)
  const [isMuted, setIsMuted] = useState(false)
  const [showList, setShowList] = useState(false)

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            handleNext()
            return 0
          }
          return prev + 0.5
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [isPlaying])

  const handleNext = () => {
    setCurrentPodcast(prev => (prev + 1) % podcasts.length)
    setProgress(0)
  }

  const handlePrev = () => {
    setCurrentPodcast(prev => (prev - 1 + podcasts.length) % podcasts.length)
    setProgress(0)
  }

  const podcast = podcasts[currentPodcast]

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Radio className="w-4 h-4 text-purple-400" />
        <h3 className="font-semibold">News Podcasts</h3>
        <button 
          onClick={() => setShowList(!showList)}
          className="ml-auto p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <List className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Now Playing */}
      <div className="bg-black/30 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-purple-400 font-medium">{podcast.category}</span>
          <span className="text-xs text-white/40">{podcast.duration}</span>
        </div>
        <h4 className="font-medium mb-1">{podcast.title}</h4>
        <p className="text-xs text-white/40">by {podcast.host}</p>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-white/30">
            <span>{Math.floor(progress * 0.12)}:{Math.floor((progress * 7.5) % 60).toString().padStart(2, '0')}</span>
            <span>{podcast.duration}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button onClick={handlePrev} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <SkipBack className="w-5 h-5 text-white/60" />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition-opacity"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button onClick={handleNext} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <SkipForward className="w-5 h-5 text-white/60" />
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            {isMuted ? <VolumeX className="w-5 h-5 text-white/40" /> : <Volume2 className="w-5 h-5 text-white/60" />}
          </button>
        </div>
      </div>

      {/* Podcast List */}
      <AnimatePresence>
        {showList && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2"
          >
            {podcasts.map((p, i) => (
              <button
                key={p.id}
                onClick={() => { setCurrentPodcast(i); setProgress(p.progress); }}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  i === currentPodcast 
                    ? 'bg-purple-500/20 border border-purple-500/30' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{p.title}</span>
                  <span className="text-xs text-white/40">{p.duration}</span>
                </div>
                <span className="text-xs text-white/40">{p.host}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
