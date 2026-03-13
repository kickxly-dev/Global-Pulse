'use client'

import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'

export default function CleanLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black">
      {/* Animated Globe */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-cyan-500/20"
          style={{ width: 140, height: 140, left: -34, top: -34 }}
        />
        
        {/* Middle ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute rounded-full border border-white/10"
          style={{ width: 120, height: 120, left: -24, top: -24 }}
        />
        
        {/* Inner pulse */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
          style={{ width: 100, height: 100, left: -14, top: -14 }}
        />
        
        {/* Globe icon */}
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Globe className="w-16 h-16 text-white" />
        </motion.div>
      </motion.div>
      
      {/* Loading text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 text-center"
      >
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-white/60 text-sm tracking-widest uppercase"
        >
          Loading
        </motion.p>
        
        {/* Animated dots */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.8, 1], opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.25 }}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400"
            />
          ))}
        </div>
      </motion.div>
      
      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 240 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="mt-10 h-1 bg-white/10 rounded-full overflow-hidden"
      >
        <motion.div
          animate={{ x: [-240, 240] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        />
      </motion.div>
      
      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.5 }}
        className="mt-6 text-xs text-white/30 tracking-wider"
      >
        Your window to the world
      </motion.p>
    </div>
  )
}
