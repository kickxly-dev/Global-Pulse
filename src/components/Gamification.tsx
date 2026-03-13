'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Flame, Target, Award, Zap, Gift, Crown, Medal, Lock } from 'lucide-react'

interface Achievement {
  id: string
  name: string
  description: string
  icon: any
  unlocked: boolean
  progress: number
  total: number
  reward: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface UserStats {
  level: number
  xp: number
  xpToNext: number
  totalXp: number
  streak: number
  articlesRead: number
  quizzesCompleted: number
  achievementsUnlocked: number
}

export default function Gamification() {
  const [stats, setStats] = useState<UserStats>({
    level: 12,
    xp: 2450,
    xpToNext: 3000,
    totalXp: 24500,
    streak: 7,
    articlesRead: 156,
    quizzesCompleted: 23,
    achievementsUnlocked: 8
  })
  
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      name: 'News Explorer',
      description: 'Read 100 articles',
      icon: Target,
      unlocked: true,
      progress: 156,
      total: 100,
      reward: 500,
      rarity: 'common'
    },
    {
      id: '2',
      name: 'Quiz Master',
      description: 'Complete 20 quizzes',
      icon: Trophy,
      unlocked: true,
      progress: 23,
      total: 20,
      reward: 750,
      rarity: 'rare'
    },
    {
      id: '3',
      name: 'Week Warrior',
      description: '7-day reading streak',
      icon: Flame,
      unlocked: true,
      progress: 7,
      total: 7,
      reward: 1000,
      rarity: 'epic'
    },
    {
      id: '4',
      name: 'Night Owl',
      description: 'Read news between 12am-5am',
      icon: Star,
      unlocked: false,
      progress: 0,
      total: 1,
      reward: 300,
      rarity: 'common'
    },
    {
      id: '5',
      name: 'Speed Reader',
      description: 'Read 50 articles in one day',
      icon: Zap,
      unlocked: false,
      progress: 23,
      total: 50,
      reward: 2000,
      rarity: 'legendary'
    },
    {
      id: '6',
      name: 'Fact Checker',
      description: 'Verify 10 articles',
      icon: Award,
      unlocked: true,
      progress: 12,
      total: 10,
      reward: 600,
      rarity: 'rare'
    }
  ])

  const [showRewards, setShowRewards] = useState(false)

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-amber-500 to-orange-500'
      case 'epic': return 'from-purple-500 to-pink-500'
      case 'rare': return 'from-blue-500 to-cyan-500'
      default: return 'from-gray-500 to-gray-400'
    }
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-amber-500/30'
      case 'epic': return 'border-purple-500/30'
      case 'rare': return 'border-blue-500/30'
      default: return 'border-white/10'
    }
  }

  const levelProgress = (stats.xp / stats.xpToNext) * 100

  return (
    <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <h3 className="font-semibold">Achievements</h3>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-bold text-yellow-400">Level {stats.level}</span>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-white/40 mb-1">
          <span>XP: {stats.xp.toLocaleString()} / {stats.xpToNext.toLocaleString()}</span>
          <span>{stats.totalXp.toLocaleString()} total</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            className="h-full bg-gradient-to-r from-yellow-500 to-amber-500"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="p-2 bg-white/5 rounded-lg text-center">
          <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
          <div className="text-lg font-bold">{stats.streak}</div>
          <div className="text-xs text-white/40">Streak</div>
        </div>
        <div className="p-2 bg-white/5 rounded-lg text-center">
          <Target className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
          <div className="text-lg font-bold">{stats.articlesRead}</div>
          <div className="text-xs text-white/40">Read</div>
        </div>
        <div className="p-2 bg-white/5 rounded-lg text-center">
          <Trophy className="w-4 h-4 text-purple-400 mx-auto mb-1" />
          <div className="text-lg font-bold">{stats.quizzesCompleted}</div>
          <div className="text-xs text-white/40">Quizzes</div>
        </div>
        <div className="p-2 bg-white/5 rounded-lg text-center">
          <Medal className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
          <div className="text-lg font-bold">{stats.achievementsUnlocked}</div>
          <div className="text-xs text-white/40">Badges</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-white/40 mb-2">
          <span>Achievements</span>
          <span>{stats.achievementsUnlocked}/{achievements.length} unlocked</span>
        </div>
        
        {achievements.map((achievement, i) => {
          const Icon = achievement.icon
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-3 rounded-lg border ${
                achievement.unlocked
                  ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)}/10 ${getRarityBorder(achievement.rarity)}`
                  : 'bg-white/5 border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  achievement.unlocked
                    ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)}`
                    : 'bg-white/10'
                }`}>
                  {achievement.unlocked ? (
                    <Icon className="w-4 h-4 text-white" />
                  ) : (
                    <Lock className="w-4 h-4 text-white/40" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{achievement.name}</span>
                    <span className={`px-1.5 py-0.5 text-xs rounded capitalize ${
                      achievement.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-400' :
                      achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                      achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-white/10 text-white/40'
                    }`}>
                      {achievement.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-white/50">{achievement.description}</p>
                  
                  {/* Progress */}
                  {!achievement.unlocked && achievement.progress > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-white/40 mb-1">
                        <span>{achievement.progress}/{achievement.total}</span>
                        <span>+{achievement.reward} XP</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 to-amber-500"
                          style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {achievement.unlocked && (
                    <div className="text-xs text-yellow-400 mt-1">
                      +{achievement.reward} XP earned
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Daily Bonus */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowRewards(true)}
        className="w-full mt-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg font-medium text-black flex items-center justify-center gap-2"
      >
        <Gift className="w-4 h-4" />
        Claim Daily Bonus (+100 XP)
      </motion.button>

      {/* Rewards Modal */}
      <AnimatePresence>
        {showRewards && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowRewards(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-black border border-yellow-500/30 rounded-2xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-2">Daily Bonus Claimed!</h3>
              <p className="text-white/60 mb-4">You earned 100 XP</p>
              <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 mb-4">
                <div className="text-2xl font-bold text-yellow-400">+100 XP</div>
              </div>
              <p className="text-xs text-white/40">Come back tomorrow for another bonus!</p>
              <button
                onClick={() => setShowRewards(false)}
                className="mt-4 px-6 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
