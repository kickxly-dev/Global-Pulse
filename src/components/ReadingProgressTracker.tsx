'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Clock, Target, TrendingUp, Award } from 'lucide-react'

interface ReadingStats {
  articlesRead: number
  timeSpent: number // in minutes
  streak: number
  favoriteCategory: string
  lastRead: Date | null
}

export default function ReadingProgressTracker() {
  const [stats, setStats] = useState<ReadingStats>({
    articlesRead: 0,
    timeSpent: 0,
    streak: 0,
    favoriteCategory: 'Technology',
    lastRead: null
  })
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Load stats from localStorage
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('readingStats')
        if (saved) {
          const parsed = JSON.parse(saved)
          setStats({
            ...parsed,
            lastRead: parsed.lastRead ? new Date(parsed.lastRead) : null
          })
        }
      }
    } catch (e) {
      console.error('Error loading reading stats:', e)
    }
  }, [])

  const getLevel = () => {
    if (stats.articlesRead >= 100) return { name: 'News Master', color: 'text-purple-400', icon: Award }
    if (stats.articlesRead >= 50) return { name: 'Expert Reader', color: 'text-blue-400', icon: TrendingUp }
    if (stats.articlesRead >= 20) return { name: 'Active Reader', color: 'text-green-400', icon: BookOpen }
    return { name: 'Beginner', color: 'text-gray-400', icon: BookOpen }
  }

  const level = getLevel()
  const LevelIcon = level.icon

  return (
    <div className="cyber-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyber-blue/20 rounded-lg">
            <BookOpen className="w-5 h-5 text-cyber-blue" />
          </div>
          <h3 className="text-lg font-bold text-white">Reading Progress</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-cyber-blue hover:text-cyber-blue/80 transition-colors"
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
      </div>

      {/* Level Badge */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-xl">
        <div className={`p-2 rounded-lg bg-white/10`}>
          <LevelIcon className={`w-6 h-6 ${level.color}`} />
        </div>
        <div>
          <p className={`text-sm font-bold ${level.color}`}>{level.name}</p>
          <p className="text-xs text-gray-500">{stats.articlesRead} articles read</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-3 h-3 text-cyber-blue" />
            <span className="text-xs text-gray-500">Articles</span>
          </div>
          <p className="text-xl font-bold text-white">{stats.articlesRead}</p>
        </div>

        <div className="p-3 bg-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3 h-3 text-cyber-green" />
            <span className="text-xs text-gray-500">Time</span>
          </div>
          <p className="text-xl font-bold text-white">{stats.timeSpent}m</p>
        </div>

        <div className="p-3 bg-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-3 h-3 text-cyber-yellow" />
            <span className="text-xs text-gray-500">Streak</span>
          </div>
          <p className="text-xl font-bold text-white">{stats.streak}d</p>
        </div>

        <div className="p-3 bg-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3 h-3 text-cyber-purple" />
            <span className="text-xs text-gray-500">Top Category</span>
          </div>
          <p className="text-sm font-bold text-white truncate">{stats.favoriteCategory}</p>
        </div>
      </div>

      {/* Progress to Next Level */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress to next level</span>
          <span>{stats.articlesRead % 20}/20</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple"
            initial={{ width: 0 }}
            animate={{ width: `${((stats.articlesRead % 20) / 20) * 100}%` }}
          />
        </div>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-white/10"
        >
          <h4 className="text-sm font-medium text-white mb-3">Achievements</h4>
          <div className="space-y-2">
            <div className={`flex items-center gap-2 p-2 rounded-lg ${stats.articlesRead >= 1 ? 'bg-green-500/10' : 'bg-white/5'}`}>
              <Award className={`w-4 h-4 ${stats.articlesRead >= 1 ? 'text-green-400' : 'text-gray-600'}`} />
              <span className={`text-sm ${stats.articlesRead >= 1 ? 'text-green-400' : 'text-gray-600'}`}>First Article</span>
            </div>
            <div className={`flex items-center gap-2 p-2 rounded-lg ${stats.articlesRead >= 10 ? 'bg-green-500/10' : 'bg-white/5'}`}>
              <Award className={`w-4 h-4 ${stats.articlesRead >= 10 ? 'text-green-400' : 'text-gray-600'}`} />
              <span className={`text-sm ${stats.articlesRead >= 10 ? 'text-green-400' : 'text-gray-600'}`}>10 Articles Club</span>
            </div>
            <div className={`flex items-center gap-2 p-2 rounded-lg ${stats.articlesRead >= 50 ? 'bg-green-500/10' : 'bg-white/5'}`}>
              <Award className={`w-4 h-4 ${stats.articlesRead >= 50 ? 'text-green-400' : 'text-gray-600'}`} />
              <span className={`text-sm ${stats.articlesRead >= 50 ? 'text-green-400' : 'text-gray-600'}`}>50 Articles Master</span>
            </div>
            <div className={`flex items-center gap-2 p-2 rounded-lg ${stats.articlesRead >= 100 ? 'bg-green-500/10' : 'bg-white/5'}`}>
              <Award className={`w-4 h-4 ${stats.articlesRead >= 100 ? 'text-green-400' : 'text-gray-600'}`} />
              <span className={`text-sm ${stats.articlesRead >= 100 ? 'text-green-400' : 'text-gray-600'}`}>News Legend</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
