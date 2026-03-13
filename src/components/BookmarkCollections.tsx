'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderPlus, Folder, MoreHorizontal, Edit2, Trash2, Share2, Bookmark, Lock, Globe } from 'lucide-react'

interface Collection {
  id: string
  name: string
  description: string
  articles: number
  isPublic: boolean
  color: string
  lastUpdated: string
}

export default function BookmarkCollections() {
  const [collections, setCollections] = useState<Collection[]>([
    { id: '1', name: 'Tech News', description: 'Latest in technology', articles: 23, isPublic: true, color: 'from-blue-500 to-cyan-500', lastUpdated: '2 hours ago' },
    { id: '2', name: 'Climate Watch', description: 'Environmental news', articles: 15, isPublic: false, color: 'from-green-500 to-emerald-500', lastUpdated: '1 day ago' },
    { id: '3', name: 'Market Updates', description: 'Financial news', articles: 31, isPublic: true, color: 'from-purple-500 to-pink-500', lastUpdated: '3 hours ago' },
    { id: '4', name: 'Space News', description: 'Aerospace and exploration', articles: 12, isPublic: false, color: 'from-orange-500 to-red-500', lastUpdated: '5 days ago' }
  ])
  
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const createCollection = () => {
    if (!newName.trim()) return
    
    const colors = ['from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500', 'from-purple-500 to-pink-500', 'from-orange-500 to-red-500', 'from-yellow-500 to-amber-500']
    
    const newCollection: Collection = {
      id: Date.now().toString(),
      name: newName,
      description: newDescription,
      articles: 0,
      isPublic: false,
      color: colors[Math.floor(Math.random() * colors.length)],
      lastUpdated: 'Just now'
    }
    
    setCollections(prev => [newCollection, ...prev])
    setNewName('')
    setNewDescription('')
    setShowCreate(false)
  }

  const deleteCollection = (id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id))
    setActiveMenu(null)
  }

  return (
    <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-rose-400" />
          <h3 className="font-semibold">Collections</h3>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 px-2 py-1 bg-rose-500/20 text-rose-400 rounded-lg text-xs hover:bg-rose-500/30 transition-colors"
        >
          <FolderPlus className="w-3 h-3" />
          New
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Collection name..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-rose-500/30"
              />
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-rose-500/30"
              />
              <div className="flex gap-2">
                <button
                  onClick={createCollection}
                  className="flex-1 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-400 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collections List */}
      <div className="space-y-2">
        {collections.map((collection, i) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all group relative"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${collection.color} flex items-center justify-center`}>
                <Bookmark className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium truncate">{collection.name}</h4>
                  {collection.isPublic ? (
                    <Globe className="w-3 h-3 text-green-400" />
                  ) : (
                    <Lock className="w-3 h-3 text-white/40" />
                  )}
                </div>
                <p className="text-xs text-white/50 truncate">{collection.description}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                  <span>{collection.articles} articles</span>
                  <span>•</span>
                  <span>{collection.lastUpdated}</span>
                </div>
              </div>
              
              {/* Menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === collection.id ? null : collection.id)}
                  className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                
                <AnimatePresence>
                  {activeMenu === collection.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full mt-1 w-32 bg-black border border-white/10 rounded-lg shadow-xl z-10"
                    >
                      <button className="w-full px-3 py-2 flex items-center gap-2 text-xs hover:bg-white/5 transition-colors">
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      <button className="w-full px-3 py-2 flex items-center gap-2 text-xs hover:bg-white/5 transition-colors">
                        <Share2 className="w-3 h-3" />
                        Share
                      </button>
                      <button
                        onClick={() => deleteCollection(collection.id)}
                        className="w-full px-3 py-2 flex items-center gap-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-4 p-3 bg-white/5 rounded-lg">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-rose-400">{collections.length}</div>
            <div className="text-xs text-white/40">Collections</div>
          </div>
          <div>
            <div className="text-lg font-bold text-rose-400">{collections.reduce((acc, c) => acc + c.articles, 0)}</div>
            <div className="text-xs text-white/40">Saved</div>
          </div>
        </div>
      </div>
    </div>
  )
}
