'use client'

import { motion } from 'framer-motion'
import { RefreshCw, Clock, Wifi } from 'lucide-react'

interface AutoRefreshIndicatorProps {
  isAutoRefreshing: boolean
  lastRefresh: Date | null
  interval?: number
}

export default function AutoRefreshIndicator({ 
  isAutoRefreshing, 
  lastRefresh, 
  interval = 30000 
}: AutoRefreshIndicatorProps) {
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 text-xs"
      >
        <RefreshCw 
          className={`w-3 h-3 ${isAutoRefreshing ? 'text-cyber-blue animate-spin' : 'text-gray-500'}`} 
        />
        <span className="text-gray-400">
          {isAutoRefreshing ? 'Updating...' : 'Auto-refresh'}
        </span>
        {lastRefresh && !isAutoRefreshing && (
          <span className="text-gray-500">
            • {formatTimeAgo(lastRefresh)}
          </span>
        )}
        <Wifi className="w-3 h-3 text-green-400" />
      </motion.div>
    </div>
  )
}
