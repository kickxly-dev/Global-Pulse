'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, TrendingDown, Minus, PieChart, Activity, Globe, Zap } from 'lucide-react'

interface SentimentData {
  category: string
  positive: number
  neutral: number
  negative: number
  total: number
  trend: 'up' | 'down' | 'stable'
}

interface SentimentDashboardProps {
  articles?: any[]
}

export default function SentimentDashboard({ articles = [] }: SentimentDashboardProps) {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([])
  const [overallSentiment, setOverallSentiment] = useState<'positive' | 'neutral' | 'negative'>('neutral')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    // Simulate sentiment analysis
    const mockData: SentimentData[] = [
      { category: 'Technology', positive: 65, neutral: 25, negative: 10, total: 156, trend: 'up' },
      { category: 'Politics', positive: 30, neutral: 35, negative: 35, total: 234, trend: 'down' },
      { category: 'Business', positive: 55, neutral: 30, negative: 15, total: 189, trend: 'up' },
      { category: 'Health', positive: 45, neutral: 40, negative: 15, total: 98, trend: 'stable' },
      { category: 'Sports', positive: 70, neutral: 20, negative: 10, total: 145, trend: 'up' },
      { category: 'Entertainment', positive: 60, neutral: 30, negative: 10, total: 112, trend: 'stable' },
      { category: 'Science', positive: 75, neutral: 18, negative: 7, total: 87, trend: 'up' },
      { category: 'World', positive: 35, neutral: 40, negative: 25, total: 203, trend: 'down' }
    ]

    setSentimentData(mockData)

    // Calculate overall sentiment
    const avgPositive = mockData.reduce((acc, d) => acc + d.positive, 0) / mockData.length
    if (avgPositive > 55) setOverallSentiment('positive')
    else if (avgPositive < 40) setOverallSentiment('negative')
    else setOverallSentiment('neutral')
  }, [articles])

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400'
      case 'negative': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/20'
      case 'negative': return 'bg-red-500/20'
      default: return 'bg-yellow-500/20'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-400" />
      case 'down': return <TrendingDown className="w-3 h-3 text-red-400" />
      default: return <Minus className="w-3 h-3 text-yellow-400" />
    }
  }

  const totalArticles = sentimentData.reduce((acc, d) => acc + d.total, 0)

  return (
    <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <h3 className="font-semibold">Sentiment Analysis</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSentimentBg(overallSentiment)} ${getSentimentColor(overallSentiment)}`}>
          Overall: {overallSentiment.toUpperCase()}
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">Positive</span>
          </div>
          <div className="text-xl font-bold text-green-400">
            {Math.round(sentimentData.reduce((acc, d) => acc + d.positive, 0) / sentimentData.length)}%
          </div>
        </div>
        <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Minus className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-yellow-400">Neutral</span>
          </div>
          <div className="text-xl font-bold text-yellow-400">
            {Math.round(sentimentData.reduce((acc, d) => acc + d.neutral, 0) / sentimentData.length)}%
          </div>
        </div>
        <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-3 h-3 text-red-400" />
            <span className="text-xs text-red-400">Negative</span>
          </div>
          <div className="text-xl font-bold text-red-400">
            {Math.round(sentimentData.reduce((acc, d) => acc + d.negative, 0) / sentimentData.length)}%
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-white/40 mb-2">
          <span>Category Breakdown</span>
          <span>{totalArticles.toLocaleString()} articles analyzed</span>
        </div>
        {sentimentData.map((data, i) => (
          <motion.button
            key={data.category}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedCategory(selectedCategory === data.category ? null : data.category)}
            className={`w-full p-3 rounded-lg transition-all ${
              selectedCategory === data.category
                ? 'bg-emerald-500/20 border border-emerald-500/30'
                : 'bg-white/5 border border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{data.category}</span>
                {getTrendIcon(data.trend)}
              </div>
              <span className="text-xs text-white/40">{data.total} articles</span>
            </div>
            
            {/* Sentiment Bar */}
            <div className="h-2 rounded-full overflow-hidden bg-white/10 flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.positive}%` }}
                className="bg-green-500"
                transition={{ delay: i * 0.1, duration: 0.5 }}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.neutral}%` }}
                className="bg-yellow-500"
                transition={{ delay: i * 0.1, duration: 0.5 }}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.negative}%` }}
                className="bg-red-500"
                transition={{ delay: i * 0.1, duration: 0.5 }}
              />
            </div>
            
            {/* Expanded Details */}
            {selectedCategory === data.category && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-3 pt-3 border-t border-white/10"
              >
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-400">{data.positive}%</div>
                    <div className="text-xs text-white/40">Positive</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-400">{data.neutral}%</div>
                    <div className="text-xs text-white/40">Neutral</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-400">{data.negative}%</div>
                    <div className="text-xs text-white/40">Negative</div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* AI Insight */}
      <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3 h-3 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">AI Insight</span>
        </div>
        <p className="text-xs text-white/60">
          Technology and Science news show the most positive sentiment, while Politics and World news 
          trend more negative. Consider balancing your reading for a well-rounded perspective.
        </p>
      </div>
    </div>
  )
}
