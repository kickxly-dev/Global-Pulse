'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Zap, Palette } from 'lucide-react'

type Theme = 'cyber' | 'dark' | 'light'

const themes: Record<Theme, { name: string; icon: any; colors: Record<string, string> }> = {
  cyber: {
    name: 'Cyber',
    icon: Zap,
    colors: {
      '--cyber-blue': '#00f0ff',
      '--cyber-purple': '#bf00ff',
      '--cyber-pink': '#ff00aa',
      '--cyber-yellow': '#ffff00',
      '--cyber-green': '#00ff88',
      '--cyber-red': '#ff0055',
      '--cyber-dark': '#0a0a0a',
      '--cyber-darker': '#050505',
    }
  },
  dark: {
    name: 'Dark',
    icon: Moon,
    colors: {
      '--cyber-blue': '#3b82f6',
      '--cyber-purple': '#8b5cf6',
      '--cyber-pink': '#ec4899',
      '--cyber-yellow': '#eab308',
      '--cyber-green': '#22c55e',
      '--cyber-red': '#ef4444',
      '--cyber-dark': '#111827',
      '--cyber-darker': '#0f172a',
    }
  },
  light: {
    name: 'Light',
    icon: Sun,
    colors: {
      '--cyber-blue': '#2563eb',
      '--cyber-purple': '#7c3aed',
      '--cyber-pink': '#db2777',
      '--cyber-yellow': '#ca8a04',
      '--cyber-green': '#16a34a',
      '--cyber-red': '#dc2626',
      '--cyber-dark': '#f3f4f6',
      '--cyber-darker': '#ffffff',
    }
  },
}

export default function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('cyber')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load saved theme
    const saved = localStorage.getItem('theme') as Theme
    if (saved && themes[saved]) {
      setCurrentTheme(saved)
      applyTheme(saved)
    }
  }, [])

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement
    const themeColors = themes[theme].colors
    
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // Apply body class for light/dark mode
    document.body.classList.remove('theme-cyber', 'theme-dark', 'theme-light')
    document.body.classList.add(`theme-${theme}`)
    
    // Set background color
    if (theme === 'light') {
      document.body.style.backgroundColor = '#f3f4f6'
      document.body.style.color = '#111827'
    } else {
      document.body.style.backgroundColor = '#0a0a0a'
      document.body.style.color = '#f3f4f6'
    }
  }

  const changeTheme = (theme: Theme) => {
    setCurrentTheme(theme)
    localStorage.setItem('theme', theme)
    applyTheme(theme)
    setIsOpen(false)
  }

  const ThemeIcon = themes[currentTheme].icon

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-cyber-dark/50 border border-cyber-blue/30 hover:border-cyber-blue transition-colors"
      >
        <ThemeIcon className="w-5 h-5 text-cyber-blue" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-12 w-48 bg-cyber-dark border border-cyber-blue/30 rounded-lg shadow-xl overflow-hidden z-50"
          >
            <div className="p-2 border-b border-gray-700">
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <Palette className="w-3 h-3" />
                <span>Choose Theme</span>
              </div>
            </div>

            <div className="p-2 space-y-1">
              {(Object.keys(themes) as Theme[]).map((themeKey) => {
                const theme = themes[themeKey]
                const Icon = theme.icon
                const isActive = currentTheme === themeKey

                return (
                  <button
                    key={themeKey}
                    onClick={() => changeTheme(themeKey)}
                    className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-cyber-blue/20 border border-cyber-blue/50' 
                        : 'hover:bg-cyber-dark/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyber-blue' : 'text-gray-400'}`} />
                    <span className={`text-sm ${isActive ? 'text-cyber-blue' : 'text-gray-300'}`}>
                      {theme.name}
                    </span>
                    {isActive && (
                      <span className="ml-auto text-xs text-cyber-blue">✓</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Theme Preview */}
            <div className="p-2 border-t border-gray-700">
              <div className="flex space-x-1">
                {Object.entries(themes[currentTheme].colors).slice(0, 6).map(([key, value]) => (
                  <div
                    key={key}
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: value }}
                    title={key}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
