'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Brain, Target, Clock, Zap, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

interface TrendPrediction {
  topic: string
  currentMentions: number
  predictedMentions: number
  change: number
  confidence: number
  timeframe: string
  category: string
  trending: 'up' | 'down' | 'stable'
  relatedTopics: string[]
}

export default function TrendPrediction() {
  const [predictions, setPredictions] = useState<TrendPrediction[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    
    // Simulate AI predictions
    setTimeout(() => {
      const mockPredictions: TrendPrediction[] = [
        {
          topic: 'Artificial Intelligence',
          currentMentions: 15420,
          predictedMentions: 28500,
          change: 85,
          confidence: 92,
          timeframe: selectedTimeframe,
          category: 'Technology',
          trending: 'up',
          relatedTopics: ['ChatGPT', 'Machine Learning', 'Automation']
        },
        {
          topic: 'Climate Summit 2024',
          currentMentions: 8930,
          predictedMentions: 15200,
          change: 70,
          confidence: 88,
          timeframe: selectedTimeframe,
          category: 'World',
          trending: 'up',
          relatedTopics: ['Carbon Emissions', 'Renewable Energy', 'Paris Agreement']
        },
        {
          topic: 'Electric Vehicles',
          currentMentions: 6200,
          predictedMentions: 8500,
          change: 37,
          confidence: 81,
          timeframe: selectedTimeframe,
          category: 'Business',
          trending: 'up',
          relatedTopics: ['Tesla', 'EV Charging', 'Battery Technology']
        },
        {
          topic: 'Space Exploration',
          currentMentions: 4500,
          predictedMentions: 4200,
          change: -7,
          confidence: 75,
          timeframe: selectedTimeframe,
          category: 'Science',
          trending: 'down',
          relatedTopics: ['SpaceX', 'Mars Mission', 'NASA']
        },
        {
          topic: 'Cryptocurrency',
          currentMentions: 12000,
          predictedMentions: 11800,
          change: -2,
          confidence: 68,
          timeframe: selectedTimeframe,
          category: 'Finance',
          trending: 'stable',
          relatedTopics: ['Bitcoin', 'Ethereum', 'DeFi']
        }
      ]
      
      setPredictions(mockPredictions)
      setLoading(false)
    }, 1000)
  }, [selectedTimeframe])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="w-4 h-4 text-green-400" />
      case 'down': return <ArrowDownRight className="w-4 h-4 text-red-400" />
      default: return <Minus className="w-4 h-4 text-yellow-400" />
    }
  }

  const getTrendColor = (change: number) => {
    if (change > 20) return 'text-green-400'
    if (change < -10) return 'text-red-400'
    return 'text-yellow-400'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'bg-green-500'
    if (confidence >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold">Trend Prediction</h3>
        </div>
        <span className="text-xs text-white/40">AI-powered forecasts</span>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2 mb-4">
        {(['24h', '7d', '30d'] as const).map((tf) => (
          <button
            key={tf}
            onClick={() => setSelectedTimeframe(tf)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              selectedTimeframe === tf
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {tf === '24h' ? '24 Hours' : tf === '7d' ? '7 Days' : '30 Days'}
          </button>
        ))}
      </div>

      {/* Predictions */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 bg-white/5 rounded-lg animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {predictions.map((pred, i) => (
            <motion.div
              key={pred.topic}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTrendIcon(pred.trending)}
                  <div>
                    <h4 className="text-sm font-medium">{pred.topic}</h4>
                    <span className="text-xs text-white/40">{pred.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <motion.div 
                    className={`text-sm font-bold ${getTrendColor(pred.change)}`}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {pred.change > 0 ? '+' : ''}{pred.change}%
                  </motion.div>
                  <div className="text-xs text-white/40">predicted</div>
                </div>
              </div>

              {/* Mentions Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-white/40 mb-1">
                  <span>{pred.currentMentions.toLocaleString()}</span>
                  <span>→</span>
                  <span className="text-cyan-400">{pred.predictedMentions.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (pred.predictedMentions / pred.currentMentions) * 50)}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Confidence & Related */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">Confidence:</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getConfidenceColor(pred.confidence)} animate-pulse`} />
                    <span className="text-xs font-medium">{pred.confidence}%</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {pred.relatedTopics.slice(0, 2).map((topic, j) => (
                    <span key={j} className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded border border-cyan-500/30">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* AI Insight */}
      <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3 h-3 text-cyan-400" />
          <span className="text-xs font-medium text-cyan-400">AI Insight</span>
        </div>
        <p className="text-xs text-white/60">
          AI and Climate topics show strongest growth potential. Consider prioritizing coverage 
          in these areas for maximum engagement over the next {selectedTimeframe === '24h' ? '24 hours' : selectedTimeframe === '7d' ? 'week' : 'month'}.
        </p>
      </div>
    </div>
  )
}
