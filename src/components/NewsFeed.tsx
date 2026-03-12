'use client'

import { NewsArticle } from '@/types/news'
import { formatDistanceToNow } from 'date-fns'
import { ExternalLink, RefreshCw, AlertCircle, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import EnhancedNewsCard from './EnhancedNewsCard'

interface NewsFeedProps {
  articles: NewsArticle[]
  loading: boolean
  error: string | null
  onRefresh: () => void
  onRead?: (article: NewsArticle) => void
  onBookmark?: (article: NewsArticle) => void
}

export default function NewsFeed({ articles, loading, error, onRefresh, onRead, onBookmark }: NewsFeedProps) {
  if (error) {
    return (
      <div className="cyber-card text-center py-12">
        <AlertCircle className="w-12 h-12 text-cyber-red mx-auto mb-4" />
        <h3 className="text-xl font-bold text-cyber-red mb-2">Error Loading News</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button onClick={onRefresh} className="cyber-button-red">
          Try Again
        </button>
      </div>
    )
  }

  if (loading && articles.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="cyber-card animate-pulse">
            <div className="h-48 bg-cyber-dark rounded-lg mb-4"></div>
            <div className="h-6 bg-cyber-dark rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-cyber-dark rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold font-cyber text-gradient">
          Live News Feed
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="cyber-button flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {articles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <EnhancedNewsCard
              article={article}
              index={index}
              tldrMode={false}
              speedReadMode={false}
              onRead={onRead}
              onBookmark={onBookmark}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      {articles.length === 0 && !loading && (
        <div className="cyber-card text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No News Found</h3>
          <p className="text-gray-500">Try adjusting your filters or search query</p>
        </div>
      )}
    </div>
  )
}
