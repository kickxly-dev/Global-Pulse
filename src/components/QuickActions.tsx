'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, BookOpen, MessageCircle, Share2, Bookmark, 
  Moon, Sun, Type, Search, Zap, X, ChevronUp,
  Keyboard, Settings, HelpCircle
} from 'lucide-react'
import { NewsArticle } from '@/types/news'

interface QuickActionsProps {
  onReadingMode: () => void
  onComments: () => void
  onShare: () => void
  onBookmark: () => void
  isBookmarked: boolean
  onSearch: () => void
  onThemeToggle: () => void
  isDarkMode: boolean
}

export default function QuickActions({
  onReadingMode,
  onComments,
  onShare,
  onBookmark,
  isBookmarked,
  onSearch,
  onThemeToggle,
  isDarkMode,
}: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Quick actions with 'Q' key
      if (e.key === 'q' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (document.activeElement?.tagName !== 'INPUT' && 
            document.activeElement?.tagName !== 'TEXTAREA') {
          setIsOpen(prev => !prev)
        }
      }
      
      // Direct shortcuts
      if (!isOpen) {
        if (e.key === 'r' || e.key === 'R') onReadingMode()
        if (e.key === 'c' || e.key === 'C') onComments()
        if (e.key === 's' || e.key === 'S') onShare()
        if (e.key === 'b' || e.key === 'B') onBookmark()
        if (e.key === '/' && !e.ctrlKey) {
          e.preventDefault()
          onSearch()
        }
        if (e.key === 't' || e.key === 'T') onThemeToggle()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onReadingMode, onComments, onShare, onBookmark, onSearch, onThemeToggle])

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowShortcuts(true)
    }, 800)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }

  const actions = [
    { 
      icon: BookOpen, 
      label: 'Reading Mode', 
      shortcut: 'R',
      onClick: () => { onReadingMode(); setIsOpen(false) },
      color: 'bg-blue-500',
    },
    { 
      icon: MessageCircle, 
      label: 'Comments', 
      shortcut: 'C',
      onClick: () => { onComments(); setIsOpen(false) },
      color: 'bg-green-500',
    },
    { 
      icon: Share2, 
      label: 'Share', 
      shortcut: 'S',
      onClick: () => { onShare(); setIsOpen(false) },
      color: 'bg-purple-500',
    },
    { 
      icon: Bookmark, 
      label: isBookmarked ? 'Bookmarked' : 'Bookmark', 
      shortcut: 'B',
      onClick: () => { onBookmark(); setIsOpen(false) },
      color: isBookmarked ? 'bg-yellow-500' : 'bg-gray-500',
    },
    { 
      icon: Search, 
      label: 'Search', 
      shortcut: '/',
      onClick: () => { onSearch(); setIsOpen(false) },
      color: 'bg-cyan-500',
    },
    { 
      icon: isDarkMode ? Sun : Moon, 
      label: isDarkMode ? 'Light Mode' : 'Dark Mode', 
      shortcut: 'T',
      onClick: () => { onThemeToggle(); setIsOpen(false) },
      color: 'bg-orange-500',
    },
  ]

  return (
    <>
      {/* Main FAB */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute bottom-16 right-0 space-y-3"
            >
              {actions.map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: 20, scale: 0 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={action.onClick}
                  className={`flex items-center gap-3 px-4 py-3 ${action.color} text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 whitespace-nowrap`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="font-medium">{action.label}</span>
                  <span className="text-xs opacity-60 bg-black/20 px-1.5 py-0.5 rounded">
                    {action.shortcut}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          onMouseDown={handleLongPressStart}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
          onTouchStart={handleLongPressStart}
          onTouchEnd={handleLongPressEnd}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-colors ${
            isOpen ? 'bg-red-500 rotate-45' : 'bg-cyber-blue'
          }`}
        >
          {isOpen ? (
            <Plus className="w-7 h-7 text-white" />
          ) : (
            <Zap className="w-7 h-7 text-gray-900" />
          )}
        </motion.button>

        {/* Hint */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-10 right-0 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap"
          >
            Press Q or hold for shortcuts
          </motion.div>
        )}
      </div>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyber-blue/20 rounded-lg">
                    <Keyboard className="w-6 h-6 text-cyber-blue" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
                </div>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'Q', desc: 'Toggle quick actions menu' },
                  { key: 'R', desc: 'Reading mode' },
                  { key: 'C', desc: 'Comments' },
                  { key: 'S', desc: 'Share article' },
                  { key: 'B', desc: 'Bookmark article' },
                  { key: '/', desc: 'Search' },
                  { key: 'T', desc: 'Toggle theme' },
                  { key: 'ESC', desc: 'Close modals' },
                  { key: 'Space', desc: 'Scroll down' },
                  { key: 'Shift + Space', desc: 'Scroll up' },
                ].map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                  >
                    <span className="text-gray-300">{shortcut.desc}</span>
                    <kbd className="px-3 py-1 bg-gray-700 text-white text-sm font-mono rounded border border-gray-600">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-500 text-center">
                  Hold the Quick Actions button to see this help again
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
