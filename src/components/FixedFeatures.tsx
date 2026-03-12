'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, Trash2, ExternalLink, X, BookOpen, Moon, Sun, Type } from 'lucide-react'
import { NewsArticle } from '@/types/news'

// Global debug function
function debugLog(feature: string, action: string, data?: any) {
  console.log(`[DEBUG ${feature}] ${action}`, data || '')
}

// --- BOOKMARKS SYSTEM ---

export function isArticleBookmarked(articleId: string): boolean {
  try {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('bookmarkedArticles')
    if (!saved) return false
    const bookmarks = JSON.parse(saved)
    const isBookmarked = bookmarks.some((b: NewsArticle) => b.id === articleId)
    debugLog('BOOKMARKS', 'isArticleBookmarked', { articleId, isBookmarked })
    return isBookmarked
  } catch (e) {
    console.error('Bookmark check error:', e)
    return false
  }
}

export function toggleBookmark(article: NewsArticle): boolean {
  debugLog('BOOKMARKS', 'toggleBookmark called', { articleId: article.id })
  try {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('bookmarkedArticles')
    const bookmarks: NewsArticle[] = saved ? JSON.parse(saved) : []
    
    const index = bookmarks.findIndex(b => b.id === article.id)
    if (index >= 0) {
      bookmarks.splice(index, 1)
      localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarks))
      debugLog('BOOKMARKS', 'Article removed from bookmarks', { articleId: article.id })
      return false // Removed
    } else {
      bookmarks.unshift(article)
      localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarks))
      debugLog('BOOKMARKS', 'Article added to bookmarks', { articleId: article.id, total: bookmarks.length })
      return true // Added
    }
  } catch (e) {
    console.error('Error toggling bookmark:', e)
    return false
  }
}

export function getBookmarks(): NewsArticle[] {
  try {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('bookmarkedArticles')
    return saved ? JSON.parse(saved) : []
  } catch (e) {
    return []
  }
}

interface BookmarksPanelProps {
  isOpen: boolean
  onClose: () => void
  onArticleClick?: (article: NewsArticle) => void
}

