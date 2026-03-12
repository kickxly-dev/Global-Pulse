'use client'

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
  if (articles.length === 0) return null

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
                  {articles.length} {articles.length === 1 ? 'story' : 'stories'}
                </span>
              </div>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
            
            <div className="p-4 space-y-3">
              {articles.slice(0, 3).map((article, index) => (
                <motion.button
                  key={article.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onArticleClick?.(article)}
                  className="w-full text-left bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-all group"
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
                </motion.button>
              ))}
              
              {articles.length > 3 && (
                <p className="text-center text-red-100 text-sm">
                  +{articles.length - 3} more breaking {articles.length - 3 === 1 ? 'story' : 'stories'}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
