'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, Clock, Filter } from 'lucide-react'

interface TimelineArticle {
  id: string
  title: string
  source: string
  time: string
  category: string
  image?: string
}

const timelineData: TimelineArticle[] = [
  { id: '1', title: 'Breaking: Major Climate Agreement Reached', source: 'Reuters', time: '2 min ago', category: 'World', image: 'https://picsum.photos/200/100?random=1' },
  { id: '2', title: 'Tech Giants Report Record Earnings', source: 'Bloomberg', time: '15 min ago', category: 'Business', image: 'https://picsum.photos/200/100?random=2' },
  { id: '3', title: 'New Space Mission Launches Successfully', source: 'NASA', time: '32 min ago', category: 'Science', image: 'https://picsum.photos/200/100?random=3' },
  { id: '4', title: 'Sports: Championship Finals Set', source: 'ESPN', time: '1 hour ago', category: 'Sports', image: 'https://picsum.photos/200/100?random=4' },
  { id: '5', title: 'Health Study Reveals New Findings', source: 'Nature', time: '2 hours ago', category: 'Health', image: 'https://picsum.photos/200/100?random=5' },
  { id: '6', title: 'Political Summit Concludes', source: 'AP News', time: '3 hours ago', category: 'Politics', image: 'https://picsum.photos/200/100?random=6' },
  { id: '7', title: 'Entertainment: Award Winners Announced', source: 'Variety', time: '4 hours ago', category: 'Entertainment', image: 'https://picsum.photos/200/100?random=7' },
  { id: '8', title: 'Economic Report Shows Growth', source: 'WSJ', time: '5 hours ago', category: 'Business', image: 'https://picsum.photos/200/100?random=8' },
]

export default function NewsTimeline() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filter, setFilter] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline')

  const filteredArticles = filter 
    ? timelineData.filter(a => a.category === filter)
    : timelineData

  const categories = ['World', 'Business', 'Science', 'Sports', 'Health', 'Politics', 'Entertainment']

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold">News Timeline</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'timeline' ? 'list' : 'timeline')}
            className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            {viewMode === 'timeline' ? 'List' : 'Timeline'}
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-4 p-2 bg-black/20 rounded-lg">
        <button className="p-1 hover:bg-white/10 rounded transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white/40" />
          <span className="text-sm">{selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
        <button className="p-1 hover:bg-white/10 rounded transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1 mb-4">
        <button
          onClick={() => setFilter(null)}
          className={`text-xs px-2 py-1 rounded-full transition-colors ${
            !filter ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-xs px-2 py-1 rounded-full transition-colors ${
              filter === cat ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        {viewMode === 'timeline' && (
          <div className="absolute left-[60px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/50 via-purple-500/50 to-pink-500/50" />
        )}

        <AnimatePresence mode="popLayout">
          {filteredArticles.map((article, i) => (
            <motion.div
              key={article.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.05 }}
              className={`relative flex gap-4 mb-4 ${viewMode === 'timeline' ? 'pl-4' : ''}`}
            >
              {viewMode === 'timeline' && (
                <div className="absolute left-[52px] w-4 h-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 border-2 border-black" />
              )}
              
              <div className="flex-1 p-3 bg-white/[0.02] rounded-lg border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                <div className="flex items-start gap-3">
                  {article.image && (
                    <img 
                      src={article.image} 
                      alt="" 
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-cyan-400">{article.category}</span>
                      <span className="text-xs text-white/30">•</span>
                      <span className="text-xs text-white/40">{article.time}</span>
                    </div>
                    <h4 className="text-sm font-medium line-clamp-2 group-hover:text-white transition-colors">
                      {article.title}
                    </h4>
                    <span className="text-xs text-white/40 mt-1">{article.source}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
