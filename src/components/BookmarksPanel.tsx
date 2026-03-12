'use client'

import { useState, useEffect } from 'react'
import { NewsArticle } from '@/types/news'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, Trash2, ExternalLink, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Helper function to check if article is bookmarked
export function isArticleBookmarked(articleId: string): boolean {
  try {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('bookmarkedArticles')
    if (!saved) return false
    const bookmarks = JSON.parse(saved)
    return bookmarks.some((b: NewsArticle) => b.id === articleId)
  } catch (e) {
    return false
  }
}

// Helper function to toggle bookmark
export function toggleBookmark(article: NewsArticle): boolean {
  try {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('bookmarkedArticles')
    const bookmarks: NewsArticle[] = saved ? JSON.parse(saved) : []
    
    const index = bookmarks.findIndex(b => b.id === article.id)
    if (index >= 0) {
      bookmarks.splice(index, 1)
      localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarks))
      return false // Removed
    } else {
      bookmarks.unshift(article)
      localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarks))
      return true // Added
    }
  } catch (e) {
    console.error('Error toggling bookmark:', e)
    return false
  }
}

interface BookmarksPanelProps {
  isOpen: boolean
  onClose: () => void
  onArticleClick?: (article: NewsArticle) => void
}

export default function BookmarksPanel({ isOpen, onClose, onArticleClick }: BookmarksPanelProps) {
  const [bookmarks, setBookmarks] = useState<NewsArticle[]>([])

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('bookmarkedArticles')
        if (saved) {
          setBookmarks(JSON.parse(saved))
        }

        // Listen for storage changes
        const handleStorage = () => {
          const updated = localStorage.getItem('bookmarkedArticles')
          setBookmarks(updated ? JSON.parse(updated) : [])
        }
        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
      }
    } catch (e) {
      console.error('Error accessing localStorage:', e)
    }
  }, [])

  const removeBookmark = (articleId: string) => {
    try {
      if (typeof window === 'undefined') return
      const filtered = bookmarks.filter(b => b.id !== articleId)
      localStorage.setItem('bookmarkedArticles', JSON.stringify(filtered))
      setBookmarks(filtered)
    } catch (e) {
      console.error('Error removing bookmark:', e)
    }
  }

  const clearAllBookmarks = () => {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem('bookmarkedArticles')
      setBookmarks([])
    } catch (e) {
      console.error('Error clearing bookmarks:', e)
    }
  }

  return (
    <div className="cyber-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bookmark className="w-5 h-5 text-cyber-yellow" />
          <h2 className="text-lg font-bold font-cyber text-cyber-yellow">
            Saved Articles
          </h2>
          <span className="px-2 py-1 bg-cyber-yellow/20 border border-cyber-yellow/50 rounded text-xs text-cyber-yellow">
            {bookmarks.length}
          </span>
        </div>
        
        {bookmarks.length > 0 && (
          <button
            onClick={clearAllBookmarks}
            className="text-xs text-gray-500 hover:text-red-500 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-8">
          <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No saved articles yet</p>
          <p className="text-xs text-gray-500 mt-1">Click the bookmark icon on any article to save it</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
          <AnimatePresence>
            {bookmarks.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-cyber-dark/50 border border-gray-700 rounded-lg p-3 hover:border-cyber-blue/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <h3 className="text-sm font-medium text-gray-200 line-clamp-2 mb-1">
                      {article.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{article.source.name}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded text-gray-500 hover:text-cyber-blue transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => removeBookmark(article.id)}
                      className="p-1.5 rounded text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {article.urlToImage && (
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-20 object-cover rounded mt-2 opacity-75"
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
