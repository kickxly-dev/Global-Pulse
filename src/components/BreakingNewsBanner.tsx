'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X, Zap } from 'lucide-react'
import { NewsArticle } from '@/types/news'

interface BreakingNewsBannerProps {
  articles: NewsArticle[]
  onArticleClick?: (article: NewsArticle) => void
  onDismiss?: () => void
}

export default function BreakingNewsBanner({ 
  articles, 
  onArticleClick,
  onDismiss 
}: BreakingNewsBannerProps) {
  const [dismissedArticles, setDismissedArticles] = useState<Set<string>>(new Set())
  const [isVisible, setIsVisible] = useState(true)

  // Load dismissed articles from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dismissedBreakingNews')
      if (saved) {
        setDismissedArticles(new Set(JSON.parse(saved)))
      }
    } catch (e) {
      console.error('Error loading dismissed breaking news:', e)
    }
  }, [])

  // Filter out dismissed articles
  const visibleArticles = articles.filter(article => !dismissedArticles.has(article.id))

  // Hide banner if no visible articles or explicitly dismissed
  if (!isVisible || visibleArticles.length === 0) return null

  const handleDismiss = () => {
    // Dismiss all current breaking news articles
    const newDismissed = new Set(dismissedArticles)
    visibleArticles.forEach(article => newDismissed.add(article.id))
    setDismissedArticles(newDismissed)
    
    // Save to localStorage
    try {
      localStorage.setItem('dismissedBreakingNews', JSON.stringify([...newDismissed]))
    } catch (e) {
      console.error('Error saving dismissed breaking news:', e)
    }
    
    setIsVisible(false)
    onDismiss?.()
  }

  const handleDismissArticle = (articleId: string) => {
    const newDismissed = new Set(dismissedArticles)
    newDismissed.add(articleId)
    setDismissedArticles(newDismissed)
    
    try {
      localStorage.setItem('dismissedBreakingNews', JSON.stringify([...newDismissed]))
    } catch (e) {
      console.error('Error saving dismissed breaking news:', e)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-20 left-0 right-0 z-50 mx-4"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-red-700/50">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span className="text-white font-bold tracking-wider">
                  🔴 BREAKING NEWS
                </span>
                <span className="text-red-100 text-sm">
                  {visibleArticles.length} {visibleArticles.length === 1 ? 'story' : 'stories'}
                </span>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                title="Dismiss all breaking news"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {visibleArticles.slice(0, 3).map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <button
                    onClick={() => onArticleClick?.(article)}
                    className="flex-1 text-left bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-all group"
                  >
                    <div className="flex items-start space-x-3">
                      {article.urlToImage && (
                        <img
                          src={article.urlToImage}
                          alt=""
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold line-clamp-2 group-hover:text-yellow-200 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-red-100 text-sm mt-1 line-clamp-1">
                          {article.source.name} • {new Date(article.publishedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <AlertCircle className="w-5 h-5 text-yellow-300 flex-shrink-0 animate-pulse" />
                    </div>
                  </button>
                  <button
                    onClick={() => handleDismissArticle(article.id)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors self-center"
                    title="Dismiss this story"
                  >
                    <X className="w-4 h-4 text-white/70 hover:text-white" />
                  </button>
                </motion.div>
              ))}
              
              {visibleArticles.length > 3 && (
                <p className="text-center text-red-100 text-sm">
                  +{visibleArticles.length - 3} more breaking {visibleArticles.length - 3 === 1 ? 'story' : 'stories'}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
