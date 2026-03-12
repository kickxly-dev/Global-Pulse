'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Clock, Eye, RotateCcw, X, ChevronRight } from 'lucide-react'
import { NewsArticle } from '@/types/news'

interface SmartRecommendationsProps {
  currentArticle: NewsArticle | null
  allArticles: NewsArticle[]
  onArticleClick: (article: NewsArticle) => void
  isVisible: boolean
  onClose: () => void
}

interface Recommendation {
  article: NewsArticle
  score: number
  reason: string
}

export default function SmartRecommendations({ 
  currentArticle, 
  allArticles, 
  onArticleClick,
  isVisible,
  onClose
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [readingHistory, setReadingHistory] = useState<string[]>([])

  useEffect(() => {
    loadReadingHistory()
  }, [])

  useEffect(() => {
    if (currentArticle && allArticles.length > 0) {
      generateRecommendations()
    }
  }, [currentArticle, allArticles])

  const loadReadingHistory = () => {
    try {
      const saved = localStorage.getItem('readingHistory')
      if (saved) {
        setReadingHistory(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Failed to load reading history:', e)
    }
  }

  const saveReadingHistory = (articleId: string) => {
    try {
      const updated = [articleId, ...readingHistory.filter(id => id !== articleId)].slice(0, 50)
      localStorage.setItem('readingHistory', JSON.stringify(updated))
      setReadingHistory(updated)
    } catch (e) {
      console.error('Failed to save reading history:', e)
    }
  }

  const generateRecommendations = () => {
    if (!currentArticle) return

    const scored = allArticles
      .filter(a => a.id !== currentArticle.id && !readingHistory.includes(a.id))
      .map(article => {
        let score = 0
        let reason = ''

        // Category match
        if (article.category === currentArticle.category) {
          score += 30
          reason = 'Same category'
        }

        // Keyword matching in title
        const currentWords = currentArticle.title.toLowerCase().split(/\s+/)
        const articleWords = article.title.toLowerCase().split(/\s+/)
        const commonWords = currentWords.filter(w => articleWords.includes(w) && w.length > 3)
        score += commonWords.length * 10
        if (commonWords.length > 0 && !reason) {
          reason = `Related to "${commonWords[0]}"`
        }

        // Source diversity (prefer different sources)
        if (article.source.name !== currentArticle.source.name) {
          score += 15
        }

        // Recency boost
        const age = Date.now() - new Date(article.publishedAt).getTime()
        const hoursOld = age / (1000 * 60 * 60)
        if (hoursOld < 6) {
          score += 20
          if (!reason) reason = 'Breaking news'
        } else if (hoursOld < 24) {
          score += 10
          if (!reason) reason = 'Recent'
        }

        // Random factor for variety
        score += Math.random() * 10

        return { article, score, reason: reason || 'Recommended for you' }
      })

    // Sort by score and take top 5
    const topRecommendations = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    setRecommendations(topRecommendations)
  }

  const handleArticleClick = (article: NewsArticle) => {
    saveReadingHistory(article.id)
    onArticleClick(article)
  }

  const refreshRecommendations = () => {
    generateRecommendations()
  }

  if (!isVisible || recommendations.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-4 top-24 w-80 max-h-[calc(100vh-120px)] bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-40"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-cyber-purple/20 to-cyber-blue/20">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyber-yellow" />
          <h3 className="font-semibold text-white">Recommended For You</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={refreshRecommendations}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400"
            title="Refresh recommendations"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.article.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleArticleClick(rec.article)}
            className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group"
          >
            <div className="flex items-start gap-3">
              {rec.article.urlToImage && (
                <img
                  src={rec.article.urlToImage}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-200 line-clamp-2 group-hover:text-cyber-blue transition-colors">
                  {rec.article.title}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyber-blue/20 text-cyber-blue">
                    {rec.reason}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>{rec.article.source.name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(rec.article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyber-blue transition-colors flex-shrink-0" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 bg-gray-800/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            Based on your reading history
          </span>
          <span>{readingHistory.length} articles read</span>
        </div>
      </div>
    </motion.div>
  )
}
