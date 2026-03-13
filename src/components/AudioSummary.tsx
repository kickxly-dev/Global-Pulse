'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Headphones, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, RotateCcw, FastForward, Rewind } from 'lucide-react'

interface AudioSummaryProps {
  article?: {
    title: string
    content: string
    source: string
  }
}

export default function AudioSummary({ article }: AudioSummaryProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(180) // 3 minutes
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [audioReady, setAudioReady] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isPlaying && currentTime < duration) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => Math.min(prev + speed, duration))
      }, 1000)
    } else if (currentTime >= duration) {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, speed, duration])

  const generateAudio = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setAudioReady(true)
    }, 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    setCurrentTime(percent * duration)
  }

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]

  return (
    <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-violet-400" />
          <h3 className="font-semibold">Audio Summary</h3>
        </div>
        <span className="text-xs text-white/40">AI-generated</span>
      </div>

      {/* Article Preview */}
      {article && (
        <div className="p-3 bg-white/5 rounded-lg mb-4">
          <span className="text-xs text-violet-400">Generating audio for:</span>
          <h4 className="text-sm font-medium mt-1 line-clamp-2">{article.title}</h4>
        </div>
      )}

      {/* Generate Button */}
      {!audioReady && (
        <button
          onClick={generateAudio}
          disabled={generating || !article}
          className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              Generating audio...
            </>
          ) : (
            <>
              <Headphones className="w-4 h-4" />
              Generate Audio Summary
            </>
          )}
        </button>
      )}

      {/* Audio Player */}
      <AnimatePresence>
        {audioReady && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Progress Bar */}
            <div 
              className="h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer"
              onClick={handleSeek}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            {/* Time Display */}
            <div className="flex items-center justify-between text-xs text-white/40">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentTime(Math.max(0, currentTime - 15))}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Rewind className="w-4 h-4 text-white/60" />
              </button>
              <button
                onClick={() => setCurrentTime(0)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <SkipBack className="w-4 h-4 text-white/60" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-4 bg-violet-500 rounded-full hover:bg-violet-400 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" />
                )}
              </button>
              <button
                onClick={() => setCurrentTime(duration)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <SkipForward className="w-4 h-4 text-white/60" />
              </button>
              <button
                onClick={() => setCurrentTime(Math.min(duration, currentTime + 15))}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FastForward className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Speed & Volume */}
            <div className="flex items-center justify-between">
              {/* Speed */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">Speed:</span>
                <div className="flex gap-1">
                  {speedOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        speed === s
                          ? 'bg-violet-500/20 text-violet-400'
                          : 'bg-white/5 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-white/40" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white/40" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseInt(e.target.value))
                    setIsMuted(false)
                  }}
                  className="w-20 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Transcript */}
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-xs text-violet-400 mb-2">Live Transcript</div>
              <p className="text-xs text-white/60 italic">
                "This is a simulated audio summary of the article. In a production environment, 
                this would use text-to-speech AI to generate actual audio from the article content..."
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
