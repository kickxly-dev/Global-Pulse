'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, ExternalLink, Clock } from 'lucide-react'
import { NewsArticle } from '@/types/news'

interface BreakingNewsAlertProps {
  article: NewsArticle | null
  onDismiss: () => void
}

export default function BreakingNewsAlert({ article, onDismiss }: BreakingNewsAlertProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (article) {
      setIsVisible(true)
      setProgress(100)
      
      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onDismiss, 500)
      }, 10000)

      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress(p => Math.max(0, p - 1))
      }, 100)

      return () => {
        clearTimeout(timer)
        clearInterval(progressInterval)
      }
    }
  }, [article, onDismiss])

  if (!article || !isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className="fixed top-4 left-4 right-4 z-50 max-w-4xl mx-auto"
      >
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-xl shadow-2xl overflow-hidden border border-red-400/50">
          {/* Progress Bar */}
          <div className="h-1 bg-red-800">
            <motion.div 
              className="h-full bg-white"
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-4 flex items-start gap-4">
            {/* Alert Icon */}
            <div className="flex-shrink-0">
              <div className="p-2 bg-white/20 rounded-full animate-pulse">
                <Bell className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-white text-red-600 text-xs font-bold rounded uppercase">
                  Breaking
                </span>
                <span className="text-white/80 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Just now
                </span>
              </div>
              
              <h3 className="text-white font-bold text-lg leading-tight mb-1">
                {article.title}
              </h3>
              
              <p className="text-white/80 text-sm line-clamp-2">
                {article.description || 'Breaking news update...'}
              </p>

              <div className="flex items-center gap-3 mt-3">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-white text-red-600 text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
                >
                  Read More
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => {
                    setIsVisible(false)
                    setTimeout(onDismiss, 500)
                  }}
                  className="text-white/70 hover:text-white text-sm underline"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setIsVisible(false)
                setTimeout(onDismiss, 500)
              }}
              className="flex-shrink-0 p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
