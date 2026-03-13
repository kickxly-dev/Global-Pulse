'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Clock, Sun, Coffee, Moon, Download, GripVertical, RefreshCw, Sparkles, ChevronRight, Wifi, WifiOff } from 'lucide-react'

interface QueuedArticle {
  id: string
  title: string
  source: string
  readTime: number
  category: string
  priority: 'high' | 'medium' | 'low'
  addedAt: string
}

interface TimeSlot {
  id: 'morning' | 'lunch' | 'evening'
  label: string
  time: string
  icon: any
  articles: QueuedArticle[]
}

export default function PredictiveQueue() {
  const [queues, setQueues] = useState<TimeSlot[]>([
    { id: 'morning', label: 'Morning Briefing', time: '6am - 9am', icon: Sun, articles: [] },
    { id: 'lunch', label: 'Lunch Reads', time: '12pm - 2pm', icon: Coffee, articles: [] },
    { id: 'evening', label: 'Evening Deep Dives', time: '6pm - 10pm', icon: Moon, articles: [] }
  ])
  
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [offlineSync, setOfflineSync] = useState(false)
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const now = new Date()
    const hours = now.getHours()
    if (hours >= 6 && hours < 12) setCurrentTime('morning')
    else if (hours >= 12 && hours < 18) setCurrentTime('lunch')
    else setCurrentTime('evening')
  }, [])

  const generateQueue = () => {
    setLoading(true)
    
    setTimeout(() => {
      const mockQueues: TimeSlot[] = [
        {
          id: 'morning',
          label: 'Morning Briefing',
          time: '6am - 9am',
          icon: Sun,
          articles: [
            { id: '1', title: 'Markets Open Higher Amid Optimism', source: 'Bloomberg', readTime: 3, category: 'Business', priority: 'high', addedAt: 'Auto' },
            { id: '2', title: 'Weather: Sunny Day Ahead', source: 'Weather.com', readTime: 1, category: 'Local', priority: 'medium', addedAt: 'Auto' },
            { id: '3', title: 'Top Tech News Overnight', source: 'TechCrunch', readTime: 5, category: 'Technology', priority: 'high', addedAt: 'Auto' }
          ]
        },
        {
          id: 'lunch',
          label: 'Lunch Reads',
          time: '12pm - 2pm',
          icon: Coffee,
          articles: [
            { id: '4', title: 'Climate Summit Update', source: 'Reuters', readTime: 7, category: 'World', priority: 'high', addedAt: 'Auto' },
            { id: '5', title: 'New AI Breakthrough Explained', source: 'MIT Review', readTime: 10, category: 'Technology', priority: 'medium', addedAt: 'Auto' }
          ]
        },
        {
          id: 'evening',
          label: 'Evening Deep Dives',
          time: '6pm - 10pm',
          icon: Moon,
          articles: [
            { id: '6', title: 'The Future of Remote Work', source: 'Harvard Business', readTime: 15, category: 'Business', priority: 'medium', addedAt: 'Auto' },
            { id: '7', title: 'Space Exploration: What\'s Next', source: 'Nature', readTime: 12, category: 'Science', priority: 'low', addedAt: 'Auto' },
            { id: '8', title: 'In-Depth: Global Economy 2024', source: 'Economist', readTime: 20, category: 'World', priority: 'high', addedAt: 'Auto' }
          ]
        }
      ]
      
      setQueues(mockQueues)
      setLoading(false)
      setGenerated(true)
    }, 1500)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-green-400 bg-green-500/20'
      default: return 'text-white/40 bg-white/10'
    }
  }

  const totalArticles = queues.reduce((acc, q) => acc + q.articles.length, 0)
  const totalReadTime = queues.reduce((acc, q) => acc + q.articles.reduce((a, art) => a + art.readTime, 0), 0)

  return (
    <div className="bg-gradient-to-r from-sky-500/10 to-blue-500/10 border border-sky-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <h3 className="font-semibold">Reading Queue</h3>
        </div>
        <span className="text-xs text-white/40">AI-curated</span>
      </div>

      {!generated ? (
        <button
          onClick={generateQueue}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-500 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Analyzing patterns...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Smart Queue
            </>
          )}
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-white/5 rounded-lg">
              <div className="text-lg font-bold text-sky-400">{totalArticles}</div>
              <div className="text-xs text-white/40">Articles</div>
            </div>
            <div className="p-2 bg-white/5 rounded-lg">
              <div className="text-lg font-bold text-sky-400">{totalReadTime}m</div>
              <div className="text-xs text-white/40">Read Time</div>
            </div>
            <div className="p-2 bg-white/5 rounded-lg">
              <div className="text-lg font-bold text-sky-400">3</div>
              <div className="text-xs text-white/40">Sessions</div>
            </div>
          </div>

          {/* Current Time Highlight */}
          <div className="p-3 bg-sky-500/10 rounded-lg border border-sky-500/20">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-sky-400 animate-pulse" />
              <span className="text-xs text-sky-400">
                Your usual reading time: <strong>{currentTime === 'morning' ? 'Morning (9am)' : currentTime === 'lunch' ? 'Lunch (12pm)' : 'Evening (7pm)'}</strong>
              </span>
            </div>
          </div>

          {/* Time Slots */}
          <div className="space-y-3">
            {queues.map((slot) => {
              const Icon = slot.icon
              const isActive = currentTime === slot.id
              
              return (
                <div
                  key={slot.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-sky-500/20 border-sky-500/30'
                      : 'bg-white/5 border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-white/40'}`} />
                      <span className="text-sm font-medium">{slot.label}</span>
                    </div>
                    <span className="text-xs text-white/40">{slot.time}</span>
                  </div>

                  {/* Articles */}
                  <div className="space-y-2">
                    {slot.articles.map((article) => (
                      <div
                        key={article.id}
                        className="flex items-center gap-2 p-2 bg-white/5 rounded-lg group cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <GripVertical className="w-3 h-3 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{article.title}</div>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <span>{article.source}</span>
                            <span>•</span>
                            <span>{article.readTime} min</span>
                          </div>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${getPriorityColor(article.priority)}`}>
                          {article.priority}
                        </span>
                      </div>
                    ))}
                  </div>

                  {slot.articles.length > 0 && (
                    <div className="mt-2 text-xs text-white/40 text-right">
                      {slot.articles.reduce((a, art) => a + art.readTime, 0)} min total
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Offline Sync */}
          <button
            onClick={() => setOfflineSync(!offlineSync)}
            className={`w-full p-3 rounded-lg border flex items-center justify-between transition-all ${
              offlineSync
                ? 'bg-green-500/20 border-green-500/30'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2">
              {offlineSync ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-white/40" />
              )}
              <span className="text-sm">Offline Sync</span>
            </div>
            <span className={`text-xs ${offlineSync ? 'text-green-400' : 'text-white/40'}`}>
              {offlineSync ? 'Downloaded' : 'Tap to enable'}
            </span>
          </button>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setGenerated(false)}
              className="flex-1 py-2 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition-colors"
            >
              Regenerate
            </button>
            <button className="flex-1 py-2 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
              <Download className="w-3 h-3" />
              Download All
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
