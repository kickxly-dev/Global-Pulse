'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, TrendingUp, Globe, Zap } from 'lucide-react'

interface PulseScoreProps {
  articles: any[]
  totalResults: number
}

export default function PulseScore({ articles, totalResults }: PulseScoreProps) {
  const [pulseScore, setPulseScore] = useState(0)
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable')
  const [previousScore, setPreviousScore] = useState(0)
  const [recentActivity, setRecentActivity] = useState(0)

  useEffect(() => {
    // Calculate pulse score based on multiple factors
    const calculateScore = () => {
      const now = Date.now()
      
      // Count articles from last hour (breaking news)
      const breakingNews = articles.filter(article => {
        const publishedTime = new Date(article.publishedAt).getTime()
        return (now - publishedTime) < (60 * 60 * 1000) // 1 hour
      }).length

      // Count articles from last 3 hours (recent)
      const recentNews = articles.filter(article => {
        const publishedTime = new Date(article.publishedAt).getTime()
        return (now - publishedTime) < (3 * 60 * 60 * 1000) // 3 hours
      }).length

      // Calculate score (weighted formula)
      const score = Math.min(100, Math.round(
        (breakingNews * 5) + // Breaking news has highest weight
        (recentNews * 2) + // Recent news has medium weight
        (totalResults * 0.1) // Total results has lower weight
      ))

      // Determine trend
      if (score > previousScore + 5) {
        setTrend('up')
      } else if (score < previousScore - 5) {
        setTrend('down')
      } else {
        setTrend('stable')
      }

      setPreviousScore(pulseScore)
      setPulseScore(score)
      setRecentActivity(breakingNews)
    }

    calculateScore()
    const interval = setInterval(calculateScore, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [articles, totalResults, pulseScore, previousScore])

  const getScoreColor = () => {
    if (pulseScore > 75) return 'text-cyber-red'
    if (pulseScore > 50) return 'text-cyber-yellow'
    if (pulseScore > 25) return 'text-cyber-blue'
    return 'text-cyber-green'
  }

  const getActivityLevel = () => {
    if (pulseScore > 75) return 'CRITICAL'
    if (pulseScore > 50) return 'HIGH'
    if (pulseScore > 25) return 'MODERATE'
    return 'LOW'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="cyber-card relative overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(255,0,64,0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(0,212,255,0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, rgba(189,0,255,0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(255,0,64,0.3) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute inset-0"
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-cyber text-cyber-purple">
            Global Pulse Score
          </h3>
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-cyber-blue animate-spin-slow" />
            <Zap className="w-4 h-4 text-cyber-yellow animate-pulse" />
          </div>
        </div>

        {/* Main Score Display */}
        <div className="text-center mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={pulseScore}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`text-6xl font-bold font-mono ${getScoreColor()} relative`}
            >
              {pulseScore}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute -right-8 top-0 text-2xl"
              >
                °
              </motion.span>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center space-x-2 mt-2">
            {trend === 'up' && (
              <TrendingUp className="w-5 h-5 text-cyber-green animate-bounce" />
            )}
            {trend === 'down' && (
              <TrendingUp className="w-5 h-5 text-cyber-red rotate-180" />
            )}
            <span className={`text-sm font-medium ${getScoreColor()}`}>
              {getActivityLevel()} ACTIVITY
            </span>
          </div>
        </div>

        {/* Live Stats */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Breaking Stories</span>
            <span className="text-cyber-red font-bold animate-pulse">
              {recentActivity}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Total Active</span>
            <span className="text-cyber-blue font-bold">{totalResults}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Trend</span>
            <span className={`font-bold ${
              trend === 'up' ? 'text-cyber-green' : 
              trend === 'down' ? 'text-cyber-red' : 
              'text-gray-400'
            }`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {Math.abs(pulseScore - previousScore)}%
            </span>
          </div>
        </div>

        {/* Activity Bar */}
        <div className="mt-4">
          <div className="h-2 bg-cyber-dark rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${pulseScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full ${
                pulseScore > 75 ? 'bg-gradient-to-r from-cyber-red to-cyber-yellow' :
                pulseScore > 50 ? 'bg-gradient-to-r from-cyber-yellow to-cyber-blue' :
                pulseScore > 25 ? 'bg-gradient-to-r from-cyber-blue to-cyber-green' :
                'bg-cyber-green'
              }`}
            />
          </div>
        </div>

        {/* Real-time indicator */}
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>Live monitoring {articles.length} sources</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
