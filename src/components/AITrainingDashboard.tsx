'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Database, Sparkles, TrendingUp, RefreshCw } from 'lucide-react'

interface TrainingStats {
  totalArticles: number
  categories: Record<string, number>
  lastTrained: string
  modelVersion: string
  accuracy: number
}

export default function AITrainingDashboard() {
  const [stats, setStats] = useState<TrainingStats | null>(null)
  const [isTraining, setIsTraining] = useState(false)
  const [articles, setArticles] = useState<any[]>([])

  useEffect(() => {
    fetchTrainingStats()
    fetchRecentArticles()
  }, [])

  const fetchTrainingStats = async () => {
    try {
      const response = await fetch('/api/ai-training/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching training stats:', error)
    }
  }

  const fetchRecentArticles = async () => {
    try {
      const response = await fetch('/api/ai-training?limit=10')
      const data = await response.json()
      setArticles(data.articles || [])
    } catch (error) {
      console.error('Error fetching articles:', error)
    }
  }

  const startTraining = async () => {
    setIsTraining(true)
    try {
      const response = await fetch('/api/ai-training/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles })
      })
      
      if (response.ok) {
        await fetchTrainingStats()
        alert('AI model training completed!')
      }
    } catch (error) {
      console.error('Error training model:', error)
    } finally {
      setIsTraining(false)
    }
  }

  const collectNewsForTraining = async () => {
    try {
      // First check if we can connect to the database
      const checkResponse = await fetch('/api/ai-training/stats')
      if (!checkResponse.ok) {
        alert('Database not initialized. Please run database setup first.')
        return
      }

      // Fetch current news
      const newsResponse = await fetch('/api/news')
      const newsData = await newsResponse.json()
      
      if (!newsData.articles || newsData.articles.length === 0) {
        alert('No news articles available to collect')
        return
      }

      let successCount = 0
      let failCount = 0
      const errors: string[] = []

      // Store articles one by one with proper error handling
      for (const article of newsData.articles.slice(0, 20)) {
        try {
          const response = await fetch('/api/ai-training', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ article })
          })
          
          if (response.ok) {
            successCount++
          } else {
            failCount++
            const errorData = await response.json().catch(() => ({}))
            if (errorData.error) errors.push(errorData.error)
          }
        } catch (err) {
          failCount++
          errors.push(err instanceof Error ? err.message : 'Unknown error')
        }
      }
      
      await fetchRecentArticles()
      
      if (successCount > 0) {
        alert(`Successfully collected ${successCount} articles for AI training${failCount > 0 ? ` (${failCount} failed)` : ''}`)
      } else {
        alert(`Failed to collect articles. ${errors[0] || 'Check console for details.'}`)
      }
    } catch (error) {
      console.error('Error collecting news:', error)
      alert('Error collecting news: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-500/20 rounded-xl">
          <Brain className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">AI Training Dashboard</h3>
          <p className="text-sm text-white/60">Train AI on real news data</p>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-white/60">Articles</span>
            </div>
            <span className="text-2xl font-bold text-white">{stats.totalArticles}</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-white/60">Accuracy</span>
            </div>
            <span className="text-2xl font-bold text-white">{(stats.accuracy * 100).toFixed(1)}%</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-white/60">Model Version</span>
            </div>
            <span className="text-lg font-bold text-white">{stats.modelVersion}</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-white/60">Last Trained</span>
            </div>
            <span className="text-sm font-bold text-white">
              {new Date(stats.lastTrained).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <motion.button
          onClick={collectNewsForTraining}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30 hover:bg-blue-500/30 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Database className="w-4 h-4" />
          Collect News Data
        </motion.button>

        <motion.button
          onClick={startTraining}
          disabled={isTraining || articles.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30 hover:bg-purple-500/30 transition-all disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Brain className="w-4 h-4" />
          {isTraining ? 'Training...' : 'Train AI Model'}
        </motion.button>
      </div>

      {/* Recent Articles */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white/80 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Recent Articles for Training ({articles.length})
        </h4>
        
        {articles.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No articles collected yet. Click "Collect News Data" to start.</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {articles.slice(0, 5).map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-3 bg-white/5 border border-white/10 rounded-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-white line-clamp-1">{article.title}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                        {article.category}
                      </span>
                      <span className="text-xs text-white/40">{article.source}</span>
                    </div>
                  </div>
                  {article.embedding && (
                    <span className="text-xs text-green-400">✓ Embedded</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
