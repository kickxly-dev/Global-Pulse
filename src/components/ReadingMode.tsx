'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, X, Type, AlignLeft, AlignCenter, Sun, Moon, Minus, Plus } from 'lucide-react'
import { NewsArticle } from '@/types/news'

interface ReadingModeProps {
  article: NewsArticle | null
  isOpen: boolean
  onClose: () => void
}

interface ReadingSettings {
  fontSize: number
  lineHeight: number
  textAlign: 'left' | 'justify'
  theme: 'light' | 'sepia' | 'dark'
  fontFamily: 'sans' | 'serif'
}

const defaultSettings: ReadingSettings = {
  fontSize: 18,
  lineHeight: 1.8,
  textAlign: 'left',
  theme: 'dark',
  fontFamily: 'sans',
}

export default function ReadingMode({ article, isOpen, onClose }: ReadingModeProps) {
  const [settings, setSettings] = useState<ReadingSettings>(defaultSettings)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('readingSettings')
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) })
      } catch (e) {
        console.error('Failed to parse reading settings:', e)
      }
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('readingSettings', JSON.stringify(settings))
    }
  }, [settings, mounted])

  if (!isOpen || !article) return null

  const themeStyles = {
    light: {
      bg: '#ffffff',
      text: '#1a1a1a',
      accent: '#3b82f6',
    },
    sepia: {
      bg: '#f4ecd8',
      text: '#5b4636',
      accent: '#8b6914',
    },
    dark: {
      bg: '#0a0a0f',
      text: '#e5e7eb',
      accent: '#00f0ff',
    },
  }

  const currentTheme = themeStyles[settings.theme]

  const updateSetting = <K extends keyof ReadingSettings>(key: K, value: ReadingSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(14, Math.min(24, settings.fontSize + delta))
    updateSetting('fontSize', newSize)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-hidden"
        style={{ backgroundColor: currentTheme.bg }}
      >
        {/* Header Toolbar */}
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 right-0 z-50 px-4 py-3 border-b backdrop-blur-md"
          style={{ 
            backgroundColor: `${currentTheme.bg}ee`,
            borderColor: `${currentTheme.text}20`,
          }}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {/* Left: Close & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  color: currentTheme.text,
                  backgroundColor: `${currentTheme.text}10`,
                }}
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium truncate max-w-[200px]" style={{ color: currentTheme.text }}>
                {article.source.name}
              </span>
            </div>

            {/* Center: Reading Controls */}
            <div className="flex items-center gap-2">
              {/* Font Size */}
              <div className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: `${currentTheme.text}10` }}>
                <button
                  onClick={() => adjustFontSize(-2)}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: currentTheme.text }}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <Type className="w-4 h-4" style={{ color: currentTheme.text }} />
                <button
                  onClick={() => adjustFontSize(2)}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: currentTheme.text }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Text Align */}
              <button
                onClick={() => updateSetting('textAlign', settings.textAlign === 'left' ? 'justify' : 'left')}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  color: currentTheme.text,
                  backgroundColor: `${currentTheme.text}10`,
                }}
              >
                {settings.textAlign === 'left' ? <AlignLeft className="w-4 h-4" /> : <AlignCenter className="w-4 h-4" />}
              </button>

              {/* Theme Toggle */}
              <div className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: `${currentTheme.text}10` }}>
                <button
                  onClick={() => updateSetting('theme', 'light')}
                  className={`p-1.5 rounded transition-colors ${settings.theme === 'light' ? 'bg-white/20' : ''}`}
                >
                  <Sun className="w-4 h-4" style={{ color: currentTheme.text }} />
                </button>
                <button
                  onClick={() => updateSetting('theme', 'sepia')}
                  className={`p-1.5 rounded transition-colors ${settings.theme === 'sepia' ? 'bg-yellow-900/20' : ''}`}
                  style={{ color: currentTheme.text }}
                >
                  <BookOpen className="w-4 h-4" />
                </button>
                <button
                  onClick={() => updateSetting('theme', 'dark')}
                  className={`p-1.5 rounded transition-colors ${settings.theme === 'dark' ? 'bg-black/20' : ''}`}
                >
                  <Moon className="w-4 h-4" style={{ color: currentTheme.text }} />
                </button>
              </div>
            </div>

            {/* Right: Font Family */}
            <button
              onClick={() => updateSetting('fontFamily', settings.fontFamily === 'sans' ? 'serif' : 'sans')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{ 
                color: currentTheme.text,
                backgroundColor: `${currentTheme.text}10`,
                fontFamily: settings.fontFamily === 'sans' ? 'sans-serif' : 'serif',
              }}
            >
              {settings.fontFamily === 'sans' ? 'Sans' : 'Serif'}
            </button>
          </div>
        </motion.div>

        {/* Article Content */}
        <div 
          className="h-full overflow-y-auto pt-20 pb-10 px-4"
          style={{ backgroundColor: currentTheme.bg }}
        >
          <article 
            className="max-w-3xl mx-auto"
            style={{
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineHeight,
              fontFamily: settings.fontFamily === 'sans' ? 'system-ui, sans-serif' : 'Georgia, serif',
            }}
          >
            {/* Title */}
            <h1 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ 
                color: currentTheme.text,
                textAlign: settings.textAlign,
              }}
            >
              {article.title}
            </h1>

            {/* Meta */}
            <div 
              className="flex flex-wrap items-center gap-4 mb-8 text-sm"
              style={{ color: `${currentTheme.text}80` }}
            >
              <span>{article.author || article.source.name}</span>
              <span>•</span>
              <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
              {article.category && (
                <>
                  <span>•</span>
                  <span 
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${currentTheme.accent}20`,
                      color: currentTheme.accent,
                    }}
                  >
                    {article.category}
                  </span>
                </>
              )}
            </div>

            {/* Hero Image */}
            {article.urlToImage && (
              <div className="mb-8 rounded-xl overflow-hidden">
                <img 
                  src={article.urlToImage} 
                  alt={article.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Description / Lead */}
            {article.description && (
              <p 
                className="text-xl mb-8 font-medium leading-relaxed"
                style={{ 
                  color: currentTheme.text,
                  textAlign: settings.textAlign,
                }}
              >
                {article.description}
              </p>
            )}

            {/* Main Content */}
            <div 
              className="prose prose-lg max-w-none"
              style={{ 
                color: currentTheme.text,
                textAlign: settings.textAlign,
              }}
            >
              {article.content ? (
                article.content
                  .replace(/\[\+\d+\s*chars\]$/g, '')
                  .split('\n')
                  .filter(p => p.trim())
                  .map((paragraph, i) => (
                    <p key={i} className="mb-6">
                      {paragraph}
                    </p>
                  ))
              ) : (
                <p className="italic opacity-60">
                  Full article content not available. Please visit the original source to read more.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t" style={{ borderColor: `${currentTheme.text}20` }}>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-80"
                style={{ 
                  backgroundColor: currentTheme.accent,
                  color: settings.theme === 'light' ? '#ffffff' : '#000000',
                }}
              >
                <BookOpen className="w-5 h-5" />
                Read Original Article
              </a>
            </div>
          </article>
        </div>

        {/* Progress Bar */}
        <ReadingProgress theme={currentTheme} />
      </motion.div>
    </AnimatePresence>
  )
}

function ReadingProgress({ theme }: { theme: { bg: string; text: string; accent: string } }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight - windowHeight
      const scrollTop = window.scrollY
      const scrollProgress = (scrollTop / documentHeight) * 100
      setProgress(Math.min(100, Math.max(0, scrollProgress)))
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-1 z-[60]"
      style={{ backgroundColor: `${theme.text}10` }}
    >
      <motion.div 
        className="h-full"
        style={{ backgroundColor: theme.accent }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  )
}
