'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard, X, Command, Search, Bookmark, Moon, Sun, Zap, Clock, BookOpen, RefreshCw, Home, ArrowUp, ArrowDown } from 'lucide-react'

interface KeyboardShortcutsProps {
  isOpen: boolean
  onClose: () => void
}

const shortcuts = [
  { keys: ['/'], action: 'Open search', icon: Search },
  { keys: ['B'], action: 'Toggle bookmarks', icon: Bookmark },
  { keys: ['T'], action: 'Toggle theme', icon: Moon },
  { keys: ['R'], action: 'Refresh news', icon: RefreshCw },
  { keys: ['H'], action: 'Go to home', icon: Home },
  { keys: ['Z'], action: 'Zen mode', icon: BookOpen },
  { keys: ['S'], action: 'Speed read mode', icon: Zap },
  { keys: ['D'], action: 'Daily digest', icon: Clock },
  { keys: ['↑'], action: 'Scroll up', icon: ArrowUp },
  { keys: ['↓'], action: 'Scroll down', icon: ArrowDown },
  { keys: ['Esc'], action: 'Close modal', icon: X },
  { keys: ['?'], action: 'Show shortcuts', icon: Keyboard },
]

export default function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-black border border-white/10 rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold">Keyboard Shortcuts</h3>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shortcuts Grid */}
            <div className="p-4 grid grid-cols-2 gap-3">
              {shortcuts.map((shortcut, i) => {
                const Icon = shortcut.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, j) => (
                        <kbd
                          key={j}
                          className="min-w-[24px] h-6 px-2 bg-white/10 border border-white/20 rounded text-xs font-mono flex items-center justify-center"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                    <span className="text-sm text-white/60">{shortcut.action}</span>
                  </motion.div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/[0.02]">
              <p className="text-xs text-white/40 text-center">
                Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] mx-1">?</kbd> anytime to see this panel
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
