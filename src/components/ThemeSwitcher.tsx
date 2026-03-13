'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun, Monitor } from 'lucide-react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeSwitcherProps {
  className?: string
}

export default function ThemeSwitcher({ className = '' }: ThemeSwitcherProps) {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme') as Theme
    if (saved) {
      setTheme(saved)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }

    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  const themes: { value: Theme; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' }
  ]

  if (!mounted) {
    return (
      <div className={`p-2 rounded-lg ${className}`}>
        <div className="w-5 h-5 bg-white/10 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1">
        {themes.map((t) => {
          const Icon = t.icon
          const isActive = theme === t.value
          
          return (
            <motion.button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`relative px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'text-white bg-white/20'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="activeTheme"
                  className="absolute inset-0 bg-white/20 rounded-md -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
