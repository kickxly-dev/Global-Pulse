'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, ThumbsUp, ThumbsDown, CheckCircle, Clock, TrendingUp, Star } from 'lucide-react'

interface CuratedList {
  id: string
  name: string
  description: string
  curator: {
    name: string
    avatar: string
    verified: boolean
  }
  articles: number
  followers: number
  trending: boolean
  category: string
}

interface CollaborativeCurationProps {
  onCreateList?: () => void
}

export default function CollaborativeCuration({ onCreateList }: CollaborativeCurationProps) {
  const [lists, setLists] = useState<CuratedList[]>([
    {
      id: '1',
      name: 'Climate Crisis Coverage',
      description: 'Essential reading on climate change and environmental policy',
      curator: { name: 'Sarah Chen', avatar: '👩‍💼', verified: true },
      articles: 45,
      followers: 2340,
      trending: true,
      category: 'Environment'
    },
    {
      id: '2',
      name: 'AI Revolution',
      description: 'The latest developments in artificial intelligence',
      curator: { name: 'Alex Kumar', avatar: '👨‍💻', verified: false },
      articles: 38,
      followers: 1890,
      trending: true,
      category: 'Technology'
    },
    {
      id: '3',
      name: 'Global Markets Watch',
      description: 'Market analysis and economic news from around the world',
      curator: { name: 'Emma Wilson', avatar: '👩‍🔬', verified: true },
      articles: 62,
      followers: 3200,
      trending: false,
      category: 'Business'
    },
    {
      id: '4',
      name: 'Space Exploration',
      description: 'Mars missions, satellite launches, and cosmic discoveries',
      curator: { name: 'Mike Johnson', avatar: '👨‍🚀', verified: false },
      articles: 29,
      followers: 1560,
      trending: false,
      category: 'Science'
    }
  ])
  
  const [selectedList, setSelectedList] = useState<string | null>(null)
  const [vote, setVote] = useState<{ [key: string]: 'up' | 'down' | null }>({})

  const handleVote = (listId: string, direction: 'up' | 'down') => {
    setVote(prev => ({
      ...prev,
      [listId]: prev[listId] === direction ? null : direction
    }))
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-400" />
          <h3 className="font-semibold">Community Lists</h3>
        </div>
        <button
          onClick={onCreateList}
          className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-500/30 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Create
        </button>
      </div>

      <p className="text-xs text-white/40 mb-4">
        Curated news collections by the community
      </p>

      {/* Lists */}
      <div className="space-y-3">
        {lists.map((list, i) => (
          <motion.div
            key={list.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              selectedList === list.id
                ? 'bg-amber-500/20 border-amber-500/30'
                : 'bg-white/5 border-white/5 hover:border-white/10'
            }`}
            onClick={() => setSelectedList(selectedList === list.id ? null : list.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{list.curator.avatar}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{list.name}</span>
                    {list.trending && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">
                        <TrendingUp className="w-3 h-3" />
                        Hot
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span>by {list.curator.name}</span>
                    {list.curator.verified && <CheckCircle className="w-3 h-3 text-amber-400" />}
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-white/10 text-xs rounded">
                {list.category}
              </span>
            </div>

            <p className="text-xs text-white/60 mb-3">{list.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {list.articles} articles
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {list.followers.toLocaleString()} followers
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleVote(list.id, 'up')
                  }}
                  className={`p-1.5 rounded transition-colors ${
                    vote[list.id] === 'up' ? 'bg-green-500/20 text-green-400' : 'hover:bg-white/10 text-white/40'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleVote(list.id, 'down')
                  }}
                  className={`p-1.5 rounded transition-colors ${
                    vote[list.id] === 'down' ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/10 text-white/40'
                  }`}
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Expanded View */}
            <AnimatePresence>
              {selectedList === list.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 pt-3 border-t border-white/10"
                >
                  <div className="space-y-2">
                    <div className="text-xs text-white/40 mb-2">Recent articles in this list:</div>
                    {[1, 2, 3].map((_, j) => (
                      <div key={j} className="p-2 bg-white/5 rounded-lg flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center text-xs">
                          📰
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium">Article {j + 1}</div>
                          <div className="text-xs text-white/40">2 hours ago</div>
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-2 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                      View all {list.articles} articles →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-4 p-3 bg-white/5 rounded-lg">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-amber-400">156</div>
            <div className="text-xs text-white/40">Lists</div>
          </div>
          <div>
            <div className="text-lg font-bold text-amber-400">2.4K</div>
            <div className="text-xs text-white/40">Curators</div>
          </div>
          <div>
            <div className="text-lg font-bold text-amber-400">45K</div>
            <div className="text-xs text-white/40">Articles</div>
          </div>
        </div>
      </div>
    </div>
  )
}
