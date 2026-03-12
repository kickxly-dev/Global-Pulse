'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Clock, Calendar, User, Bookmark, Share2, Heart, MessageCircle, TrendingUp, ChevronLeft } from 'lucide-react'
import { NewsArticle } from '@/types/news'
import { useState } from 'react'

interface ModernArticleViewProps {
  article: NewsArticle
  allArticles: NewsArticle[]
  isOpen: boolean
  onClose: () => void
  onArticleClick?: (article: NewsArticle) => void
}

export default function ModernArticleView({ article, allArticles, isOpen, onClose, onArticleClick }: ModernArticleViewProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showRelated, setShowRelated] = useState(true)

  if (!isOpen || !article) return null

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: article.title,
        text: article.description || '',
        url: article.url || window.location.href,
      })
    }
  }

  const readTime = Math.ceil((article.content?.length || 0) / 1000)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-black/70 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hero Image */}
          <div className="relative h-64 md:h-80">
            <img
              src={article.urlToImage || `https://picsum.photos/1200/600?random=${article.id}`}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
            
            {/* Article Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-cyber-blue/90 text-white text-xs font-bold rounded-full uppercase">
                  {article.category || 'News'}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs rounded-full">
                  {article.source.name}
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                {article.title}
              </h1>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-20rem)]">
            <div className="p-6 md:p-8">
              {/* Meta Bar */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{article.author || article.source.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{readTime} min read</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={handleBookmark}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                    isBookmarked 
                      ? 'bg-cyber-yellow/20 border-cyber-yellow text-cyber-yellow' 
                      : 'bg-white/5 border-white/10 text-gray-300 hover:border-cyber-yellow/50'
                  }`}
                >
                  <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                  <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:border-cyber-green/50 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-blue/20 border border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/30 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Original</span>
                  </a>
                )}
              </div>

              {/* Description */}
              {article.description && (
                <div className="mb-6 p-4 bg-gradient-to-r from-cyber-blue/10 to-cyber-purple/10 border-l-4 border-cyber-blue rounded-r-xl">
                  <p className="text-lg text-gray-200 italic">{article.description}</p>
                </div>
              )}

              {/* Article Content */}
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 leading-relaxed space-y-4 text-base">
                  {article.content ? (
                    article.content.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-4">{paragraph}</p>
                    ))
                  ) : (
                    <div className="space-y-4">
                      <p className="text-lg">{article.description || 'Full article content not available.'}</p>
                      <p>Please visit the original source to read the complete article.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Articles */}
              <div className="mt-10 pt-8 border-t border-white/10">
                <button
                  onClick={() => setShowRelated(!showRelated)}
                  className="flex items-center gap-2 text-cyber-blue hover:text-cyber-blue/80 transition-colors mb-4"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">{showRelated ? 'Hide' : 'Show'} Related Articles</span>
                </button>

                <AnimatePresence>
                  {showRelated && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {allArticles
                        .filter(a => a.id !== article.id)
                        .slice(0, 4)
                        .map((relatedArticle, idx) => (
                          <motion.div
                            key={relatedArticle.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => onArticleClick?.(relatedArticle)}
                            className="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all group"
                          >
                            <h4 className="font-medium text-gray-200 group-hover:text-cyber-blue transition-colors line-clamp-2">
                              {relatedArticle.title}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">{relatedArticle.source.name}</p>
                          </motion.div>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
