'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, TrendingUp, Users, Zap, Target, Sparkles, ChevronRight, RefreshCw } from 'lucide-react'

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
    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <h3 className="font-semibold">AI Recommendations</h3>
          <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-500/30 transition-colors">
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
      <p className="text-xs text-white/40 mb-3">
        {tabs.find(t => t.id === activeTab)?.description}
      </p>

      {/* Recommendations */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 bg-white/5 rounded-lg animate-pulse">
              <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Featured Top Recommendation */}
          {recommendations[0] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0, duration: 0.4 }}
              onClick={() => onArticleClick(recommendations[0])}
              className="p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30 hover:border-purple-500/50 cursor-pointer transition-all group relative overflow-hidden"
            >
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">Featured</span>
              </div>
              <div className="flex items-start gap-2">
                {recommendations[0].image && (
                  <img 
                    src={recommendations[0].image} 
                    alt="" 
                    className="w-16 h-12 object-cover rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-purple-400 font-medium">{recommendations[0].category}</span>
                    <div className="flex items-center gap-1">
                      <div className="relative w-10 h-10">
                        <svg className="w-10 h-10 transform -rotate-90">
                          <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="3" fill="none" className="text-white/10" />
                          <circle 
                            cx="20" cy="20" r="18" 
                            stroke="currentColor" 
                            strokeWidth="3" 
                            fill="none" 
                            strokeDasharray={`${recommendations[0].score * 1.13} 113`}
                            className="text-green-400 transition-all duration-1000"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-green-400">
                          {recommendations[0].score}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold line-clamp-2 mb-1 group-hover:text-purple-300 transition-colors">
                    {recommendations[0].title}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50 font-medium">{recommendations[0].source}</span>
                    <span className="text-xs text-white/40 italic">{recommendations[0].reason}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Other Recommendations */}
          {recommendations.slice(1).map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (i + 1) * 0.1 }}
              onClick={() => onArticleClick(rec)}
              className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 cursor-pointer transition-all group"
            >
              <div className="flex items-start gap-3">
                {rec.image && (
                  <img 
                    src={rec.image} 
                    alt="" 
                    className="w-16 h-12 object-cover rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-purple-400">{rec.category}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-8 relative">
                        <svg className="w-8 h-8 transform -rotate-90">
                          <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="none" className="text-white/10" />
                          <circle 
                            cx="16" cy="16" r="14" 
                            stroke="currentColor" 
                            strokeWidth="3" 
                            fill="none" 
                            strokeDasharray={`${rec.score * 0.88} 88`}
                            className="text-green-400 transition-all duration-1000"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-green-400">
                          {rec.score}
                        </span>
                      </div>
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
      <div className="mt-3 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
        <div className="flex items-center gap-2 mb-1">
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
