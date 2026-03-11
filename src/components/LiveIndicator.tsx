'use client'

import { Activity } from 'lucide-react'
import { motion } from 'framer-motion'

interface LiveIndicatorProps {
  count: number
}

export default function LiveIndicator({ count }: LiveIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center space-x-2 px-4 py-2 bg-cyber-dark/50 border border-cyber-red/30 rounded-lg"
    >
      <div className="relative">
        <div className="pulse-dot"></div>
      </div>
      <div className="flex items-center space-x-2">
        <Activity className="w-4 h-4 text-cyber-red animate-pulse" />
        <div>
          <div className="text-xs text-gray-400">Live Stories</div>
          <div className="text-sm font-bold text-cyber-red animate-heartbeat">
            {count.toLocaleString()}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
