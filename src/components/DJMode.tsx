'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, Music2, Volume2, VolumeX, Radio, Disc, Pause, Play, SkipForward } from 'lucide-react'
import { Mood } from '@/lib/aiAnalysis'

interface DJModeProps {
  globalMood: Mood
  moodScore: number
  enabled: boolean
  onToggle: () => void
}

interface Track {
  mood: Mood
  name: string
  tempo: number
  url?: string // Would contain actual audio file URL in production
}

const MOOD_TRACKS: Track[] = [
  { mood: 'happy', name: 'Uplifting News', tempo: 120 },
  { mood: 'exciting', name: 'Breaking Beat', tempo: 140 },
  { mood: 'neutral', name: 'Ambient Flow', tempo: 90 },
  { mood: 'sad', name: 'Melancholic Pulse', tempo: 70 },
  { mood: 'fearful', name: 'Tension Rising', tempo: 110 },
  { mood: 'angry', name: 'Storm Warning', tempo: 130 }
]

export default function DJMode({ globalMood, moodScore, enabled, onToggle }: DJModeProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(50)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [beatAnimation, setBeatAnimation] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)

  useEffect(() => {
    if (enabled && globalMood) {
      const track = MOOD_TRACKS.find(t => t.mood === globalMood) || MOOD_TRACKS[2]
      setCurrentTrack(track)
      
      if (isPlaying) {
        playMoodMusic(track)
      }
    } else {
      stopMusic()
    }
  }, [globalMood, enabled])

  const playMoodMusic = (track: Track) => {
    // In production, this would play actual audio files
    // For now, we'll create synthetic ambient sounds using Web Audio API
    
    if (!contextRef.current) {
      contextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const context = contextRef.current
    
    // Stop previous oscillator if exists
    if (oscillatorRef.current) {
      oscillatorRef.current.stop()
    }

    // Create oscillator for ambient sound
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()

    // Set frequency based on mood
    const baseFreq = track.mood === 'happy' ? 440 : 
                    track.mood === 'sad' ? 220 : 
                    track.mood === 'exciting' ? 523 : 
                    track.mood === 'fearful' ? 311 : 
                    track.mood === 'angry' ? 155 : 330

    oscillator.frequency.setValueAtTime(baseFreq, context.currentTime)
    oscillator.type = track.mood === 'angry' ? 'sawtooth' : 'sine'
    
    // Set volume
    gainNode.gain.setValueAtTime(volume / 1000, context.currentTime)

    // Create subtle variation
    const lfo = context.createOscillator()
    const lfoGain = context.createGain()
    lfo.frequency.setValueAtTime(0.5, context.currentTime) // Slow modulation
    lfoGain.gain.setValueAtTime(10, context.currentTime)
    
    lfo.connect(lfoGain)
    lfoGain.connect(oscillator.frequency)
    
    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    
    oscillator.start()
    lfo.start()
    
    oscillatorRef.current = oscillator

    // Trigger beat animation
    const beatInterval = 60000 / track.tempo
    const beatTimer = setInterval(() => {
      setBeatAnimation(true)
      setTimeout(() => setBeatAnimation(false), 100)
    }, beatInterval)

    return () => clearInterval(beatTimer)
  }

  const stopMusic = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop()
      oscillatorRef.current = null
    }
    setIsPlaying(false)
  }

  const togglePlayback = () => {
    if (isPlaying) {
      stopMusic()
    } else {
      setIsPlaying(true)
      if (currentTrack) {
        playMoodMusic(currentTrack)
      }
    }
  }

  const getMoodColor = (mood: Mood) => {
    switch(mood) {
      case 'happy': return 'text-green-500'
      case 'exciting': return 'text-yellow-500'
      case 'sad': return 'text-blue-500'
      case 'fearful': return 'text-purple-500'
      case 'angry': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getMoodEmoji = (mood: Mood) => {
    switch(mood) {
      case 'happy': return '😊'
      case 'exciting': return '🎉'
      case 'sad': return '😢'
      case 'fearful': return '😰'
      case 'angry': return '😠'
      default: return '😐'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="cyber-card relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          animate={{
            background: enabled ? [
              'radial-gradient(circle at 0% 50%, rgba(255,0,64,0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 100% 50%, rgba(0,212,255,0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, rgba(189,0,255,0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 0% 50%, rgba(255,0,64,0.3) 0%, transparent 50%)',
            ] : 'transparent'
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute inset-0"
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-cyber-purple animate-pulse" />
            <h3 className="text-lg font-bold font-cyber text-cyber-purple">
              Global Pulse DJ
            </h3>
          </div>
          
          <button
            onClick={onToggle}
            className={`px-3 py-1 rounded-lg border transition-all ${
              enabled 
                ? 'bg-cyber-purple/20 border-cyber-purple text-cyber-purple' 
                : 'bg-gray-800 border-gray-600 text-gray-400'
            }`}
          >
            {enabled ? 'ON AIR' : 'OFF'}
          </button>
        </div>

        {enabled && (
          <AnimatePresence>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {/* Current Mood Display */}
              <div className="mb-4 p-3 bg-cyber-dark/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 uppercase">Global Mood</span>
                  <span className="text-2xl">{getMoodEmoji(globalMood)}</span>
                </div>
                <div className={`text-xl font-bold capitalize ${getMoodColor(globalMood)}`}>
                  {globalMood}
                </div>
                <div className="mt-2 h-2 bg-cyber-dark rounded-full overflow-hidden">
                  <motion.div
                    animate={{ 
                      width: `${Math.abs(moodScore)}%`,
                      backgroundColor: moodScore > 0 ? '#00ff88' : '#ff0040'
                    }}
                    className="h-full"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Mood Score: {moodScore > 0 ? '+' : ''}{moodScore.toFixed(1)}
                </div>
              </div>

              {/* Now Playing */}
              {currentTrack && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <motion.div
                      animate={beatAnimation ? { scale: 1.2 } : { scale: 1 }}
                      transition={{ duration: 0.1 }}
                    >
                      <Disc className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''} text-cyber-blue`} />
                    </motion.div>
                    <span className="text-sm font-medium">
                      {currentTrack.name}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentTrack.tempo} BPM • Ambient Mode
                  </div>
                </div>
              )}

              {/* Playback Controls */}
              <div className="flex items-center justify-center space-x-4 mb-4">
                <button
                  onClick={() => {
                    const prevMood = MOOD_TRACKS[Math.max(0, MOOD_TRACKS.findIndex(t => t === currentTrack) - 1)]
                    setCurrentTrack(prevMood)
                  }}
                  className="p-2 rounded-lg bg-cyber-dark hover:bg-cyber-dark/70 transition-colors"
                >
                  <SkipForward className="w-4 h-4 rotate-180" />
                </button>
                
                <button
                  onClick={togglePlayback}
                  className="p-3 rounded-lg bg-cyber-purple/20 hover:bg-cyber-purple/30 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-cyber-purple" />
                  ) : (
                    <Play className="w-5 h-5 text-cyber-purple" />
                  )}
                </button>
                
                <button
                  onClick={() => {
                    const nextMood = MOOD_TRACKS[Math.min(MOOD_TRACKS.length - 1, MOOD_TRACKS.findIndex(t => t === currentTrack) + 1)]
                    setCurrentTrack(nextMood)
                  }}
                  className="p-2 rounded-lg bg-cyber-dark hover:bg-cyber-dark/70 transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <VolumeX className="w-4 h-4 text-gray-500" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="flex-1 h-1 bg-cyber-dark rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #00d4ff ${volume}%, #1a1a1a ${volume}%)`
                  }}
                />
                <Volume2 className="w-4 h-4 text-gray-500" />
              </div>

              {/* Visualizer */}
              <div className="mt-4 flex items-end justify-center space-x-1 h-12">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: isPlaying ? [
                        Math.random() * 48,
                        Math.random() * 48,
                        Math.random() * 48
                      ] : 4
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                    className="w-2 bg-gradient-to-t from-cyber-purple to-cyber-blue rounded-t"
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}
