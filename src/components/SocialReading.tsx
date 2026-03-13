'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Highlighter, MessageCircle, Users, Bookmark, Share2, Eye, Lock, Unlock, ChevronRight, Plus } from 'lucide-react'

interface Highlight {
  id: string
  text: string
  color: 'yellow' | 'green' | 'blue' | 'pink'
  isPublic: boolean
  author: { name: string; avatar: string }
  notes: string
  likes: number
}

interface Annotation {
  id: string
  highlightId: string
  text: string
  author: { name: string; avatar: string }
  timestamp: string
}

interface SharedList {
  id: string
  name: string
  members: number
  articles: number
  lastActivity: string
}

interface SocialReadingProps {
  article?: {
    title: string
    content: string
  }
}

export default function SocialReading({ article }: SocialReadingProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([
    { id: '1', text: 'This represents a turning point in climate policy', color: 'yellow', isPublic: true, author: { name: 'Sarah Chen', avatar: '👩‍💼' }, notes: 'Key statement', likes: 12 },
    { id: '2', text: 'The agreement includes provisions for developing nations', color: 'green', isPublic: true, author: { name: 'Mike Johnson', avatar: '👨‍💻' }, notes: 'Important detail', likes: 8 },
    { id: '3', text: 'Critics argue the targets may not be sufficient', color: 'blue', isPublic: false, author: { name: 'You', avatar: '👤' }, notes: 'Counter argument to explore', likes: 0 }
  ])
  
  const [annotations, setAnnotations] = useState<Annotation[]>([
    { id: '1', highlightId: '1', text: 'This is the most ambitious climate target ever adopted!', author: { name: 'Emma Wilson', avatar: '👩‍🔬' }, timestamp: '2 hours ago' },
    { id: '2', highlightId: '1', text: 'I wonder how this will be enforced...', author: { name: 'Alex Kumar', avatar: '👨‍🎓' }, timestamp: '1 hour ago' }
  ])

  const [sharedLists, setSharedLists] = useState<SharedList[]>([
    { id: '1', name: 'Climate Reading Group', members: 12, articles: 45, lastActivity: '2 hours ago' },
    { id: '2', name: 'Tech News Club', members: 8, articles: 32, lastActivity: '1 day ago' }
  ])

  const [activeTab, setActiveTab] = useState<'highlights' | 'discussions' | 'lists'>('highlights')
  const [showHighlighter, setShowHighlighter] = useState(false)
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null)
  const [newNote, setNewNote] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  const getColorClass = (color: string) => {
    switch (color) {
      case 'yellow': return 'bg-yellow-500/30 border-yellow-500/50'
      case 'green': return 'bg-green-500/30 border-green-500/50'
      case 'blue': return 'bg-blue-500/30 border-blue-500/50'
      case 'pink': return 'bg-pink-500/30 border-pink-500/50'
      default: return 'bg-yellow-500/30 border-yellow-500/50'
    }
  }

  const addHighlight = () => {
    const colors: ('yellow' | 'green' | 'blue' | 'pink')[] = ['yellow', 'green', 'blue', 'pink']
    const newHighlight: Highlight = {
      id: Date.now().toString(),
      text: 'Selected text from article...',
      color: colors[Math.floor(Math.random() * colors.length)],
      isPublic,
      author: { name: 'You', avatar: '👤' },
      notes: newNote,
      likes: 0
    }
    setHighlights(prev => [newHighlight, ...prev])
    setShowHighlighter(false)
    setNewNote('')
  }

  const totalHighlights = highlights.length
  const publicHighlights = highlights.filter(h => h.isPublic).length
  const totalAnnotations = annotations.length

  return (
    <div className="bg-gradient-to-r from-fuchsia-500/10 to-purple-500/10 border border-fuchsia-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Highlighter className="w-4 h-4 text-fuchsia-400" />
          <h3 className="font-semibold">Social Reading</h3>
        </div>
        <span className="text-xs text-white/40">Collaborative</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {[
          { id: 'highlights', label: 'Highlights', icon: Highlighter, count: totalHighlights },
          { id: 'discussions', label: 'Notes', icon: MessageCircle, count: totalAnnotations },
          { id: 'lists', label: 'Lists', icon: Users, count: sharedLists.length }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
              <span className="ml-1 px-1.5 py-0.5 bg-white/10 rounded text-xs">{tab.count}</span>
            </button>
          )
        })}
      </div>

      {/* Highlights Tab */}
      {activeTab === 'highlights' && (
        <div className="space-y-4">
          {/* Add Highlight Button */}
          <button
            onClick={() => setShowHighlighter(!showHighlighter)}
            className="w-full py-2 bg-fuchsia-500/20 text-fuchsia-400 rounded-lg text-sm font-medium hover:bg-fuchsia-500/30 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Highlight
          </button>

          <AnimatePresence>
            {showHighlighter && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-3"
              >
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note to your highlight..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-fuchsia-500/30 resize-none"
                  rows={2}
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-xs text-white/60">Public highlight</span>
                    {isPublic ? <Unlock className="w-3 h-3 text-green-400" /> : <Lock className="w-3 h-3 text-white/40" />}
                  </label>
                  <button
                    onClick={addHighlight}
                    className="px-4 py-1.5 bg-fuchsia-500 rounded-lg text-xs font-medium hover:bg-fuchsia-400 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social Proof */}
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3 text-fuchsia-400" />
              <span className="text-xs text-white/60">
                <strong className="text-white">{publicHighlights}</strong> people highlighted parts of this article
              </span>
            </div>
          </div>

          {/* Highlights List */}
          <div className="space-y-2">
            {highlights.map((highlight) => (
              <motion.div
                key={highlight.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${getColorClass(highlight.color)} ${
                  selectedHighlight === highlight.id ? 'ring-1 ring-white/30' : ''
                }`}
                onClick={() => setSelectedHighlight(selectedHighlight === highlight.id ? null : highlight.id)}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{highlight.author.avatar}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{highlight.author.name}</span>
                      {highlight.isPublic ? (
                        <Unlock className="w-3 h-3 text-green-400" />
                      ) : (
                        <Lock className="w-3 h-3 text-white/40" />
                      )}
                    </div>
                    <p className="text-sm italic">"{highlight.text}"</p>
                    {highlight.notes && (
                      <p className="text-xs text-white/50 mt-1">{highlight.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/40">
                    <span>❤️</span>
                    <span>{highlight.likes}</span>
                  </div>
                </div>

                {/* Annotations */}
                <AnimatePresence>
                  {selectedHighlight === highlight.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 pt-3 border-t border-white/20"
                    >
                      <div className="text-xs text-white/40 mb-2">Discussion ({annotations.filter(a => a.highlightId === highlight.id).length})</div>
                      {annotations
                        .filter(a => a.highlightId === highlight.id)
                        .map((annotation) => (
                          <div key={annotation.id} className="flex items-start gap-2 mb-2 p-2 bg-black/20 rounded">
                            <span className="text-sm">{annotation.author.avatar}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">{annotation.author.name}</span>
                                <span className="text-xs text-white/40">{annotation.timestamp}</span>
                              </div>
                              <p className="text-xs text-white/70">{annotation.text}</p>
                            </div>
                          </div>
                        ))}
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-xs focus:outline-none focus:border-fuchsia-500/30"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Discussions Tab */}
      {activeTab === 'discussions' && (
        <div className="space-y-3">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-center">
            <MessageCircle className="w-6 h-6 text-fuchsia-400 mx-auto mb-2" />
            <p className="text-xs text-white/60">Join the conversation on highlighted passages</p>
          </div>
          {annotations.map((annotation) => (
            <div key={annotation.id} className="p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-start gap-2">
                <span className="text-lg">{annotation.author.avatar}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">{annotation.author.name}</span>
                    <span className="text-xs text-white/40">{annotation.timestamp}</span>
                  </div>
                  <p className="text-xs text-white/70">{annotation.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lists Tab */}
      {activeTab === 'lists' && (
        <div className="space-y-3">
          <button className="w-full py-2 bg-fuchsia-500/20 text-fuchsia-400 rounded-lg text-sm font-medium hover:bg-fuchsia-500/30 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Create Shared List
          </button>

          {sharedLists.map((list) => (
            <div key={list.id} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{list.name}</span>
                <span className="text-xs text-white/40">{list.lastActivity}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {list.members}
                </span>
                <span className="flex items-center gap-1">
                  <Bookmark className="w-3 h-3" />
                  {list.articles}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
