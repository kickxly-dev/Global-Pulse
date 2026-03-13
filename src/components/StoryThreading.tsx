'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, Clock, Newspaper, ChevronRight, AlertTriangle, CheckCircle, Info, ArrowRight } from 'lucide-react'

interface StoryEvent {
  id: string
  type: 'breaking' | 'update' | 'analysis' | 'follow-up' | 'correction'
  title: string
  source: string
  timestamp: string
  summary: string
  angle: string
  confidence: number
}

interface StoryThread {
  id: string
  mainStory: string
  events: StoryEvent[]
  sources: string[]
  lastUpdated: string
}

interface StoryThreadingProps {
  article?: {
    title: string
    source: string
    content: string
  }
}

export default function StoryThreading({ article }: StoryThreadingProps) {
  const [thread, setThread] = useState<StoryThread | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)

  const buildThread = () => {
    if (!article) return
    setLoading(true)
    
    setTimeout(() => {
      const mockThread: StoryThread = {
        id: '1',
        mainStory: article.title,
        sources: ['Reuters', 'CNN', 'BBC', 'Fox News', 'AP News'],
        lastUpdated: '2 minutes ago',
        events: [
          {
            id: '1',
            type: 'breaking',
            title: 'Initial Report: Major Climate Agreement Announced',
            source: 'Reuters',
            timestamp: '6 hours ago',
            summary: 'Breaking: World leaders reach preliminary agreement on carbon reduction targets.',
            angle: 'Factual breaking news',
            confidence: 95
          },
          {
            id: '2',
            type: 'update',
            title: 'Details Emerge on Agreement Specifics',
            source: 'CNN',
            timestamp: '4 hours ago',
            summary: 'New details reveal 50% reduction target by 2030, with provisions for developing nations.',
            angle: 'Policy focus',
            confidence: 88
          },
          {
            id: '3',
            type: 'analysis',
            title: 'Experts Weigh In on Agreement Feasibility',
            source: 'BBC',
            timestamp: '3 hours ago',
            summary: 'Climate scientists and economists analyze the practical implications.',
            angle: 'Expert analysis',
            confidence: 82
          },
          {
            id: '4',
            type: 'follow-up',
            title: 'Industry Response to New Regulations',
            source: 'Fox News',
            timestamp: '2 hours ago',
            summary: 'Business leaders express concerns about economic impact.',
            angle: 'Economic concerns',
            confidence: 78
          },
          {
            id: '5',
            type: 'update',
            title: 'Additional Countries Sign On',
            source: 'AP News',
            timestamp: '1 hour ago',
            summary: '5 more nations join the agreement, bringing total to 142 countries.',
            angle: 'International scope',
            confidence: 92
          }
        ]
      }
      
      setThread(mockThread)
      setLoading(false)
    }, 1500)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'breaking': return <AlertTriangle className="w-3 h-3 text-red-400" />
      case 'update': return <CheckCircle className="w-3 h-3 text-blue-400" />
      case 'analysis': return <Info className="w-3 h-3 text-purple-400" />
      case 'follow-up': return <ArrowRight className="w-3 h-3 text-green-400" />
      case 'correction': return <AlertTriangle className="w-3 h-3 text-yellow-400" />
      default: return <Info className="w-3 h-3 text-white/40" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'breaking': return 'bg-red-500/20 border-red-500/30'
      case 'update': return 'bg-blue-500/20 border-blue-500/30'
      case 'analysis': return 'bg-purple-500/20 border-purple-500/30'
      case 'follow-up': return 'bg-green-500/20 border-green-500/30'
      case 'correction': return 'bg-yellow-500/20 border-yellow-500/30'
      default: return 'bg-white/5 border-white/10'
    }
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold">Story Thread</h3>
        </div>
        <span className="text-xs text-white/40">AI-powered</span>
      </div>

      {!thread ? (
        <button
          onClick={buildThread}
          disabled={loading || !article}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <GitBranch className="w-4 h-4 animate-pulse" />
              Building thread...
            </>
          ) : (
            <>
              <GitBranch className="w-4 h-4" />
              Build Story Thread
            </>
          )}
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Sources */}
          <div className="flex flex-wrap gap-2">
            {thread.sources.map((source) => (
              <span key={source} className="px-2 py-1 bg-white/5 rounded-lg text-xs text-white/60">
                {source}
              </span>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500 via-blue-500 to-green-500" />
            
            <div className="space-y-3">
              {thread.events.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative pl-8 p-3 rounded-lg border cursor-pointer transition-all ${getTypeColor(event.type)} ${
                    expandedEvent === event.id ? 'ring-1 ring-white/20' : ''
                  }`}
                  onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                >
                  <div className="absolute left-1.5 top-3.5 w-3 h-3 rounded-full bg-black border-2 border-current flex items-center justify-center">
                    {getTypeIcon(event.type)}
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium capitalize">{event.type}</span>
                        <span className="text-xs text-white/40">{event.source}</span>
                      </div>
                      <h4 className="text-sm font-medium mb-1">{event.title}</h4>
                      <p className="text-xs text-white/50 line-clamp-2">{event.summary}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-white/40">{event.timestamp}</span>
                      <span className="text-xs text-indigo-400">{event.confidence}%</span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedEvent === event.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 pt-3 border-t border-white/10"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Newspaper className="w-3 h-3 text-indigo-400" />
                          <span className="text-xs text-indigo-400">Coverage Angle</span>
                        </div>
                        <p className="text-xs text-white/60">{event.angle}</p>
                        <button className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                          Read full article <ChevronRight className="w-3 h-3" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-indigo-400">{thread.events.length}</div>
                <div className="text-xs text-white/40">Updates</div>
              </div>
              <div>
                <div className="text-lg font-bold text-indigo-400">{thread.sources.length}</div>
                <div className="text-xs text-white/40">Sources</div>
              </div>
              <div>
                <div className="text-lg font-bold text-indigo-400">{thread.lastUpdated}</div>
                <div className="text-xs text-white/40">Updated</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setThread(null)}
            className="w-full py-2 text-xs text-white/40 hover:text-white transition-colors"
          >
            Reset thread
          </button>
        </motion.div>
      )}
    </div>
  )
}
