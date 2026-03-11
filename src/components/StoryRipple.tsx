'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface RippleProps {
  x: number
  y: number
  color?: string
}

export function StoryRipple({ x, y, color = 'cyber-blue' }: RippleProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 1 }}
      animate={{ 
        scale: [0, 1, 2, 3],
        opacity: [1, 0.8, 0.4, 0]
      }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        width: 100,
        height: 100,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 9999
      }}
      className={`rounded-full border-2 border-${color}`}
    />
  )
}

interface NewStoryPulseProps {
  trigger: boolean
  position?: { x: number, y: number }
}

export function NewStoryPulse({ trigger, position }: NewStoryPulseProps) {
  if (!trigger) return null

  const x = position?.x || window.innerWidth / 2
  const y = position?.y || 100

  return (
    <AnimatePresence>
      <motion.div
        key={Date.now()}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        style={{
          position: 'fixed',
          left: x,
          top: y,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 9999
        }}
      >
        {/* Multiple expanding circles for complex effect */}
        <motion.div
          animate={{
            scale: [1, 4],
            opacity: [1, 0]
          }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute w-20 h-20 rounded-full bg-cyber-blue/30"
          style={{ transform: 'translate(-50%, -50%)' }}
        />
        <motion.div
          animate={{
            scale: [1, 3],
            opacity: [1, 0]
          }}
          transition={{ duration: 1, delay: 0.1, ease: 'easeOut' }}
          className="absolute w-20 h-20 rounded-full bg-cyber-red/30"
          style={{ transform: 'translate(-50%, -50%)' }}
        />
        <motion.div
          animate={{
            scale: [1, 2],
            opacity: [1, 0]
          }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          className="absolute w-20 h-20 rounded-full bg-cyber-purple/30"
          style={{ transform: 'translate(-50%, -50%)' }}
        />
      </motion.div>
    </AnimatePresence>
  )
}

export function BreakingNewsAlert({ show }: { show: boolean }) {
  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(255, 0, 64, 0.7)',
              '0 0 0 10px rgba(255, 0, 64, 0)',
              '0 0 0 0 rgba(255, 0, 64, 0)',
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="bg-cyber-dark border-2 border-cyber-red px-6 py-3 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-3 h-3 bg-cyber-red rounded-full"
            />
            <span className="text-cyber-red font-bold uppercase tracking-wider">
              Breaking News Alert
            </span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-3 h-3 bg-cyber-red rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export function LiveDataStream() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-1 bg-cyber-dark/50 overflow-hidden pointer-events-none z-40">
      <motion.div
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear'
        }}
        className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyber-blue to-transparent"
      />
    </div>
  )
}
