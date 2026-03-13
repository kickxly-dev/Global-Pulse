'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Search, X } from 'lucide-react'

interface VoiceSearchProps {
  onResult: (transcript: string) => void
  onClose: () => void
}

export default function VoiceSearch({ onResult, onClose }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('')
      setTranscript(transcript)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (transcript) {
        onResult(transcript)
      }
    }

    recognition.start()
  }

  const stopListening = () => {
    setIsListening(false)
    if (transcript) {
      onResult(transcript)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md p-8 text-center"
      >
        {/* Microphone Button */}
        <motion.button
          animate={isListening ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: isListening ? Infinity : 0, duration: 0.5 }}
          onClick={isListening ? stopListening : startListening}
          className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 transition-all ${
            isListening 
              ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/30' 
              : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90'
          }`}
        >
          {isListening ? (
            <MicOff className="w-12 h-12 text-white" />
          ) : (
            <Mic className="w-12 h-12 text-white" />
          )}
        </motion.button>

        {/* Status */}
        <h3 className="text-xl font-semibold mb-2">
          {isListening ? 'Listening...' : 'Tap to speak'}
        </h3>
        <p className="text-white/40 text-sm mb-6">
          {isListening ? 'Say a topic, source, or question' : 'Search news using your voice'}
        </p>

        {/* Transcript */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 rounded-xl p-4 mb-4"
            >
              <p className="text-white/80">{transcript}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Visualizer */}
        {isListening && (
          <div className="flex items-center justify-center gap-1 h-12">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [20, 40, 20] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 0.5, 
                  delay: i * 0.1,
                  ease: 'easeInOut'
                }}
                className="w-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full"
              />
            ))}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 text-white/40 hover:text-white transition-colors"
        >
          Press ESC or click outside to close
        </button>
      </motion.div>
    </motion.div>
  )
}
