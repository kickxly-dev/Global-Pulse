'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Clock, Calendar, User, Bookmark, Share2, Heart, MessageCircle, TrendingUp } from 'lucide-react'
import { NewsArticle } from '@/types/news'
import ArticleReactions from './ArticleReactions'
import RelatedArticles from './RelatedArticles'

interface ArticleViewProps {
  article: NewsArticle
  allArticles: NewsArticle[]
  isOpen: boolean
  onClose: () => void
}

export default function ArticleView({ article, allArticles, isOpen, onClose }: ArticleViewProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showRelated, setShowRelated] = useState(true)

  if (!isOpen) return null

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]')
    const exists = bookmarks.find((b: any) => b.id === article.id)
    
    if (exists) {
      const newBookmarks = bookmarks.filter((b: any) => b.id !== article.id)
      localStorage.setItem('bookmarkedArticles', JSON.stringify(newBookmarks))
      setIsBookmarked(false)
    } else {
      bookmarks.push(article)
      localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarks))
      setIsBookmarked(true)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: article.title,
        text: article.description || '',
        url: article.url || window.location.href,
      })
    } else {
      navigator.clipboard.writeText(article.url || window.location.href)
    }
  }

  const readTime = Math.ceil((article.content?.length || 0) / 1000) // Rough estimate: 1000 chars per minute

  if (!isOpen || !article) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-cyber-darker border border-cyber-blue/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-cyber-blue bg-cyber-blue/10 px-2 py-1 rounded">
                {article.category?.toUpperCase() || 'NEWS'}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {readTime} min read
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Article Image */}
              {article.urlToImage && (
                <div className="mb-6">
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = `https://picsum.photos/800/400?random=${article.id}`
                    }}
                  />
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
                {article.title}
              </h1>

              {/* Article Meta */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{article.source.name}</span>
                  </div>
                  {article.author && (
                    <>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-300">{article.author}</span>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBookmark}
                    className={`p-2 rounded-lg transition-colors ${
                      isBookmarked
                        ? 'bg-cyber-yellow/20 text-cyber-yellow'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-cyber-blue/20 text-cyber-blue rounded-lg hover:bg-cyber-blue/30 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Description */}
              {article.description && (
                <div className="mb-6 p-4 bg-cyber-dark/50 border-l-4 border-cyber-blue rounded-r-lg">
                  <p className="text-lg text-gray-200 italic">{article.description}</p>
                </div>
              )}

              {/* Full Content */}
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 leading-relaxed space-y-4">
                  {article.content ? (
                    article.content.split('\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))
                  ) : (
                    <div className="space-y-4">
                      <p>
                        {article.description || 'Article content is not available at this time.'}
                      </p>
                      <p>
                        This is a developing story. More details will be added as they become available. 
                        Please check back later for updates on this breaking news story.
                      </p>
                      <p>
                        The information provided is based on initial reports and may be subject to change 
                        as more facts emerge from the ongoing situation.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reactions */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Reactions</h3>
                <ArticleReactions articleId={article.id} />
              </div>

              {/* Related Articles Toggle */}
              <div className="mt-6">
                <button
                  onClick={() => setShowRelated(!showRelated)}
                  className="flex items-center space-x-2 text-cyber-blue hover:text-cyber-blue/80 transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>{showRelated ? 'Hide' : 'Show'} Related Articles</span>
                </button>
              </div>

              {/* Related Articles */}
              <AnimatePresence>
                {showRelated && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <RelatedArticles
                      article={article}
                      allArticles={allArticles}
                      onArticleClick={(selectedArticle) => {
                        // This would open the new article in the same modal
                        // For now, just close and let parent handle it
                        onClose()
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
  )
}
