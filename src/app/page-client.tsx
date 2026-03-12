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
import BookmarksPanel from '@/components/BookmarksPanel'
import UserMenu from '@/components/UserMenu'
import ThemeToggle from '@/components/ThemeToggle'
import MobileNav from '@/components/MobileNav'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import RelatedArticles from '@/components/RelatedArticles'
import ArticleReactions from '@/components/ArticleReactions'
import NewsletterSubscription from '@/components/NewsletterSubscription'
import ErrorBoundary from '@/components/ErrorBoundary'
import AdminPanel from '@/components/AdminPanel'
import ArticleView from '@/components/ArticleView'
import ModernNewsCard from '@/components/ModernNewsCard'
import ModernArticleView from '@/components/ModernArticleView'
import AISummaryPanel from '@/components/AISummaryPanel'
import TrendingTopicsTicker from '@/components/TrendingTopicsTicker'
import SmartSearch from '@/components/SmartSearch'
import VoiceNarrator from '@/components/VoiceNarrator'
import ReadingProgressTracker from '@/components/ReadingProgressTracker'
import { NewsCardSkeleton, CategorySkeleton } from '@/components/Skeleton'
import { NewStoryPulse, BreakingNewsAlert, LiveDataStream } from '@/components/StoryRipple'
import { PerformanceMonitor } from '@/hooks/usePerformanceMonitor'
import { DashboardCustomizer, useDashboardCustomization } from '@/hooks/useDashboardCustomization'
import { getGlobalMood } from '@/lib/aiAnalysis'
import { useVoiceControl } from '@/hooks/useVoiceControl'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useOfflineMode } from '@/hooks/useOfflineMode'
import { useBreakingNewsNotifications } from '@/hooks/useBreakingNewsNotifications'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useSearchHistory } from '@/hooks/useSearchHistory'
import { usePersonalization } from '@/hooks/usePersonalization'
import { useReadingGoals } from '@/hooks/useReadingGoals'
import { useThemeSchedule } from '@/hooks/useThemeSchedule'
import { Globe, Settings as SettingsIcon, Bell, TrendingUp, MapPin, Moon, Sun, Zap, Command, Bookmark, BarChart3, Wifi, WifiOff, Activity, X } from 'lucide-react'
import { useNewsData } from '@/hooks/useNewsData'
import { useNotifications } from '@/hooks/useNotifications'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useTheme } from '@/hooks/useTheme'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export default function HomePageClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>('general')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [country, setCountry] = useState<string>('us')
  const [showSettings, setShowSettings] = useState(false)
  const [showMap, setShowMap] = useState(true)
  const [showPulseScore, setShowPulseScore] = useState(true)
  const [showPulsePredict, setShowPulsePredict] = useState(true)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showDashboardCustomizer, setShowDashboardCustomizer] = useState(false)
  const [showPerformance, setShowPerformance] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<any>(null)
  const [fullArticleView, setFullArticleView] = useState<any>(null)
  const [aiSummaryArticle, setAiSummaryArticle] = useState<any>(null)
  const [voiceArticle, setVoiceArticle] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('home')
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
  
  // Infinite scroll
  const { displayedItems, hasMore, loaderRef } = useInfiniteScroll({ items: articles, pageSize: 10 })
  
  // Offline mode
  const { isOnline, offlineArticles, saveForOffline, isArticleOffline } = useOfflineMode()
  
  // Breaking news notifications
  const { settings: notifSettings, requestPermission: requestNotifPermission, checkAndNotify } = useBreakingNewsNotifications()
  
  // Analytics
  const { stats: analyticsStats, trackArticleRead } = useAnalytics()
  
  // Search History
  const { addSearch, getRecent, getTrending } = useSearchHistory()
  
  // Personalization
  const { trackInteraction, getRecommendedArticles, getTopCategories } = usePersonalization()
  
  // Reading Goals
  const { goals, streak, updateGoal, getProgress } = useReadingGoals()
  
  // Dashboard Customization
  const { widgets, toggleWidget, reorderWidgets, resetToDefaults, getEnabledWidgets } = useDashboardCustomization()
  
  const { permission, requestPermission } = useNotifications()
  const { theme, changeTheme } = useTheme()
  
  // Theme Scheduling
  useThemeSchedule(theme, (t: string) => changeTheme(t as any))

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
      addSearch(query)
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
    <div className={`min-h-screen bg-cyber-darker ${theme === 'light' ? 'theme-light' : theme === 'dark' ? 'theme-dark' : 'theme-cyber'}`}>
        <NotificationManager />
        <LiveDataStream />
        <NewStoryPulse trigger={newStoryAnimation} />
        <BreakingNewsAlert show={breakingNewsAlert} />
      
      {/* Header - Modern Glassmorphism */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="relative group cursor-pointer">
                <Globe className="w-10 h-10 text-cyber-blue group-hover:animate-spin-slow transition-all" />
                <div className="absolute inset-0 bg-cyber-blue/20 rounded-full blur-xl group-hover:bg-cyber-blue/40 transition-all" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent hidden sm:block">
                  Global Pulse
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Real-time Global Intelligence</p>
              </div>
            </motion.div>
            
            {/* Right Section - Modern */}
            <div className="flex items-center space-x-3">
              {!isOnline && (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 text-sm">
                  <WifiOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Offline</span>
                </div>
              )}
              
              <LiveIndicator count={totalResults} />
              
              {/* Analytics */}
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${showAnalytics ? 'bg-cyber-purple/20 border-cyber-purple text-cyber-purple' : 'bg-white/5 border-white/10 text-gray-300 hover:border-cyber-purple/50'}`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Analytics</span>
              </button>
              
              {/* Bookmarks */}
              <button
                onClick={() => setShowBookmarks(!showBookmarks)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${showBookmarks ? 'bg-cyber-yellow/20 border-cyber-yellow text-cyber-yellow' : 'bg-white/5 border-white/10 text-gray-300 hover:border-cyber-yellow/50'}`}
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Saved</span>
              </button>
              
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${showSettings ? 'bg-cyber-blue/20 border-cyber-blue text-cyber-blue' : 'bg-white/5 border-white/10 text-gray-300 hover:border-cyber-blue/50'}`}
              >
                <SettingsIcon className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Settings</span>
              </button>

              {/* Keyboard Shortcuts */}
              <button
                onClick={() => showShortcutsHelp()}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:border-cyber-green/50 transition-all"
                title="Keyboard shortcuts (?)"
              >
                <Command className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Keys</span>
              </button>
              
              {/* User Menu */}
              <div className="pl-2 border-l border-white/10">
                <UserMenu />
              </div>
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

      {/* Trending Topics Ticker */}
      <TrendingTopicsTicker />

      {/* Smart Search */}
      <div className="container mx-auto px-4 py-6">
        <SmartSearch 
          onSearch={(query) => {
            setSearchQuery(query)
            addSearch(query)
          }}
        />
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav 
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          if (tab === 'bookmarks') setShowBookmarks(true)
          if (tab === 'analytics') setShowAnalytics(true)
          if (tab === 'settings') setShowSettings(true)
        }}
        onOpenSearch={() => searchInputRef.current?.focus()}
      />

      {/* Analytics Dashboard */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="container mx-auto px-4 mb-6"
          >
            <AnalyticsDashboard />
          </motion.div>
        )}
      </AnimatePresence>

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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* News Feed */}
          <div className="lg:col-span-3">
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
                      setFullArticleView(a)
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
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
                    Latest News
                  </h2>
                  <span className="text-gray-400 text-sm">
                    {articles.length} stories
                  </span>
                </div>
                
                {/* Modern Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {articles.map((article, index) => (
                    <ModernNewsCard
                      key={article.id}
                      article={article}
                      index={index}
                      onRead={(a) => {
                        setFullArticleView(a)
                        if (zenMode) {
                          setSelectedZenArticle(a)
                        }
                      }}
                      onBookmark={(a) => {
                        const saved = localStorage.getItem('bookmarkedArticles')
                        setBookmarkedArticles(saved ? JSON.parse(saved) : [])
                      }}
                      onAiSummary={(a) => {
                        setAiSummaryArticle(a)
                      }}
                    />
                  ))}
                </div>
                
                {/* Load More Trigger */}
                {hasMore && (
                  <div ref={loaderRef} className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
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

            {/* Reading Progress Tracker */}
            <ReadingProgressTracker />

            {/* Newsletter */}
            <NewsletterSubscription />
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

      {/* Dashboard Customizer */}
      <AnimatePresence>
        {showDashboardCustomizer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDashboardCustomizer(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full"
            >
              <DashboardCustomizer
                widgets={widgets}
                onToggle={toggleWidget}
                onReorder={reorderWidgets}
                onReset={resetToDefaults}
                onClose={() => setShowDashboardCustomizer(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Monitor */}
      <PerformanceMonitor show={showPerformance} />

      {/* Related Articles for selected article */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-cyber-dark border border-cyber-blue/30 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-cyber-blue">{selectedArticle.title}</h2>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-300">{selectedArticle.description}</p>
              </div>
              
              <ArticleReactions articleId={selectedArticle.id} />
              
              <RelatedArticles
                article={selectedArticle}
                allArticles={articles}
                onArticleClick={(article) => setSelectedArticle(article)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Panel - Secret: Ctrl+Shift+A */}
      <AdminPanel />

      {/* Full Article View - Modern */}
      <ModernArticleView
        article={fullArticleView}
        allArticles={articles}
        isOpen={!!fullArticleView}
        onClose={() => setFullArticleView(null)}
        onArticleClick={(article) => {
          setFullArticleView(article)
        }}
      />

      {/* AI Summary Panel */}
      <AISummaryPanel
        article={aiSummaryArticle}
        isOpen={!!aiSummaryArticle}
        onClose={() => setAiSummaryArticle(null)}
      />

      {/* Voice Narrator */}
      <VoiceNarrator
        text={voiceArticle?.content || voiceArticle?.description || ''}
        isOpen={!!voiceArticle}
        onClose={() => setVoiceArticle(null)}
      />
    </div>
  )
}
