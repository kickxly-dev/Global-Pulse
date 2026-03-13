'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Zap, Clock, BookOpen } from 'lucide-react'

interface LoadingStateProps {
  type?: 'articles' | 'recommendations' | 'search' | 'auth'
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export default function LoadingState({ 
  type = 'articles', 
  size = 'md', 
  text 
}: LoadingStateProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  const containerSizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const getIcon = () => {
    switch (type) {
      case 'articles': return <Loader2 className={`${sizeClasses[size]} animate-spin text-white/40`} />
      case 'recommendations': return <Zap className={`${sizeClasses[size]} text-purple-400 animate-pulse`} />
      case 'search': return <Clock className={`${sizeClasses[size]} text-cyan-400 animate-pulse`} />
      case 'auth': return <BookOpen className={`${sizeClasses[size]} text-emerald-400 animate-pulse`} />
      default: return <Loader2 className={`${sizeClasses[size]} animate-spin text-white/40`} />
    }
  }

  const getDefaultText = () => {
    switch (type) {
      case 'articles': return 'Loading latest stories'
      case 'recommendations': return 'Analyzing your preferences'
      case 'search': return 'Searching articles'
      case 'auth': return 'Authenticating'
      default: return 'Loading'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col items-center justify-center ${containerSizes[size]} bg-white/[0.02] rounded-xl border border-white/5`}
    >
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          {getIcon()}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <p className="text-white/60 text-sm font-medium">
            {text || getDefaultText()}
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {dots}
            </motion.span>
          </p>
          
          {type === 'articles' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/40 text-xs mt-2"
            >
              Fetching from multiple sources
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Progress bar for articles */}
      {type === 'articles' && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
        />
      )}
    </motion.div>
  )
}

// Skeleton loader component
export function SkeletonLoader({ 
  count = 3, 
  type = 'article' 
}: { 
  count?: number
  type?: 'article' | 'card' | 'list' 
}) {
  const getSkeletonContent = () => {
    switch (type) {
      case 'article':
        return (
          <div className="rounded-xl bg-white/5 border border-white/5 overflow-hidden">
            <div className="aspect-[16/10] bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-shimmer bg-[length:200%_100%]" />
            <div className="p-3 space-y-2">
              <div className="flex justify-between">
                <div className="h-2 bg-white/5 rounded w-1/4 animate-pulse" />
                <div className="h-2 bg-white/5 rounded w-1/6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
                <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
              </div>
              <div className="h-3 bg-white/5 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        )
      case 'card':
        return (
          <div className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-3">
            <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-white/5 rounded w-full animate-pulse" />
            <div className="h-3 bg-white/5 rounded w-2/3 animate-pulse" />
          </div>
        )
      case 'list':
        return (
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <div className="h-8 w-8 bg-white/5 rounded animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-white/5 rounded w-full animate-pulse" />
              <div className="h-2 bg-white/5 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          {getSkeletonContent()}
        </motion.div>
      ))}
    </div>
  )
}
