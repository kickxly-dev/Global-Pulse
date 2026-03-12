'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

interface TrendingTopic {
  topic: string
  count: number
  change: 'up' | 'down' | 'same'
  category: string
}

export default function TrendingTopicsTicker() {
  const [topics, setTopics] = useState<TrendingTopic[]>([])

  useEffect(() => {
    // Generate trending topics based on current news
    const trending: TrendingTopic[] = [
      { topic: 'AI Revolution', count: 1250, change: 'up', category: 'Technology' },
      { topic: 'Climate Summit', count: 980, change: 'up', category: 'Politics' },
      { topic: 'Stock Market', count: 856, change: 'down', category: 'Business' },
      { topic: 'SpaceX Launch', count: 743, change: 'up', category: 'Science' },
      { topic: 'Health Breakthrough', count: 621, change: 'same', category: 'Health' },
      { topic: 'Crypto Update', count: 598, change: 'down', category: 'Finance' },
      { topic: 'Election 2024', count: 1450, change: 'up', category: 'Politics' },
      { topic: 'New iPhone', count: 432, change: 'up', category: 'Technology' },
    ]
    setTopics(trending)
  }, [])

  return (
    <div className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-y border-white/5 overflow-hidden">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <TrendingUp className="w-4 h-4 text-cyber-blue" />
            <span className="text-sm font-medium text-cyber-blue">Trending:</span>
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            <motion.div
              animate={{ x: [0, -1000] }}
              transition={{ 
                duration: 30, 
                repeat: Infinity, 
                ease: "linear",
                repeatType: "loop"
              }}
              className="flex items-center gap-8 whitespace-nowrap"
            >
              {[...topics, ...topics].map((topic, i) => (
                <div 
                  key={`${topic.topic}-${i}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-cyber-blue/30 transition-all cursor-pointer group"
                >
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    {topic.topic}
                  </span>
                  <span className="text-xs text-gray-500">({topic.count})</span>
                  {topic.change === 'up' && <ArrowUpRight className="w-3 h-3 text-green-400" />}
                  {topic.change === 'down' && <ArrowDownRight className="w-3 h-3 text-red-400" />}
                  {topic.change === 'same' && <Minus className="w-3 h-3 text-yellow-400" />}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
