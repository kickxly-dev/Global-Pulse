'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Flame, Users, Shield, Crown, Medal, Star, Zap, Calendar, Gift, Lock, Unlock, ChevronRight, Target } from 'lucide-react'

interface LeaderboardEntry {
  id: string
  rank: number
  name: string
  avatar: string
  xp: number
  level: number
  streak: number
  isCurrentUser?: boolean
}

interface Team {
  id: string
  name: string
  members: number
  totalXp: number
  rank: number
}

interface SpecialEvent {
  id: string
  name: string
  description: string
  multiplier: number
  startDate: string
  endDate: string
  isActive: boolean
  type: 'xp_weekend' | 'challenge' | 'tournament'
}

export default function AdvancedGamification() {
  const [activeTab, setActiveTab] = useState<'achievements' | 'leaderboard' | 'teams' | 'events'>('achievements')
  const [streakFreezes, setStreakFreezes] = useState(2)
  const [dailyLoginDay, setDailyLoginDay] = useState(5)
  
  const [leaderboard] = useState<LeaderboardEntry[]>([
    { id: '1', rank: 1, name: 'Sarah Chen', avatar: '👩‍💼', xp: 45200, level: 28, streak: 45 },
    { id: '2', rank: 2, name: 'Mike Johnson', avatar: '👨‍💻', xp: 38900, level: 24, streak: 32 },
    { id: '3', rank: 3, name: 'Emma Wilson', avatar: '👩‍🔬', xp: 34500, level: 22, streak: 28 },
    { id: '4', rank: 4, name: 'You', avatar: '👤', xp: 24500, level: 12, streak: 7, isCurrentUser: true },
    { id: '5', rank: 5, name: 'Alex Kumar', avatar: '👨‍🎓', xp: 22100, level: 11, streak: 15 },
    { id: '6', rank: 6, name: 'Lisa Park', avatar: '👩‍🎨', xp: 19800, level: 10, streak: 12 },
  ])

  const [teams] = useState<Team[]>([
    { id: '1', name: 'Tech Readers', members: 24, totalXp: 125000, rank: 1 },
    { id: '2', name: 'Climate Watchers', members: 18, totalXp: 98000, rank: 2 },
    { id: '3', name: 'News Junkies', members: 32, totalXp: 87000, rank: 3 },
  ])

  const [events] = useState<SpecialEvent[]>([
    { id: '1', name: '2x XP Weekend', description: 'Double XP on all reading activities!', multiplier: 2, startDate: 'Now', endDate: 'Sunday 11:59pm', isActive: true, type: 'xp_weekend' },
    { id: '2', name: 'Breaking News Challenge', description: 'Read 10 breaking stories for bonus XP', multiplier: 1.5, startDate: 'Monday', endDate: 'Friday', isActive: false, type: 'challenge' },
  ])

  const dailyBonus = [50, 75, 100, 150, 200, 300, 500]

  const useStreakFreeze = () => {
    if (streakFreezes > 0) {
      setStreakFreezes(prev => prev - 1)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-400" />
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-300" />
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />
    return <span className="text-xs font-bold">{rank}</span>
  }

  return (
    <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <h3 className="font-semibold">Gamification</h3>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-bold text-yellow-400">Level 12</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {[
          { id: 'achievements', label: 'Achievements', icon: Trophy },
          { id: 'leaderboard', label: 'Leaderboard', icon: Crown },
          { id: 'teams', label: 'Teams', icon: Users },
          { id: 'events', label: 'Events', icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {/* Streak Protection */}
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">Streak Protection</span>
              </div>
              <span className="text-xs text-white/40">{streakFreezes}/2 freezes left</span>
            </div>
            <p className="text-xs text-white/50 mb-2">Protect your streak when you can't read</p>
            <button
              onClick={useStreakFreeze}
              disabled={streakFreezes === 0}
              className="w-full py-2 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {streakFreezes > 0 ? 'Use Streak Freeze' : 'No Freezes Available'}
            </button>
          </div>

          {/* Daily Login Bonus */}
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">Daily Login Bonus</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {dailyBonus.map((bonus, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg text-center ${
                    i < dailyLoginDay
                      ? 'bg-green-500/20 border border-green-500/30'
                      : i === dailyLoginDay
                      ? 'bg-yellow-500/20 border border-yellow-500/30 ring-2 ring-yellow-400'
                      : 'bg-white/5 border border-white/5'
                  }`}
                >
                  <div className="text-xs text-white/40">Day {i + 1}</div>
                  <div className={`text-xs font-bold ${i < dailyLoginDay ? 'text-green-400' : i === dailyLoginDay ? 'text-yellow-400' : 'text-white/40'}`}>
                    +{bonus}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-xs font-medium text-black flex items-center justify-center gap-1 animate-pulse hover:animate-none hover:scale-105 transition-all">
              <Gift className="w-3 h-3" />
              Claim Today's Bonus (+{dailyBonus[dailyLoginDay]} XP)
            </button>
          </div>

          {/* Topic Mastery */}
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium">Topic Mastery</span>
            </div>
            <div className="space-y-2">
              {[
                { topic: 'Technology', progress: 75, level: 'Expert', icon: '💻' },
                { topic: 'World News', progress: 45, level: 'Intermediate', icon: '🌍' },
                { topic: 'Science', progress: 20, level: 'Beginner', icon: '🔬' },
              ].map((topic) => (
                <div key={topic.topic} className="flex items-center gap-2">
                  <span className="text-lg">{topic.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs">{topic.topic}</span>
                      <span className="text-xs text-purple-400">{topic.level}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${topic.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-white/40 mb-2">
            <span>Rankings</span>
            <span>This Week</span>
          </div>
          {leaderboard.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-lg border ${
                entry.isCurrentUser
                  ? 'bg-yellow-500/20 border-yellow-500/30'
                  : 'bg-white/5 border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                <span className="text-xl">{entry.avatar}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{entry.name}</span>
                    {entry.isCurrentUser && <span className="text-xs text-yellow-400">(You)</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span>Lv.{entry.level}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      {entry.streak} day streak
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-yellow-400">{entry.xp.toLocaleString()}</div>
                  <div className="text-xs text-white/40">XP</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="text-xs text-white/40 mb-2">Your Team</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Tech Readers</div>
                <div className="text-xs text-white/40">24 members • Rank #1</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-purple-400">125K</div>
                <div className="text-xs text-white/40">Team XP</div>
              </div>
            </div>
          </div>

          <div className="text-xs text-white/40 mb-2">Team Leaderboard</div>
          {teams.map((team) => (
            <div key={team.id} className="p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  {getRankIcon(team.rank)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{team.name}</div>
                  <div className="text-xs text-white/40">{team.members} members</div>
                </div>
                <div className="text-sm font-bold">{team.totalXp.toLocaleString()} XP</div>
              </div>
            </div>
          ))}

          <button className="w-full py-2 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
            <Users className="w-3 h-3" />
            Create New Team
          </button>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className={`p-3 rounded-lg border ${
                event.isActive
                  ? 'bg-yellow-500/20 border-yellow-500/30'
                  : 'bg-white/5 border-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${event.isActive ? 'text-yellow-400' : 'text-white/40'}`} />
                  <span className="text-sm font-medium">{event.name}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  event.isActive ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'
                }`}>
                  {event.isActive ? 'Active' : 'Upcoming'}
                </span>
              </div>
              <p className="text-xs text-white/50 mb-2">{event.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">{event.startDate} - {event.endDate}</span>
                <span className="text-yellow-400 font-bold">{event.multiplier}x XP</span>
              </div>
            </div>
          ))}

          <div className="p-3 bg-white/5 rounded-lg border border-dashed border-white/20 text-center">
            <Lock className="w-4 h-4 text-white/40 mx-auto mb-2" />
            <p className="text-xs text-white/40">More events coming soon!</p>
          </div>
        </div>
      )}
    </div>
  )
}
