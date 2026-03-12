'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, CloudOff, RefreshCw, Download } from 'lucide-react'

interface OfflineIndicatorProps {
  isOnline: boolean
  onRetry?: () => void
}

export default function OfflineIndicator({ isOnline, onRetry }: OfflineIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [cachedArticles, setCachedArticles] = useState(0)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('cachedArticles')
        if (cached) {
          setCachedArticles(JSON.parse(cached).length)
        }
      }
    } catch (e) {
      console.error('Error checking cache:', e)
    }
  }, [])

  if (isOnline) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
      >
        <div className="bg-gray-900/95 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <WifiOff className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">You're Offline</h3>
              <p className="text-sm text-gray-400 mb-3">
                {cachedArticles > 0 
                  ? `${cachedArticles} articles available offline`
                  : 'No cached articles available'}
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={onRetry}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm font-medium transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-sm transition-all"
                >
                  {showDetails ? 'Hide' : 'Details'}
                </button>
              </div>

              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-white/10"
                >
                  <p className="text-xs text-gray-500 mb-2">
                    Offline features available:
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li className="flex items-center gap-2">
                      <Download className="w-3 h-3" />
                      Reading cached articles
                    </li>
                    <li className="flex items-center gap-2">
                      <CloudOff className="w-3 h-3" />
                      Bookmarked articles are saved
                    </li>
                  </ul>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Service for caching articles
export async function cacheArticles(articles: any[]) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cachedArticles', JSON.stringify(articles.slice(0, 50)))
    }
  } catch (e) {
    console.error('Error caching articles:', e)
  }
}

export function getCachedArticles(): any[] {
  try {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('cachedArticles')
      return cached ? JSON.parse(cached) : []
    }
  } catch (e) {
    console.error('Error getting cached articles:', e)
  }
  return []
}
