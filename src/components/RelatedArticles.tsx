'use client'

import { motion } from 'framer-motion'
import { Newspaper, TrendingUp, Clock, ExternalLink } from 'lucide-react'
import { NewsArticle } from '@/types/news'
import { findRelatedArticles } from '@/lib/aiAnalysis'

interface RelatedArticlesProps {
  article: NewsArticle
  allArticles: NewsArticle[]
  maxResults?: number
  onArticleClick?: (article: NewsArticle) => void
}

export default function RelatedArticles({
  article,
  allArticles,
  maxResults = 4,
  onArticleClick,
}: RelatedArticlesProps) {
  const related = findRelatedArticles(article, allArticles, maxResults)

  if (related.length === 0) {
    return null
  }

  return (
    <div className="mt-6">
      <div className="flex items-center space-x-2 mb-4">
        <Newspaper className="w-5 h-5 text-cyber-blue" />
        <h3 className="text-lg font-bold font-cyber text-cyber-blue">Related Stories</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {related.map((item, index) => (
          <motion.div
            key={item.article.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onArticleClick?.(item.article)}
            className="group bg-cyber-dark/50 border border-gray-700 rounded-lg p-4 hover:border-cyber-blue/50 cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-cyber-blue bg-cyber-blue/10 px-2 py-1 rounded">
                {item.reason}
              </span>
              <span className="text-xs text-gray-500">
                {Math.round(item.relevanceScore * 100)}% match
              </span>
            </div>

            <h4 className="text-sm font-medium text-gray-200 group-hover:text-cyber-blue transition-colors line-clamp-2 mb-2">
              {item.article.title}
            </h4>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{item.article.source.name}</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(item.article.publishedAt).toLocaleDateString()}</span>
              </span>
            </div>

            {item.article.url && (
              <a
                href={item.article.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-2 flex items-center space-x-1 text-xs text-cyber-blue hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Read full article</span>
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
