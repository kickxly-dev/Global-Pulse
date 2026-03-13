'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, TrendingUp, Users, Zap, Target, Sparkles, ChevronRight } from 'lucide-react'

interface Recommendation {
  id: string
  title: string
  source: string
  reason: string
  score: number
  category: string
  image?: string
}

interface AIRecommendationsProps {
  userInterests?: string[]
  readingHistory?: string[]
  onArticleClick: (article: any) => void
}

export default function AIRecommendations({ userInterests = [], readingHistory = [], onArticleClick }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'personal' | 'trending' | 'viral'>('personal')

  useEffect(() => {
    // Simulate AI recommendations
    const mockRecommendations: Recommendation[] = [
      {
        id: '1',
        title: 'AI Breakthrough: New Model Achieves Human-Level Understanding',
        source: 'MIT Technology Review',
        reason: 'Based on your interest in AI and technology',
        score: 95,
        category: 'Technology',
        image: 'https://picsum.photos/200/100?random=1'
      },
      {
        id: '2',
        title: 'Climate Summit: World Leaders Agree on Historic Carbon Reduction Plan',
        source: 'Reuters',
        reason: 'Trending in your network',
        score: 88,
        category: 'World',
        image: 'https://picsum.photos/200/100?random=2'
      },
      {
        id: '3',
        title: 'Stock Market Rally: Tech Stocks Hit Record Highs',
        source: 'Bloomberg',
        reason: 'Similar to articles you\'ve read',
        score: 82,
        category: 'Business',
        image: 'https://picsum.photos/200/100?random=3'
      },
      {
        id: '4',
        title: 'Medical Discovery: New Treatment Shows Promise for Alzheimer\'s',
        source: 'Nature Medicine',
        reason: 'Viral in health community',
        score: 79,
        category: 'Health',
        image: 'https://picsum.photos/200/100?random=4'
      },
      {
        id: '5',
        title: 'Space Exploration: Mars Colony Plans Accelerated',
        source: 'NASA News',
        reason: 'Trending globally',
        score: 76,
        category: 'Science',
        image: 'https://picsum.photos/200/100?random=5'
      }
    ]

    setTimeout(() => {
      setRecommendations(mockRecommendations)
      setLoading(false)
    }, 1000)
  }, [])

  const tabs = [
    { id: 'personal', label: 'For You', icon: Brain, description: 'AI-curated based on your interests' },
    { id: 'trending', label: 'Trending', icon: TrendingUp, description: 'Most popular right now' },
    { id: 'viral', label: 'Viral', icon: Zap, description: 'Going viral globally' }
  ]

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <h3 className="font-semibold">AI Recommendations</h3>
          <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
        </div>
        <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Description */}
      <p className="text-xs text-white/40 mb-4">
        {tabs.find(t => t.id === activeTab)?.description}
      </p>

      {/* Recommendations */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 bg-white/5 rounded-lg animate-pulse">
              <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onArticleClick(rec)}
              className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 cursor-pointer transition-all group"
            >
              <div className="flex items-start gap-3">
                {rec.image && (
                  <img 
                    src={rec.image} 
                    alt="" 
                    className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-purple-400">{rec.category}</span>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">{rec.score}% match</span>
                    </div>
                  </div>
                  <h4 className="text-sm font-medium line-clamp-2 mb-1 group-hover:text-purple-400 transition-colors">
                    {rec.title}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">{rec.source}</span>
                    <span className="text-xs text-white/30">{rec.reason}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-purple-400 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* AI Insights */}
      <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-3 h-3 text-purple-400" />
          <span className="text-xs font-medium text-purple-400">AI Insights</span>
        </div>
        <p className="text-xs text-white/60">
          Your reading patterns show strong interest in technology and world news. 
          We've prioritized articles with high engagement and relevance scores.
        </p>
      </div>
    </div>
  )
}
