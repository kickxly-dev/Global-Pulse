'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Flame, 
  Zap, 
  Star, 
  Target, 
  TrendingUp,
  Users,
  Crown,
  Medal,
  Award,
  Calendar,
  Clock
} from 'lucide-react'
import {
  getUserProfile,
  getUserAchievements,
  getLeaderboard,
  getDailyChallenges,
  getUserChallenges,
  updateStreak,
  getUserStats,
  type UserProfile,
  type UserAchievement,
  type LeaderboardEntry,
  type DailyChallenge,
  type UserChallenge
} from '@/lib/database'

interface StreakData {
  current: number
  longest: number
  lastActive: string
  protected: boolean
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  progress: number
  maxProgress: number
  unlocked: boolean
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
}

interface EnhancedGamificationProps {
  userId?: string
}

const achievementIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'news-explorer': Star,
  'trend-spotter': TrendingUp,
  'knowledge-seeker': Flame,
  'master-reader': Trophy,
  'social-butterfly': Users,
  'category-collector': Target,
  'speed-reader': Clock,
  'bookmark-enthusiast': Award
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'from-gray-500 to-gray-600'
    case 'rare': return 'from-blue-500 to-purple-500'
    case 'epic': return 'from-purple-500 to-pink-500'
    case 'legendary': return 'from-yellow-500 to-orange-500'
    default: return 'from-gray-500 to-gray-600'
  }
}

const getRarityBorder = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'border-gray-500/30'
    case 'rare': return 'border-blue-500/30'
    case 'epic': return 'border-purple-500/30'
    case 'legendary': return 'border-yellow-500/30'
    default: return 'border-gray-500/30'
  }
}

export default function EnhancedGamification({ userId = 'user1' }: EnhancedGamificationProps) {
  const [streak, setStreak] = useState<StreakData>({
    current: 0,
    longest: 0,
    lastActive: 'Today',
    protected: false
  })
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([])
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'streak' | 'achievements' | 'leaderboard'>('streak')
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (!userId) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch user profile and update streak
        const profile = await getUserProfile(userId)
        if (profile) {
          const streakData = await updateStreak(userId)
          setStreak({
            current: streakData.current,
            longest: streakData.longest,
            lastActive: new Date(profile.last_active).toLocaleDateString(),
            protected: streakData.isProtected
          })
        }

        // Fetch achievements
        const userAchievements = await getUserAchievements(userId)
        const achievementsData: Achievement[] = userAchievements.map(ua => ({
          id: ua.achievement_id,
          title: ua.achievement?.title || 'Unknown Achievement',
          description: ua.achievement?.description || '',
          icon: achievementIcons[ua.achievement?.icon || ''] || Star,
          progress: ua.progress,
          maxProgress: ua.max_progress,
          unlocked: ua.unlocked,
          rarity: ua.achievement?.rarity || 'common',
          points: ua.achievement?.points || 0
        }))
        setAchievements(achievementsData)

        // Fetch leaderboard
        const leaderboardData = await getLeaderboard(5)
        setLeaderboard(leaderboardData)

        // Fetch daily challenges and user progress
        const challengesData = await getDailyChallenges()
        const userChallengesData = await getUserChallenges(userId)
        setDailyChallenges(challengesData)
        setUserChallenges(userChallengesData)

      } catch (error) {
        console.error('Error fetching gamification data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-4 h-4 text-yellow-400" />
      case 2: return <Medal className="w-4 h-4 text-gray-300" />
      case 3: return <Award className="w-4 h-4 text-orange-400" />
      default: return <span className="text-sm font-bold text-white/60">{rank}</span>
    }
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3 text-green-400" />
    if (change < 0) return <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />
    return <div className="w-3 h-3 bg-white/30 rounded-full" />
  }

  const getChallengeProgress = (challengeId: string) => {
    const userChallenge = userChallenges.find(uc => uc.challenge_id === challengeId)
    return userChallenge?.progress || 0
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="font-semibold">Your Progress</h3>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <motion.div
            className="absolute inset-0 bg-amber-400 rounded-full blur-sm"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['streak', 'achievements', 'leaderboard'] as const).map((tab) => (
          <motion.button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'streak' && (
          <motion.div
            key="streak"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Streak Display */}
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="font-bold text-lg">{streak.current}</span>
                  <span className="text-xs text-white/60">day streak</span>
                </div>
                {streak.protected && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30"
                  >
                    Protected
                  </motion.div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-white/40">Longest</span>
                  <p className="font-semibold">{streak.longest} days</p>
                </div>
                <div>
                  <span className="text-white/40">Last Active</span>
                  <p className="font-semibold">{streak.lastActive}</p>
                </div>
              </div>

              {/* Streak Calendar */}
              <div className="mt-4">
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const isActive = i < 30 - streak.current
                    const isToday = i === 29
                    return (
                      <motion.div
                        key={i}
                        className={`aspect-square rounded ${
                          isActive 
                            ? 'bg-orange-500/30 border border-orange-500/50' 
                            : 'bg-white/5 border border-white/10'
                        } ${isToday ? 'ring-2 ring-orange-400' : ''}`}
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.2 }}
                      />
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Daily Challenges */}
            {dailyChallenges.map((challenge, i) => {
              const progress = getChallengeProgress(challenge.id)
              return (
                <div key={challenge.id} className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-medium">{challenge.title}</span>
                    <span className="text-xs text-cyan-400">+{challenge.points}</span>
                  </div>
                  <p className="text-xs text-white/60 mb-3">{challenge.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-white/10 rounded-full h-2 mr-3">
                      <motion.div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                      />
                    </div>
                    <span className="text-xs text-white/60">{Math.floor(progress)}/{challenge.target_value}</span>
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {achievements.map((achievement, i) => {
              const Icon = achievement.icon
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-3 rounded-xl border transition-all ${
                    achievement.unlocked
                      ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)}/10 ${getRarityBorder(achievement.rarity)}`
                      : 'bg-white/5 border-white/10'
                  }`}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      className={`p-2 rounded-lg ${
                        achievement.unlocked
                          ? 'bg-white/20'
                          : 'bg-white/5'
                      }`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className={`w-4 h-4 ${
                        achievement.unlocked ? 'text-white' : 'text-white/40'
                      }`} />
                    </motion.div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold">{achievement.title}</h4>
                        <span className="text-xs text-white/60">+{achievement.points}</span>
                      </div>
                      <p className="text-xs text-white/60 mb-2">{achievement.description}</p>
                      
                      {!achievement.unlocked && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white/10 rounded-full h-1.5">
                            <motion.div
                              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                              transition={{ duration: 1, delay: i * 0.2 }}
                            />
                          </div>
                          <span className="text-xs text-white/40">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {leaderboard.map((entry, i) => (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  entry.user_id === userId
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(entry.rank)}
                </div>
                
                <div className="text-lg">{entry.avatar_url || '👤'}</div>
                
                <div className="flex-1">
                  <p className="text-sm font-medium">{entry.name}</p>
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span>{entry.points.toLocaleString()} pts</span>
                    <div className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      <span>{entry.streak}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getChangeIcon((entry.previous_rank || entry.rank) - entry.rank)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-amber-400 rounded-full"
                initial={{
                  x: Math.random() * 100 - 50,
                  y: -50,
                  rotate: 0
                }}
                animate={{
                  y: 100,
                  rotate: 360,
                  opacity: 0
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut"
                }}
                style={{
                  left: `${Math.random() * 100}%`
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
