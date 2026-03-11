'use client'

import { NewsArticle } from '@/types/news'
import { formatDistanceToNow } from 'date-fns'
import { ExternalLink, RefreshCw, AlertCircle, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface NewsFeedProps {
  articles: NewsArticle[]
  loading: boolean
  error: string | null
  onRefresh: () => void
}

export default function NewsFeed({ articles, loading, error, onRefresh }: NewsFeedProps) {
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

  const isBreaking = (article: NewsArticle) => {
    const publishedTime = new Date(article.publishedAt).getTime()
    const now = Date.now()
    const hoursDiff = (now - publishedTime) / (1000 * 60 * 60)
    return hoursDiff < 2
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
          <motion.article
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`news-card cyber-card group ${
              isBreaking(article) ? 'breaking-news-alert' : ''
            }`}
          >
            {isBreaking(article) && (
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-4 h-4 text-cyber-red animate-pulse" />
                <span className="text-xs font-bold text-cyber-red uppercase tracking-wider">
                  Breaking News
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {article.urlToImage && (
                <div className="relative h-48 md:h-full rounded-lg overflow-hidden bg-cyber-dark">
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-news.jpg'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark/80 to-transparent"></div>
                </div>
              )}

              <div className={article.urlToImage ? 'md:col-span-2' : 'md:col-span-3'}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-100 mb-2 group-hover:text-cyber-blue transition-colors">
                      {article.title}
                    </h3>
                    {article.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {article.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="px-2 py-1 bg-cyber-blue/10 border border-cyber-blue/30 rounded text-cyber-blue font-medium">
                      {article.source.name}
                    </span>
                    {article.author && (
                      <span className="hidden sm:inline">by {article.author}</span>
                    )}
                    <span>
                      {formatDistanceToNow(new Date(article.publishedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-cyber-blue hover:text-cyber-blue/80 transition-colors"
                  >
                    <span className="hidden sm:inline">Read More</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </motion.article>
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