export default function BookmarksPanel({ isOpen, onClose, onArticleClick }: BookmarksPanelProps) {
  const [bookmarks, setBookmarks] = useState<NewsArticle[]>([])
  const [isVisible, setIsVisible] = useState(false)

  // Load bookmarks when panel opens
  useEffect(() => {
    debugLog('BOOKMARKS', 'Panel visibility changed', { isOpen })
    if (isOpen) {
      setIsVisible(true)
      const loaded = getBookmarks()
      debugLog('BOOKMARKS', 'Loaded bookmarks', { count: loaded.length })
      setBookmarks(loaded)
    } else {
      setTimeout(() => setIsVisible(false), 300)
    }
  }, [isOpen])

  const handleRemove = (e: React.MouseEvent, article: NewsArticle) => {
    e.stopPropagation()
    debugLog('BOOKMARKS', 'Remove clicked', { articleId: article.id })
    toggleBookmark(article)
    const updated = getBookmarks()
    setBookmarks(updated)
  }

  const handleClearAll = () => {
    debugLog('BOOKMARKS', 'Clear all clicked')
    localStorage.setItem('bookmarkedArticles', JSON.stringify([]))
    setBookmarks([])
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[80vh] bg-gray-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-cyber-yellow/20 to-cyber-blue/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyber-yellow/20 rounded-lg">
                  <Bookmark className="w-5 h-5 text-cyber-yellow" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Saved Articles</h2>
                  <p className="text-sm text-gray-400">{bookmarks.length} bookmarked</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {bookmarks.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No bookmarks yet</p>
                  <p className="text-sm text-gray-500 mt-2">Click the bookmark icon on any article</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookmarks.map((article) => (
                    <motion.div
                      key={article.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-gray-800/50 rounded-xl p-4 border border-white/5 hover:bg-gray-800/70 transition-colors cursor-pointer group"
                      onClick={() => {
                        debugLog('BOOKMARKS', 'Article clicked', { articleId: article.id })
                        onArticleClick?.(article)
                        onClose()
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {article.urlToImage && (
                          <img
                            src={article.urlToImage}
                            alt=""
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white line-clamp-2 mb-1">{article.title}</h3>
                          <p className="text-sm text-gray-400 line-clamp-1 mb-2">{article.source.name}</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleRemove(e, article)}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                              title="Remove bookmark"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg hover:bg-cyber-blue/20 text-gray-400 hover:text-cyber-blue transition-colors"
                              title="Open original"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {bookmarks.length > 0 && (
              <div className="p-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  {bookmarks.length} article{bookmarks.length !== 1 ? 's' : ''} saved
                </span>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// --- SIMPLE THEME TOGGLE ---

interface SimpleThemeToggleProps {
  currentTheme: string
  onThemeChange: (theme: string) => void
}

export function SimpleThemeToggle({ currentTheme, onThemeChange }: SimpleThemeToggleProps) {
  const themes = [
    { id: 'cyber', name: 'Cyber', icon: Zap, color: 'from-cyan-500 to-blue-500' },
    { id: 'dark', name: 'Dark', icon: Moon, color: 'from-gray-700 to-gray-900' },
    { id: 'light', name: 'Light', icon: Sun, color: 'from-yellow-400 to-orange-500' },
  ]

  const applyTheme = (theme: string) => {
    debugLog('THEME', 'Applying theme', { theme })
    const root = document.documentElement
    
    // Remove all theme classes
    root.classList.remove('theme-cyber', 'theme-dark', 'theme-light', 'dark', 'light')
    document.body.classList.remove('theme-cyber', 'theme-dark', 'theme-light', 'dark', 'light')
    
    // Apply new theme
    if (theme === 'light') {
      root.classList.add('light', 'theme-light')
      document.body.classList.add('light', 'theme-light')
      document.body.style.backgroundColor = '#f3f4f6'
      document.body.style.color = '#1f2937'
      root.style.setProperty('--cyber-blue', '#2563eb')
      root.style.setProperty('--cyber-purple', '#7c3aed')
    } else if (theme === 'dark') {
      root.classList.add('dark', 'theme-dark')
      document.body.classList.add('dark', 'theme-dark')
      document.body.style.backgroundColor = '#111827'
      document.body.style.color = '#f3f4f6'
      root.style.setProperty('--cyber-blue', '#3b82f6')
      root.style.setProperty('--cyber-purple', '#8b5cf6')
    } else {
      root.classList.add('cyber', 'theme-cyber', 'dark')
      document.body.classList.add('cyber', 'theme-cyber', 'dark')
      document.body.style.backgroundColor = '#0a0a0a'
      document.body.style.color = '#00ff88'
      root.style.setProperty('--cyber-blue', '#00f0ff')
      root.style.setProperty('--cyber-purple', '#bf00ff')
    }
    
    localStorage.setItem('theme', theme)
    onThemeChange(theme)
  }

  return (
    <div className="flex gap-2">
      {themes.map((theme) => {
        const Icon = theme.icon
        const isActive = currentTheme === theme.id
        return (
          <button
            key={theme.id}
            onClick={() => {
              debugLog('THEME', 'Theme button clicked', { theme: theme.id })
              applyTheme(theme.id)
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              isActive
                ? `bg-gradient-to-r ${theme.color} text-white`
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{theme.name}</span>
          </button>
        )
      })}
    </div>
  )
}

// --- READING MODE SIMPLE ---

interface SimpleReadingModeProps {
  article: NewsArticle | null
  isOpen: boolean
  onClose: () => void
}

export function SimpleReadingMode({ article, isOpen, onClose }: SimpleReadingModeProps) {
  const [fontSize, setFontSize] = useState(18)
  const [isDark, setIsDark] = useState(true)

  if (!isOpen || !article) return null

  debugLog('READING', 'Reading mode opened', { articleId: article.id })

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-auto"
        style={{ 
          backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
          color: isDark ? '#e5e7eb' : '#1f2937'
        }}
      >
        {/* Toolbar */}
        <div className="sticky top-0 z-10 px-4 py-3 border-b flex items-center justify-between"
          style={{ 
            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
          }}
        >
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
            <span className="font-medium">Reading Mode</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFontSize(s => Math.max(14, s - 2))}
              className="p-2 rounded-lg hover:bg-white/10"
            >
              <span className="text-sm">A-</span>
            </button>
            <Type className="w-4 h-4" />
            <button
              onClick={() => setFontSize(s => Math.min(24, s + 2))}
              className="p-2 rounded-lg hover:bg-white/10"
            >
              <span className="text-lg">A+</span>
            </button>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg hover:bg-white/10"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Article */}
        <article className="max-w-3xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-4" style={{ fontSize: `${fontSize + 8}px` }}>
            {article.title}
          </h1>
          
          <div className="flex items-center gap-4 mb-6 text-sm opacity-60">
            <span>{article.source.name}</span>
            <span>•</span>
            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          </div>

          {article.urlToImage && (
            <img src={article.urlToImage} alt="" className="w-full h-64 object-cover rounded-xl mb-6" />
          )}

          <div style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}>
            {article.description && (
              <p className="text-xl mb-6 font-medium opacity-90">{article.description}</p>
            )}
            <p className="opacity-80">
              {article.content || article.description || 'Full article content not available. Please visit the original source.'}
            </p>
          </div>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-lg font-medium"
            style={{ 
              backgroundColor: isDark ? '#00f0ff' : '#2563eb',
              color: isDark ? '#000' : '#fff'
            }}
          >
            <BookOpen className="w-5 h-5" />
            Read Original
          </a>
        </article>
      </motion.div>
    </AnimatePresence>
  )
}

import { Zap } from 'lucide-react'
