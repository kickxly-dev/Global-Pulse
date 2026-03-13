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
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-cyan-500/20"
          style={{ width: 120, height: 120, left: -24, top: -24 }}
        />
        
        {/* Middle ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute rounded-full border border-white/10"
          style={{ width: 100, height: 100, left: -14, top: -14 }}
        />
        
        {/* Inner pulse */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
          style={{ width: 80, height: 80, left: -4, top: -4 }}
        />
        
        {/* Globe icon */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
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
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white/60 text-sm tracking-widest uppercase"
        >
          Loading
        </motion.p>
        
        {/* Animated dots */}
        <div className="flex items-center justify-center gap-1 mt-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                delay: i * 0.2 
              }}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
            />
          ))}
        </div>
      </motion.div>
      
      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 200 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 h-0.5 bg-white/10 rounded-full overflow-hidden"
      >
        <motion.div
          animate={{ x: [-200, 200] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
          className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        />
      </motion.div>
    </div>
  )
}
