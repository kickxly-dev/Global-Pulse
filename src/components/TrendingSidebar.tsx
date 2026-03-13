'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Hash, Flame, Zap, Clock } from 'lucide-react'

const trendingTopics = [
  { tag: 'AIRevolution', count: '125K', trend: 'up', category: 'tech' },
  { tag: 'ClimateAction', count: '98K', trend: 'up', category: 'world' },
  { tag: 'SpaceX', count: '87K', trend: 'up', category: 'science' },
  { tag: 'WorldCup2026', count: '76K', trend: 'stable', category: 'sports' },
  { tag: 'CryptoMarkets', count: '65K', trend: 'down', category: 'business' },
  { tag: 'HealthTech', count: '54K', trend: 'up', category: 'health' },
  { tag: 'Politics2024', count: '143K', trend: 'up', category: 'politics' },
  { tag: 'Entertainment', count: '89K', trend: 'stable', category: 'entertainment' },
]

const liveEvents = [
  { title: 'UN Climate Summit', status: 'live', viewers: '45K' },
  { title: 'Tech Conference 2024', status: 'starting', viewers: '12K' },
  { title: 'Market Opening Bell', status: 'live', viewers: '89K' },
]

export default function TrendingSidebar() {
  return (
    <div className="space-y-6">
      {/* Trending Topics */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold">Trending Now</h3>
          <span className="ml-auto text-xs text-white/40">Live</span>
        </div>
        
        <div className="space-y-3">
          {trendingTopics.map((topic, i) => (
            <motion.button
              key={topic.tag}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
                <Hash className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm group-hover:text-cyan-400 transition-colors">
                    #{topic.tag}
                  </span>
                  {topic.trend === 'up' && (
                    <Flame className="w-3 h-3 text-orange-400" />
                  )}
                </div>
                <span className="text-xs text-white/40">{topic.count} posts</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                topic.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' :
                topic.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                'bg-white/10 text-white/50'
              }`}>
                {topic.trend === 'up' ? '↑' : topic.trend === 'down' ? '↓' : '→'}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Live Events */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-red-400" />
          <h3 className="font-semibold">Live Events</h3>
          <span className="relative flex h-2 w-2 ml-auto">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        </div>
        
        <div className="space-y-3">
          {liveEvents.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{event.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  event.status === 'live' 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {event.status === 'live' ? 'LIVE' : 'Starting Soon'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Clock className="w-3 h-3" />
                <span>{event.viewers} watching</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-5">
        <h3 className="font-semibold mb-3">Today's Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="text-2xl font-bold text-cyan-400">2.4K</div>
            <div className="text-xs text-white/40">Articles</div>
          </div>
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="text-2xl font-bold text-emerald-400">156</div>
            <div className="text-xs text-white/40">Sources</div>
          </div>
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">89</div>
            <div className="text-xs text-white/40">Countries</div>
          </div>
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-400">12</div>
            <div className="text-xs text-white/40">Breaking</div>
          </div>
        </div>
      </div>
    </div>
  )
}
