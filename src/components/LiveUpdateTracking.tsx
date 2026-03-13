'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Clock, Edit3, Plus, Minus, ArrowRight, Bell, History, FileDiff } from 'lucide-react'

interface ArticleVersion {
  id: string
  timestamp: string
  changes: {
    type: 'added' | 'removed' | 'modified'
    content: string
    section: string
  }[]
  author: string
  reason?: string
}

interface LiveUpdateTrackingProps {
  article?: {
    title: string
    url: string
    lastUpdated: string
  }
}

export default function LiveUpdateTracking({ article }: LiveUpdateTrackingProps) {
  const [versions, setVersions] = useState<ArticleVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [tracking, setTracking] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [notifications, setNotifications] = useState(true)

  const startTracking = () => {
    if (!article) return
    setLoading(true)
    
    setTimeout(() => {
      const mockVersions: ArticleVersion[] = [
        {
          id: '3',
          timestamp: '2 minutes ago',
          changes: [
            { type: 'added', content: 'Updated with statement from White House Press Secretary', section: 'Developments' }
          ],
          author: 'Editorial Team',
          reason: 'Breaking update'
        },
        {
          id: '2',
          timestamp: '45 minutes ago',
          changes: [
            { type: 'modified', content: 'Corrected the number of participating nations from 140 to 142', section: 'Lead' },
            { type: 'added', content: 'Added quote from UN Secretary General', section: 'Quotes' }
          ],
          author: 'Fact Check Team',
          reason: 'Correction'
        },
        {
          id: '1',
          timestamp: '3 hours ago',
          changes: [
            { type: 'added', content: 'Initial publication with breaking news report', section: 'Full Article' }
          ],
          author: 'Reuters',
          reason: 'Initial publish'
        }
      ]
      
      setVersions(mockVersions)
      setTracking(true)
      setLoading(false)
    }, 1500)
  }

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'added': return 'text-green-400 bg-green-500/20'
      case 'removed': return 'text-red-400 bg-red-500/20'
      case 'modified': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-white/60 bg-white/10'
    }
  }

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'added': return <Plus className="w-3 h-3" />
      case 'removed': return <Minus className="w-3 h-3" />
      case 'modified': return <Edit3 className="w-3 h-3" />
      default: return null
    }
  }

  return (
    <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-orange-400" />
          <h3 className="font-semibold">Live Updates</h3>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="rounded"
          />
          <Bell className="w-3 h-3 text-orange-400" />
        </label>
      </div>

      {!tracking ? (
        <button
          onClick={startTracking}
          disabled={loading || !article}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Starting tracking...
            </>
          ) : (
            <>
              <History className="w-4 h-4" />
              Track Updates
            </>
          )}
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Status */}
          <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              <span className="text-xs text-orange-400">Live tracking active</span>
            </div>
            <span className="text-xs text-white/40">{versions.length} versions</span>
          </div>

          {/* Version Timeline */}
          <div className="space-y-3">
            {versions.map((version, i) => (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedVersion === version.id
                    ? 'bg-orange-500/20 border-orange-500/30'
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
                onClick={() => setSelectedVersion(selectedVersion === version.id ? null : version.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-orange-400" />
                    <span className="text-xs text-white/60">{version.timestamp}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-white/10 rounded text-xs">{version.author}</span>
                </div>

                <div className="space-y-2">
                  {version.changes.map((change, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs flex items-center gap-1 ${getChangeColor(change.type)}`}>
                        {getChangeIcon(change.type)}
                        {change.type}
                      </span>
                      <span className="text-xs text-white/70 flex-1">{change.content}</span>
                    </div>
                  ))}
                </div>

                {version.reason && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <span className="text-xs text-white/40">Reason: {version.reason}</span>
                  </div>
                )}

                {/* Expanded Diff View */}
                <AnimatePresence>
                  {selectedVersion === version.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 pt-3 border-t border-white/10"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FileDiff className="w-3 h-3 text-orange-400" />
                        <span className="text-xs text-orange-400">View Changes</span>
                      </div>
                      <div className="p-2 bg-black/30 rounded font-mono text-xs space-y-1">
                        {version.changes.map((change, j) => (
                          <div key={j} className={`${change.type === 'removed' ? 'line-through text-red-400' : change.type === 'added' ? 'text-green-400' : 'text-yellow-400'}`}>
                            {change.type === 'added' ? '+' : change.type === 'removed' ? '-' : '~'} {change.content}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
              <Bell className="w-3 h-3" />
              Get Notified on Updates
            </button>
            <button
              onClick={() => setTracking(false)}
              className="px-4 py-2 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition-colors"
            >
              Stop
            </button>
          </div>
        </motion.div>
      )}

      {!article && !tracking && (
        <div className="py-6 text-center text-white/40">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select an article to track updates</p>
        </div>
      )}
    </div>
  )
}
