'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Hash, Flame, Sparkles } from 'lucide-react'
import { NewsArticle } from '@/types/news'

interface TrendingTopic {
  word: string
  count: number
  trend: 'rising' | 'stable' | 'hot'
}

interface TrendingTopicsProps {
  articles: NewsArticle[]
}

export default function TrendingTopics({ articles }: TrendingTopicsProps) {
  const [topics, setTopics] = useState<TrendingTopic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  useEffect(() => {
    if (articles.length === 0) return

    // Extract trending topics from article titles and descriptions
    const wordFrequency: Record<string, number> = {}
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'as', 'by', 'that', 'this', 'it', 'from', 'be', 'are',
      'is', 'was', 'were', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall',
      'not', 'no', 'nor', 'so', 'than', 'too', 'very', 'just', 'there'
    ])

    articles.forEach(article => {
      // Combine title and description
      const text = `${article.title} ${article.description || ''}`.toLowerCase()
      
      // Extract words (alphanumeric only, at least 4 characters)
      const words = text.match(/\b[a-z0-9]{4,}\b/g) || []
      
      words.forEach(word => {
        if (!stopWords.has(word)) {
          wordFrequency[word] = (wordFrequency[word] || 0) + 1
        }
      })
    })

    // Sort by frequency and get top topics
    const sortedTopics = Object.entries(wordFrequency)
      .filter(([_, count]) => count > 1) // Must appear at least twice
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count], index): TrendingTopic => {
        // Determine trend status
        let trend: 'rising' | 'stable' | 'hot' = 'stable'
        if (count > 5) trend = 'hot'
        else if (index < 3) trend = 'rising'
        
        return { word, count, trend }
      })

    setTopics(sortedTopics)
  }, [articles])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'hot':
        return <Flame className="w-3 h-3 text-cyber-red" />
      case 'rising':
        return <TrendingUp className="w-3 h-3 text-cyber-yellow" />
      default:
        return <Sparkles className="w-3 h-3 text-cyber-blue" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'hot':
        return 'text-cyber-red border-cyber-red/50 bg-cyber-red/10 hover:bg-cyber-red/20'
      case 'rising':
        return 'text-cyber-yellow border-cyber-yellow/50 bg-cyber-yellow/10 hover:bg-cyber-yellow/20'
      default:
        return 'text-cyber-blue border-cyber-blue/50 bg-cyber-blue/10 hover:bg-cyber-blue/20'
    }
  }

  return (
    <div className="cyber-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-cyber text-cyber-purple">
          Trending Topics
        </h2>
        <Hash className="w-5 h-5 text-cyber-purple animate-pulse" />
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {topics.map((topic, index) => (
            <motion.button
              key={topic.word}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedTopic(topic.word === selectedTopic ? null : topic.word)}
              className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all duration-300 ${
                getTrendColor(topic.trend)
              } ${selectedTopic === topic.word ? 'ring-2 ring-cyber-purple' : ''}`}
            >
              <div className="flex items-center space-x-2">
                {getTrendIcon(topic.trend)}
                <span className="text-sm font-medium capitalize">
                  {topic.word}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs opacity-75">
                  {topic.count} mentions
                </span>
                {topic.trend === 'hot' && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-cyber-red rounded-full"
                  />
                )}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        {topics.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No trending topics yet...
          </div>
        )}
      </div>

      {/* Trend indicator bars */}
      <div className="mt-4 pt-4 border-t border-cyber-blue/20">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <Flame className="w-3 h-3 text-cyber-red" />
            <span className="text-gray-400">Hot</span>
            <span className="text-cyber-red font-bold">
              {topics.filter(t => t.trend === 'hot').length}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-3 h-3 text-cyber-yellow" />
            <span className="text-gray-400">Rising</span>
            <span className="text-cyber-yellow font-bold">
              {topics.filter(t => t.trend === 'rising').length}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-cyber-blue" />
            <span className="text-gray-400">Active</span>
            <span className="text-cyber-blue font-bold">
              {topics.filter(t => t.trend === 'stable').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
