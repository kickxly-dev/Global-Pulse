'use client'

import { motion } from 'framer-motion'
import { 
  BarChart3, Clock, BookOpen, Globe, TrendingUp, 
  Flame, Calendar, Newspaper, Eye, Award
} from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { formatDistanceToNow } from 'date-fns'

export default function AnalyticsDashboard() {
  const { stats, dailyStats, isLoaded } = useAnalytics()

  if (!isLoaded) {
    return (
      <div className="cyber-card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  const last7Days = dailyStats.slice(-7)
  const maxArticles = last7Days.length > 0 ? Math.max(...last7Days.map(d => d.articlesRead), 1) : 1

  // Show empty state if no data
  if (stats.totalArticlesRead === 0) {
    return (
      <div className="cyber-card text-center py-8">
        <BarChart3 className="w-12 h-12 text-cyber-blue mx-auto mb-4" />
        <h2 className="text-lg font-bold font-cyber text-cyber-blue mb-2">
          Reading Analytics
        </h2>
        <p className="text-gray-400 mb-4">Start reading articles to see your stats!</p>
        <div className="text-sm text-gray-500">
          Your reading history will appear here
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="cyber-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-cyber-blue" />
            <h2 className="text-lg font-bold font-cyber text-cyber-blue">
              Reading Analytics
            </h2>
          </div>
          {stats.lastReadDate && (
            <span className="text-xs text-gray-500">
              Last read {formatDistanceToNow(new Date(stats.lastReadDate), { addSuffix: true })}
            </span>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-cyber-dark/50 border border-cyber-blue/20 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Newspaper className="w-4 h-4 text-cyber-blue" />
              <span className="text-xs text-gray-400">Articles Read</span>
            </div>
            <p className="text-2xl font-bold text-gray-100">{stats.totalArticlesRead}</p>
          </div>

          <div className="bg-cyber-dark/50 border border-cyber-blue/20 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-4 h-4 text-cyber-purple" />
              <span className="text-xs text-gray-400">Reading Time</span>
            </div>
            <p className="text-2xl font-bold text-gray-100">{stats.totalReadingTime} min</p>
          </div>

          <div className="bg-cyber-dark/50 border border-cyber-blue/20 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Flame className="w-4 h-4 text-cyber-yellow" />
              <span className="text-xs text-gray-400">Streak</span>
            </div>
            <p className="text-2xl font-bold text-gray-100">{stats.streakDays} days</p>
          </div>

          <div className="bg-cyber-dark/50 border border-cyber-blue/20 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Globe className="w-4 h-4 text-cyber-green" />
              <span className="text-xs text-gray-400">Countries</span>
            </div>
            <p className="text-2xl font-bold text-gray-100">
              {Object.keys(stats.countriesExplored).length}
            </p>
          </div>
        </div>
      </div>

      {/* Last 7 Days Chart */}
      {last7Days.length > 0 && (
        <div className="cyber-card">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-4 h-4 text-cyber-blue" />
            <span className="text-sm font-medium text-gray-300">Last 7 Days</span>
          </div>
          
          <div className="flex items-end space-x-2 h-32">
            {last7Days.map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ height: 0 }}
                animate={{ height: `${(day.articlesRead / maxArticles) * 100}%` }}
                transition={{ delay: index * 0.1 }}
                className="flex-1 bg-gradient-to-t from-cyber-blue to-cyber-purple rounded-t relative group"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-white bg-cyber-dark px-2 py-1 rounded">
                    {day.articlesRead}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {last7Days.map(day => (
              <span key={day.date} className="flex-1 text-center">
                {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top Categories & Sources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top Categories */}
        <div className="cyber-card">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-4 h-4 text-cyber-purple" />
            <span className="text-sm font-medium text-gray-300">Top Categories</span>
          </div>
          
          <div className="space-y-2">
            {Object.entries(stats.categoriesViewed)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([category, count], index) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 w-4">{index + 1}</span>
                    <span className="text-sm text-gray-300 capitalize">{category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-cyber-dark rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyber-purple"
                        style={{ width: `${(count / stats.totalArticlesRead) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Top Sources */}
        <div className="cyber-card">
          <div className="flex items-center space-x-2 mb-3">
            <Eye className="w-4 h-4 text-cyber-blue" />
            <span className="text-sm font-medium text-gray-300">Top Sources</span>
          </div>
          
          <div className="space-y-2">
            {Object.entries(stats.sourcesViewed)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([source, count], index) => (
                <div key={source} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 w-4">{index + 1}</span>
                    <span className="text-sm text-gray-300 truncate max-w-[120px]">{source}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-cyber-dark rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyber-blue"
                        style={{ width: `${(count / stats.totalArticlesRead) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="cyber-card">
        <div className="flex items-center space-x-2 mb-3">
          <Award className="w-4 h-4 text-cyber-yellow" />
          <span className="text-sm font-medium text-gray-300">Achievements</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <AchievementBadge
            title="First Read"
            description="Read your first article"
            unlocked={stats.totalArticlesRead >= 1}
          />
          <AchievementBadge
            title="Bookworm"
            description="Read 50 articles"
            unlocked={stats.totalArticlesRead >= 50}
          />
          <AchievementBadge
            title="Week Streak"
            description="7 day reading streak"
            unlocked={stats.streakDays >= 7}
          />
          <AchievementBadge
            title="Globe Trotter"
            description="Explore 10 countries"
            unlocked={Object.keys(stats.countriesExplored).length >= 10}
          />
        </div>
      </div>
    </div>
  )
}

function AchievementBadge({ 
  title, 
  description, 
  unlocked 
}: { 
  title: string
  description: string
  unlocked: boolean 
}) {
  return (
    <div className={`p-3 rounded-lg border ${
      unlocked 
        ? 'bg-cyber-yellow/10 border-cyber-yellow/30' 
        : 'bg-cyber-dark/50 border-gray-700 opacity-50'
    }`}>
      <p className={`text-xs font-bold ${unlocked ? 'text-cyber-yellow' : 'text-gray-500'}`}>
        {title}
      </p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  )
}
