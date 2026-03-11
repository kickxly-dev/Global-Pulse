'use client'

import { useState, useEffect, useRef } from 'react'
import NewsFeed from '@/components/NewsFeed'
import NewsMap from '@/components/NewsMap'
import SearchBar from '@/components/SearchBar'
import Settings from '@/components/Settings'
import NotificationManager from '@/components/NotificationManager'
import LiveIndicator from '@/components/LiveIndicator'
import PulseScore from '@/components/PulseScore'
import TrendingTopics from '@/components/TrendingTopics'
import PulsePredict from '@/components/PulsePredict'
import DJMode from '@/components/DJMode'
import ReadingModes, { ZenModeOverlay } from '@/components/ReadingModes'
import EnhancedNewsCard from '@/components/EnhancedNewsCard'
import { NewStoryPulse, BreakingNewsAlert, LiveDataStream } from '@/components/StoryRipple'
import { getGlobalMood } from '@/lib/aiAnalysis'
import { useVoiceControl } from '@/hooks/useVoiceControl'
import { Activity, Globe, Settings as SettingsIcon, Bell, TrendingUp, MapPin, Moon, Sun, Zap, Command } from 'lucide-react'
import { useNewsData } from '@/hooks/useNewsData'
import { useNotifications } from '@/hooks/useNotifications'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useTheme } from '@/hooks/useTheme'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

