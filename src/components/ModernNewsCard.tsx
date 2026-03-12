'use client'

import { NewsArticle } from '@/types/news'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { ExternalLink, Bookmark, Share2, Clock, ArrowRight } from 'lucide-react'

interface ModernNewsCardProps {
  article: NewsArticle
  index: number
  onRead?: (article: NewsArticle) => void
  onBookmark?: (article: NewsArticle) => void
}

export default function ModernNewsCard({ article, index, onRead, onBookmark }: ModernNewsCardProps) {
  const isBreaking = () => {
    const publishedTime = new Date(article.publishedAt).getTime()
    const now = Date.now()
    return (now - publishedTime) < (2 * 60 * 60 * 1000)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative"
    >
      {/* Glassmorphism Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-cyber-blue/20 transition-all duration-500">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={article.urlToImage || `https://picsum.photos/800/400?random=${article.id}`}
            alt={article.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              e.currentTarget.src = `https://picsum.photos/800/400?random=${article.id}`
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Breaking Badge */}
          {isBreaking() && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-red-500/90 backdrop-blur-md text-white text-xs font-bold rounded-full animate-pulse">
                BREAKING
              </span>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-cyber-blue/80 backdrop-blur-md text-white text-xs font-medium rounded-full uppercase tracking-wider">
              {article.category || 'News'}
            </span>
          </div>

          {/* Source Badge */}
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-full">
              {article.source.name}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-cyber-blue transition-colors duration-300">
            {article.title}
          </h3>

          {/* Description */}
          <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
            {article.description || 'No description available'}
          </p>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
            </div>
            {article.author && (
              <span className="text-cyber-blue">By {article.author}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onRead?.(article)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyber-blue to-cyber-purple text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-cyber-blue/30 transition-all duration-300 group/btn"
            >
              <span>Read Article</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => onBookmark?.(article)}
              className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-cyber-yellow hover:border-cyber-yellow/50 transition-all duration-300"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: article.title,
                    text: article.description || '',
                    url: article.url || window.location.href,
                  })
                }
              }}
              className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-cyber-green hover:border-cyber-green/50 transition-all duration-300"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/5 via-transparent to-cyber-purple/5" />
        </div>
      </div>
    </motion.article>
  )
}
