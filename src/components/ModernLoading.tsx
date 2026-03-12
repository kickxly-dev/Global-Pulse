'use client'

import { motion } from 'framer-motion'

export default function ModernLoading() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="relative">
        {/* Outer spinning ring */}
        <motion.div
          className="w-24 h-24 rounded-full border-4 border-cyber-blue/20 border-t-cyber-blue"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner spinning ring */}
        <motion.div
          className="absolute inset-2 w-20 h-20 rounded-full border-4 border-cyber-purple/20 border-t-cyber-purple"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Center glow */}
        <motion.div
          className="absolute inset-6 w-12 h-12 rounded-full bg-gradient-to-br from-cyber-blue to-cyber-purple"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Text */}
        <motion.p
          className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-cyber-blue text-sm font-medium whitespace-nowrap"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          Loading Global Pulse...
        </motion.p>
      </div>
    </div>
  )
}
