'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX, Play, Pause, SkipBack, SkipForward } from 'lucide-react'

interface VoiceNarratorProps {
  text: string
  isOpen: boolean
  onClose: () => void
}

export default function VoiceNarrator({ text, isOpen, onClose }: VoiceNarratorProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [rate, setRate] = useState(1)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices()
        setVoices(availableVoices)
        // Prefer a natural sounding voice
        const preferredVoice = availableVoices.find(v => 
          v.name.includes('Natural') || 
          v.name.includes('Neural') || 
          v.name.includes('Enhanced')
        ) || availableVoices[0]
        setSelectedVoice(preferredVoice)
      }
      
      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      stopNarration()
    }
  }, [isOpen])

  const startNarration = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = selectedVoice
    utterance.rate = rate
    utterance.pitch = 1
    
    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onpause = () => setIsPlaying(false)
    utterance.onresume = () => setIsPlaying(true)
    
    utterance.onboundary = (event) => {
      const percent = (event.charIndex / text.length) * 100
      setProgress(percent)
    }
    
    window.speechSynthesis.speak(utterance)
  }

  const stopNarration = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      setProgress(0)
    }
  }

  const togglePlay = () => {
    if (isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause()
        setIsPlaying(false)
      }
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume()
          setIsPlaying(true)
        } else {
          startNarration()
        }
      }
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
    >
      <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyber-blue/20 rounded-lg">
              <Volume2 className="w-4 h-4 text-cyber-blue" />
            </div>
            <span className="text-sm font-medium text-white">Voice Narrator</span>
          </div>
          <button
            onClick={() => {
              stopNarration()
              onClose()
            }}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <VolumeX className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>{Math.round(progress)}%</span>
            <span>{isPlaying ? 'Playing...' : 'Ready'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => setRate(Math.max(0.5, rate - 0.25))}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          
          <button
            onClick={togglePlay}
            className="p-3 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-xl hover:shadow-lg hover:shadow-cyber-blue/30 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white" />
            )}
          </button>
          
          <button
            onClick={() => setRate(Math.min(2, rate + 0.25))}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Indicator */}
        <div className="text-center">
          <span className="text-xs text-gray-500">Speed: {rate}x</span>
        </div>

        {/* Voice Selector */}
        {voices.length > 0 && (
          <select
            value={selectedVoice?.name}
            onChange={(e) => {
              const voice = voices.find(v => v.name === e.target.value)
              setSelectedVoice(voice || null)
            }}
            className="w-full mt-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyber-blue"
          >
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        )}
      </div>
    </motion.div>
  )
}