// Disable static generation for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('general')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [country, setCountry] = useState<string>('us')
  const [showSettings, setShowSettings] = useState(false)
  const [showMap, setShowMap] = useState(true)
  const [showPulseScore, setShowPulseScore] = useState(true)
  const [showPulsePredict, setShowPulsePredict] = useState(true)
  const [newStoryAnimation, setNewStoryAnimation] = useState(false)
  const [breakingNewsAlert, setBreakingNewsAlert] = useState(false)
  const [tldrMode, setTldrMode] = useState(false)
  const [speedReadMode, setSpeedReadMode] = useState(false)
  const [zenMode, setZenMode] = useState(false)
  const [djMode, setDjMode] = useState(false)
  const [selectedZenArticle, setSelectedZenArticle] = useState<any>(null)
  const [bookmarkedArticles, setBookmarkedArticles] = useState<any[]>([])
  const [globalMood, setGlobalMood] = useState<any>(null)
  const previousArticleCount = useRef(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const { articles, loading, error, refresh, totalResults } = useNewsData({
    category: selectedCategory,
    query: searchQuery,
    country: country,
  })
  
  const { permission, requestPermission } = useNotifications()
  const { theme, changeTheme } = useTheme()

  const categories = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'technology', name: 'Technology', icon: Activity },
    { id: 'business', name: 'Business', icon: TrendingUp },
    { id: 'health', name: 'Health', icon: Activity },
    { id: 'science', name: 'Science', icon: Activity },
    { id: 'sports', name: 'Sports', icon: Activity },
    { id: 'entertainment', name: 'Entertainment', icon: Activity },
  ]

  // Navigate categories with keyboard
  const navigateCategory = (direction: 'next' | 'prev') => {
    const currentIndex = categories.findIndex(cat => cat.id === selectedCategory)
    if (direction === 'next') {
      const nextIndex = (currentIndex + 1) % categories.length
      setSelectedCategory(categories[nextIndex].id)
    } else {
      const prevIndex = currentIndex === 0 ? categories.length - 1 : currentIndex - 1
      setSelectedCategory(categories[prevIndex].id)
    }
  }

  // Cycle through themes
  const cycleTheme = () => {
    const themes = ['cyber', 'dark', 'light']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length] as any
    changeTheme(nextTheme)
    toast.success(`Theme switched to ${nextTheme.toUpperCase()}`, {
      icon: nextTheme === 'light' ? '☀️' : nextTheme === 'dark' ? '🌙' : '⚡'
    })
  }

  // Setup voice control
  const {
    isListening,
    toggleListening,
    readArticle,
    showVoiceHelp
  } = useVoiceControl({
    onCommand: (cmd) => {
      if (cmd === 'refresh') refresh()
    },
    onSearch: (query) => {
      setSearchQuery(query)
    },
    onNavigate: (direction) => navigateCategory(direction),
    onReadArticle: (index) => {
      if (articles[index]) {
        const article = articles[index]
        readArticle({
          title: article.title,
          description: article.description || undefined,
          source: article.source
        })
      }
    }
  })

  // Setup keyboard shortcuts
  const { showShortcutsHelp } = useKeyboardShortcuts({
    onRefresh: refresh,
    onSearch: () => searchInputRef.current?.focus(),
    onToggleMap: () => setShowMap(prev => !prev),
    onToggleSettings: () => setShowSettings(prev => !prev),
    onNextCategory: () => navigateCategory('next'),
    onPrevCategory: () => navigateCategory('prev'),
    onToggleTheme: cycleTheme,
    onToggleNotifications: requestPermission,
  })

  // Calculate global mood
  useEffect(() => {
    if (articles.length > 0) {
      const mood = getGlobalMood(articles)
      setGlobalMood(mood)
    }
  }, [articles])

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bookmarkedArticles')
    if (saved) {
      setBookmarkedArticles(JSON.parse(saved))
    }
  }, [])

  // Check for new stories and trigger animations
  useEffect(() => {
    if (articles.length > previousArticleCount.current && previousArticleCount.current > 0) {
      // New stories detected!
      const newCount = articles.length - previousArticleCount.current
      
      // Trigger ripple animation
      setNewStoryAnimation(true)
      setTimeout(() => setNewStoryAnimation(false), 1500)
      
      // Check for breaking news
      const hasBreaking = articles.some(article => {
        const publishedTime = new Date(article.publishedAt).getTime()
        const now = Date.now()
        return (now - publishedTime) < (60 * 60 * 1000) // 1 hour
      })
      
      if (hasBreaking) {
        setBreakingNewsAlert(true)
        setTimeout(() => setBreakingNewsAlert(false), 5000)
      }
    }
    previousArticleCount.current = articles.length
  }, [articles])

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  return (
    <div className="min-h-screen bg-cyber-darker cyber-grid relative">
      <div className="scan-line"></div>
      
      <NotificationManager />
      <LiveDataStream />
      <NewStoryPulse trigger={newStoryAnimation} />
      <BreakingNewsAlert show={breakingNewsAlert} />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-cyber-dark/90 backdrop-blur-cyber border-b border-cyber-blue/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="relative">
                <Globe className="w-8 h-8 text-cyber-blue animate-pulse-glow" />
                <div className="pulse-dot absolute -top-1 -right-1"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-cyber text-gradient">
                  GLOBAL PULSE
                </h1>
                <p className="text-xs text-gray-400 font-mono">Hear the world.</p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <LiveIndicator count={totalResults} />
              
              <button
                onClick={() => requestPermission()}
                className={`cyber-button flex items-center space-x-2 ${
                  permission === 'granted' ? 'bg-cyber-green/10 border-cyber-green text-cyber-green' : ''
                }`}
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {permission === 'granted' ? 'Notifications On' : 'Enable Alerts'}
                </span>
              </button>

              <button
                onClick={() => setShowMap(!showMap)}
                className="cyber-button flex items-center space-x-2"
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Map</span>
              </button>

              <button
                onClick={cycleTheme}
                className="cyber-button flex items-center space-x-2"
                title="Switch theme (Ctrl+T)"
              >
                {theme === 'light' ? (
                  <Sun className="w-4 h-4" />
                ) : theme === 'dark' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                <span className="hidden sm:inline capitalize">{theme}</span>
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="cyber-button flex items-center space-x-2"
              >
                <SettingsIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>

              <button
                onClick={() => showShortcutsHelp()}
                className="cyber-button flex items-center space-x-2"
                title="Keyboard shortcuts (?)"
              >
                <Command className="w-4 h-4" />
                <span className="hidden sm:inline">Keys</span>
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex items-center space-x-2 pb-4 overflow-x-auto scrollbar-thin">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md border transition-all duration-300 whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-cyber-blue/20 border-cyber-blue text-cyber-blue shadow-glow-blue'
                      : 'bg-cyber-dark/50 border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-4">
        <SearchBar 
          onSearch={setSearchQuery}
          onCountryChange={setCountry}
          currentCountry={country}
        />
      </div>

      {/* Reading Modes */}
      <ReadingModes
        tldrMode={tldrMode}
        speedReadMode={speedReadMode}
        zenMode={zenMode}
        djMode={djMode}
        voiceEnabled={isListening}
        onTldrToggle={() => setTldrMode(prev => !prev)}
        onSpeedReadToggle={() => setSpeedReadMode(prev => !prev)}
        onZenToggle={() => setZenMode(prev => !prev)}
        onDjToggle={() => setDjMode(prev => !prev)}
        onVoiceToggle={toggleListening}
        bookmarkCount={bookmarkedArticles.length}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* News Feed */}
          <div className="lg:col-span-2">
            {(tldrMode || speedReadMode) ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold font-cyber text-gradient mb-4">
                  {tldrMode ? 'AI Summaries' : 'Live News Feed'}
                </h2>
                {articles.map((article, index) => (
                  <EnhancedNewsCard
                    key={article.id}
                    article={article}
                    index={index}
                    tldrMode={tldrMode}
                    speedReadMode={speedReadMode}
                    onRead={(a) => {
                      if (zenMode) {
                        setSelectedZenArticle(a)
                      }
                    }}
                    onBookmark={(a) => {
                      const saved = localStorage.getItem('bookmarkedArticles')
                      setBookmarkedArticles(saved ? JSON.parse(saved) : [])
                    }}
                  />
                ))}
              </div>
            ) : (
              <NewsFeed 
                articles={articles}
                loading={loading}
                error={error}
                onRefresh={refresh}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pulse Score */}
            {showPulseScore && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <PulseScore articles={articles} totalResults={totalResults} />
              </motion.div>
            )}

            {/* Map */}
            {showMap && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="cyber-card"
              >
                <h2 className="text-lg font-bold font-cyber text-cyber-blue mb-4">
                  Global Activity Map
                </h2>
                <NewsMap articles={articles} />
              </motion.div>
            )}

            {/* Settings Panel */}
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Settings />
              </motion.div>
            )}

            {/* DJ Mode */}
            {globalMood && (
              <DJMode
                globalMood={globalMood.mood}
                moodScore={globalMood.moodScore}
                enabled={djMode}
                onToggle={() => setDjMode(prev => !prev)}
              />
            )}

            {/* Pulse Predict */}
            {showPulsePredict && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <PulsePredict articles={articles} />
              </motion.div>
            )}

            {/* Live Stats */}
            <div className="cyber-card">
              <h2 className="text-lg font-bold font-cyber text-cyber-purple mb-4">
                Live Statistics
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Stories</span>
                  <span className="text-lg font-bold text-cyber-blue">{totalResults.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Active Sources</span>
                  <span className="text-lg font-bold text-cyber-green">
                    {new Set(articles.map(a => a.source.name)).size}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Last Updated</span>
                  <span className="text-xs text-gray-500">Just now</span>
                </div>
              </div>
            </div>

            {/* Trending Topics */}
            <TrendingTopics articles={articles} />

            {/* Top Sources */}
            <div className="cyber-card">
              <h2 className="text-lg font-bold font-cyber text-cyber-yellow mb-4">
                Top Sources
              </h2>
              <div className="space-y-2">
                {Array.from(new Set(articles.slice(0, 5).map(a => a.source.name))).map((source, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-cyber-blue rounded-full"></div>
                    <span className="text-gray-300">{source}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyber-blue/20 bg-cyber-dark/50 backdrop-blur-md py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            Global Pulse &copy; {new Date().getFullYear()} - Hear the world.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Powered by NewsAPI • Real-time global news coverage
          </p>
        </div>
      </footer>

      {/* Zen Mode Overlay */}
      {selectedZenArticle && (
        <ZenModeOverlay
          article={selectedZenArticle}
          onClose={() => setSelectedZenArticle(null)}
        />
      )}
    </div>
  )
}
