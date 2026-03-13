'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import {
  Globe, Bookmark, RefreshCw, Share2,
  X, Newspaper, Moon, Sun, Zap,
  Clock, BookOpen, Heart, Flame, ArrowRight, Menu, Sparkles, Radio, Bell, AlertTriangle,
  Search, ChevronUp, Eye, ThumbsUp, HelpCircle, Play, Pause, ArrowUpRight, TrendingUp,
  MessageCircle, Loader2, RefreshCcw, Sparkles as SparklesIcon, Mic
} from 'lucide-react'
import { useNewsData } from '@/hooks/useNewsData'
import { useTheme } from '@/hooks/useTheme'
import ModernArticleView from '@/components/ModernArticleView'
import ShareModal from '@/components/ShareModal'
import DailyDigest from '@/components/DailyDigest'
import WorldMap from '@/components/WorldMap'
import CleanLoader from '@/components/CleanLoader'
import OfflineIndicator from '@/components/OfflineIndicator'
import AuthModal from '@/components/AuthModal'
import TrendingSidebar from '@/components/TrendingSidebar'
import NewsTimeline from '@/components/NewsTimeline'
import VoiceSearch from '@/components/VoiceSearch'
import NewsQuiz from '@/components/NewsQuiz'
import SharePanel from '@/components/SharePanel'
import KeyboardShortcuts from '@/components/KeyboardShortcuts'
import CategoriesCarousel from '@/components/CategoriesCarousel'
import AIRecommendations from '@/components/AIRecommendations'
import SocialFeed from '@/components/SocialFeed'
import BreakingNewsAlerts from '@/components/BreakingNewsAlerts'
import SentimentDashboard from '@/components/SentimentDashboard'
import NewsComparison from '@/components/NewsComparison'
import FactCheckIntegration from '@/components/FactCheckIntegration'
import NewsTranslation from '@/components/NewsTranslation'

export default function HomePageClient() {
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookmarkedArticles, setBookmarkedArticles] = useState<any[]>([])
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<any>(null)
  const [showArticle, setShowArticle] = useState(false)
  const [shareArticle, setShareArticle] = useState<any>(null)
  const [showShare, setShowShare] = useState(false)
  const [showDailyDigest, setShowDailyDigest] = useState(false)
  const [tldrMode, setTldrMode] = useState(false)
  const [speedReadMode, setSpeedReadMode] = useState(false)
  const [zenMode, setZenMode] = useState(false)
  const [displayedCount, setDisplayedCount] = useState(12)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [newArticlesCount, setNewArticlesCount] = useState(0)
  const [showNewArticlesBadge, setShowNewArticlesBadge] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showSearch, setShowSearch] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [tickerPaused, setTickerPaused] = useState(false)
  const [hoveredArticle, setHoveredArticle] = useState<any>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string } | null>(null)
  const [showVoiceSearch, setShowVoiceSearch] = useState(false)
  const [showSharePanel, setShowSharePanel] = useState(false)
  const [shareArticleData, setShareArticleData] = useState<any>(null)
  const [showTimeline, setShowTimeline] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [showSocialFeed, setShowSocialFeed] = useState(false)
  const [socialFeedArticle, setSocialFeedArticle] = useState<any>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const { scrollYProgress } = useScroll()
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const headerOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0.95])
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 1.1])
  
  const { articles, loading, error, refresh, lastRefresh, newArticlesCount: hookNewCount, breakingNews } = useNewsData({
    category: selectedCategory,
    query: searchQuery,
    country: 'us',
    refreshInterval: 15000, // 15 seconds for real-time updates
    autoRefresh: true
  })

  // Track online status
  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Hide initial loader after first load
  useEffect(() => {
    if (!loading && articles.length > 0) {
      setTimeout(() => setInitialLoad(false), 2000)
    }
  }, [loading, articles])

  // Check for existing auth on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser))
      }
    } catch (err) {
      console.error('Failed to load user:', err)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('user')
    setCurrentUser(null)
  }
  
  const { theme, changeTheme } = useTheme()

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bookmarkedArticles')
      if (saved) setBookmarkedArticles(JSON.parse(saved))
    } catch (err) {
      console.error('Failed to load bookmarks:', err)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Show notification when hook detects new articles
  useEffect(() => {
    if (hookNewCount > 0) {
      setNewArticlesCount(hookNewCount)
      setShowNewArticlesBadge(true)
    }
  }, [hookNewCount])

  // Breaking news alert
  useEffect(() => {
    if (breakingNews && breakingNews.length > 0) {
      // Flash the ticker
      setTickerPaused(false)
    }
  }, [breakingNews])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      if (e.key === '/') {
        e.preventDefault()
        setShowSearch(true)
      } else if (e.key === 'b' || e.key === 'B') {
        setShowBookmarks(prev => !prev)
      } else if (e.key === 't' || e.key === 'T') {
        cycleTheme()
      } else if (e.key === 'r' || e.key === 'R') {
        refresh()
      } else if (e.key === 'z' || e.key === 'Z') {
        setZenMode(prev => !prev)
        setTldrMode(false)
        setSpeedReadMode(false)
      } else if (e.key === 's' || e.key === 'S') {
        setSpeedReadMode(prev => !prev)
        setTldrMode(false)
        setZenMode(false)
      } else if (e.key === 'd' || e.key === 'D') {
        setShowDailyDigest(prev => !prev)
      } else if (e.key === '?') {
        setShowKeyboardShortcuts(prev => !prev)
      } else if (e.key === 'Escape') {
        setShowSearch(false)
        setShowBookmarks(false)
        setShowShare(false)
        setShowArticle(false)
        setShowDailyDigest(false)
        setShowHelp(false)
        setShowVoiceSearch(false)
        setShowKeyboardShortcuts(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [refresh])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && displayedCount < articles.length) {
          setDisplayedCount((prev) => Math.min(prev + 12, articles.length))
        }
      },
      { threshold: 0.1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [loading, displayedCount, articles.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowArticle(false); setShowShare(false); setShowBookmarks(false)
        setShowDailyDigest(false); setMobileMenuOpen(false); setShowSearch(false); setShowHelp(false)
      }
      if (e.key === 'b' && !e.metaKey && !e.ctrlKey && !showArticle) setShowBookmarks(prev => !prev)
      if (e.key === 't' && !e.metaKey && !e.ctrlKey && !showArticle) cycleTheme()
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setShowSearch(true) }
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) { setShowHelp(true) }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showArticle])

  const filteredArticles = useMemo(() => {
    let filtered = [...articles]
    if (zenMode) filtered = filtered.slice(0, 3)
    if (tldrMode) filtered = filtered.filter(a => (a.description?.length || 0) < 200).sort((a, b) => (a.description?.length || 0) - (b.description?.length || 0))
    if (speedReadMode) filtered = filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 10)
    return filtered.slice(0, displayedCount)
  }, [articles, displayedCount, zenMode, tldrMode, speedReadMode])

  const globalMood = useMemo(() => {
    if (articles.length === 0) return null
    const positive = ['surge', 'rise', 'growth', 'success', 'win', 'breakthrough', 'gain', 'boost']
    const negative = ['crisis', 'fall', 'war', 'death', 'crash', 'loss', 'threat', 'decline']
    let score = 0
    articles.slice(0, 20).forEach(a => {
      const text = (a.title + ' ' + (a.description || '')).toLowerCase()
      positive.forEach(w => { if (text.includes(w)) score++ })
      negative.forEach(w => { if (text.includes(w)) score-- })
    })
    return score > 3 ? 'positive' : score < -3 ? 'negative' : 'neutral'
  }, [articles])

  const categories = [
    { id: 'general', name: 'For You', icon: Sparkles, gradient: 'from-violet-600 via-purple-500 to-fuchsia-500' },
    { id: 'technology', name: 'Technology', icon: Zap, gradient: 'from-cyan-500 via-blue-500 to-indigo-500' },
    { id: 'business', name: 'Business', icon: Flame, gradient: 'from-emerald-500 via-green-500 to-teal-500' },
    { id: 'science', name: 'Science', icon: Globe, gradient: 'from-blue-600 via-indigo-500 to-violet-500' },
    { id: 'health', name: 'Health', icon: Heart, gradient: 'from-rose-500 via-pink-500 to-fuchsia-500' },
    { id: 'sports', name: 'Sports', icon: Flame, gradient: 'from-orange-500 via-amber-500 to-yellow-500' },
    { id: 'entertainment', name: 'Entertainment', icon: Newspaper, gradient: 'from-fuchsia-500 via-pink-500 to-rose-500' },
  ]

  const cycleTheme = useCallback(() => {
    const themes = ['cyber', 'dark', 'light'] as const
    const idx = themes.indexOf(theme as any)
    const next = themes[(idx + 1) % themes.length]
    changeTheme(next)
  }, [theme, changeTheme])

  const isBookmarked = useCallback((article: any) => bookmarkedArticles.some(a => a.url === article.url), [bookmarkedArticles])

  const toggleBookmark = useCallback((article: any, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    const newBookmarks = isBookmarked(article) ? bookmarkedArticles.filter(a => a.url !== article.url) : [...bookmarkedArticles, article]
    setBookmarkedArticles(newBookmarks)
    localStorage.setItem('bookmarkedArticles', JSON.stringify(newBookmarks))
  }, [bookmarkedArticles, isBookmarked])

  const openArticle = useCallback((article: any) => { setSelectedArticle(article); setShowArticle(true) }, [])
  const handleShare = useCallback((article: any, e?: React.MouseEvent) => { e?.stopPropagation(); setShareArticle(article); setShowShare(true) }, [])

  // Calculate reading time
  const getReadingTime = useCallback((text: string) => {
    const words = text?.split(' ').length || 0
    return Math.max(1, Math.ceil(words / 200))
  }, [])

  // Pull to refresh
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current > 0 && window.scrollY === 0) {
      const distance = e.touches[0].clientY - touchStartY.current
      setPullDistance(Math.min(distance, 100))
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 80 && !isRefreshing) {
      setIsRefreshing(true)
      refresh()
      setTimeout(() => {
        setIsRefreshing(false)
        setPullDistance(0)
      }, 1000)
    } else {
      setPullDistance(0)
    }
    touchStartY.current = 0
  }, [pullDistance, isRefreshing, refresh])

  // AI TLDR Summary
  const generateAiSummary = useCallback(async (article: any) => {
    if (!article?.content && !article?.description) return
    setLoadingSummary(true)
    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: article.title, content: article.content || article.description })
      })
      const data = await res.json()
      setAiSummary(data.summary)
    } catch (err) {
      console.error('AI summary failed:', err)
    } finally {
      setLoadingSummary(false)
    }
  }, [])

  // Track hover position for preview card
  const handleArticleHover = useCallback((article: any, e: React.MouseEvent) => {
    setHoveredArticle(article)
    setHoverPosition({ x: e.clientX, y: e.clientY })
  }, [])

  const handleArticleMouseMove = useCallback((e: React.MouseEvent) => {
    setHoverPosition({ x: e.clientX, y: e.clientY })
  }, [])

  // Featured article: prioritize breaking news, then newest article
  const featuredArticle = breakingNews && breakingNews.length > 0 
    ? breakingNews[0] 
    : articles[0]
  const trendingArticles = articles.filter(a => a.url !== featuredArticle?.url).slice(0, 4)
  const currentCategory = categories.find(c => c.id === selectedCategory)

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Initial Loading Animation */}
      <AnimatePresence>
        {initialLoad && <CleanLoader />}
      </AnimatePresence>
      
      {/* Offline Indicator */}
      <OfflineIndicator isOnline={isOnline} onRetry={refresh} />
      
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-black to-black" />
        <motion.div style={{ opacity: headerOpacity }} className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[80px]" />
        </motion.div>
      </div>

      {/* Breaking News Ticker */}
      <AnimatePresence>
        {articles.length > 0 && !tickerPaused && (
          <motion.div initial={{ y: -40 }} animate={{ y: 0 }} exit={{ y: -40 }} className="fixed top-0 left-0 right-0 z-[60] bg-black/90 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center h-10">
              <div className="flex-shrink-0 px-4 flex items-center gap-2 border-r border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-xs font-semibold tracking-wider text-red-400">LIVE</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} className="whitespace-nowrap flex">
                  {[...articles.slice(0, 5), ...articles.slice(0, 5)].map((article, idx) => (
                    <span key={idx} className="mx-8 text-sm text-white/80 flex items-center gap-4">
                      <span className="text-white/40">●</span>
                      {article.title}
                    </span>
                  ))}
                </motion.div>
              </div>
              <button onClick={() => setTickerPaused(true)} className="flex-shrink-0 px-3 hover:bg-white/5 transition-colors">
                <Pause className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {tickerPaused && articles.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-[60] h-10 bg-black/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-center">
          <button onClick={() => setTickerPaused(false)} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
            <Play className="w-4 h-4" /> Resume live feed
          </button>
        </div>
      )}

      {/* Header */}
      <header className={`sticky z-50 backdrop-blur-2xl bg-black/80 border-b border-white/5 ${articles.length > 0 ? 'top-10' : 'top-0'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
              <div className="relative">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
                  <Globe className="w-8 h-8 text-white" />
                </motion.div>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Global Pulse</h1>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-white/40 uppercase tracking-widest">Real-time News</span>
                  {globalMood && <span className={`w-1.5 h-1.5 rounded-full ${globalMood === 'positive' ? 'bg-emerald-400' : globalMood === 'negative' ? 'bg-red-400' : 'bg-amber-400'}`} />}
                </div>
              </div>
            </motion.div>

            <nav className="hidden lg:flex items-center gap-1">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`relative px-4 py-2 text-sm font-medium transition-all rounded-full ${selectedCategory === cat.id ? 'text-white' : 'text-white/50 hover:text-white/80'}`}>
                  {selectedCategory === cat.id && <motion.div layoutId="activeCategory" className={`absolute inset-0 rounded-full bg-gradient-to-r ${cat.gradient} opacity-20`} />}
                  <span className="relative">{cat.name}</span>
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <button onClick={() => setShowSearch(true)} className="p-2.5 rounded-full hover:bg-white/5 transition-all"><Search className="w-5 h-5 text-white/60" /></button>
              <button onClick={() => setShowVoiceSearch(true)} className="p-2.5 rounded-full hover:bg-white/5 transition-all"><Mic className="w-5 h-5 text-white/60" /></button>
              <button onClick={() => setShowTimeline(!showTimeline)} className={`p-2.5 rounded-full transition-all ${showTimeline ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/5'}`}><Clock className="w-5 h-5 text-white/60" /></button>
              <button onClick={() => setShowHelp(true)} className="p-2.5 rounded-full hover:bg-white/5 transition-all"><HelpCircle className="w-5 h-5 text-white/60" /></button>
              <div className="hidden md:flex items-center gap-1 ml-2 pl-2 border-l border-white/10">
                <button onClick={() => setShowBookmarks(true)} className="relative p-2.5 rounded-full hover:bg-white/5 transition-all">
                  <Bookmark className="w-5 h-5 text-white/60" />
                  {bookmarkedArticles.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">{bookmarkedArticles.length}</span>}
                </button>
                {showNewArticlesBadge && (
                  <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => { setShowNewArticlesBadge(false); setNewArticlesCount(0); }} className="relative p-2.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 transition-all">
                    <Bell className="w-5 h-5 text-emerald-400" />
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">{newArticlesCount}</span>
                  </motion.button>
                )}
                <button onClick={() => setShowDailyDigest(true)} className="p-2.5 rounded-full hover:bg-white/5 transition-all"><Newspaper className="w-5 h-5 text-white/60" /></button>
                <button onClick={cycleTheme} className="p-2.5 rounded-full hover:bg-white/5 transition-all">
                  {theme === 'light' ? <Sun className="w-5 h-5 text-amber-400" /> : theme === 'dark' ? <Moon className="w-5 h-5 text-white/60" /> : <Zap className="w-5 h-5 text-cyan-400" />}
                </button>
                <button onClick={refresh} disabled={loading} className="p-2.5 rounded-full hover:bg-white/5 transition-all disabled:opacity-30">
                  <RefreshCw className={`w-5 h-5 text-white/60 ${loading ? 'animate-spin' : ''}`} />
                </button>
                {/* User Auth Button */}
                {currentUser ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-sm font-bold">
                      {currentUser.name?.[0]?.toUpperCase() || currentUser.email[0].toUpperCase()}
                    </div>
                    <button onClick={handleLogout} className="text-xs text-white/40 hover:text-white transition-colors">
                      Logout
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowAuth(true)} className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
                    Sign In
                  </button>
                )}
              </div>
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2.5 rounded-full hover:bg-white/5 transition-all ml-2"><Menu className="w-5 h-5 text-white/60" /></button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {/* Breaking News Alert */}
        <AnimatePresence>
          {breakingNews && breakingNews.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-500/10 border-b border-red-500/20"
            >
              <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-sm font-semibold text-red-400">BREAKING: {breakingNews[0]?.title}</span>
                </div>
                <button onClick={() => openArticle(breakingNews[0])} className="text-xs text-red-400 hover:text-red-300 font-medium">
                  Read Now →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Articles Banner */}
        <AnimatePresence>
          {showNewArticlesBadge && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-40"
            >
              <button
                onClick={() => { setShowNewArticlesBadge(false); setNewArticlesCount(0); refresh(); }}
                className="flex items-center gap-3 px-6 py-3 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/30 font-medium hover:bg-emerald-600 transition-all"
              >
                <Bell className="w-5 h-5 animate-bounce" />
                {newArticlesCount} new {newArticlesCount === 1 ? 'article' : 'articles'} available
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pull to Refresh Indicator */}
        <motion.div 
          style={{ height: pullDistance }}
          className="flex items-center justify-center overflow-hidden"
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : pullDistance * 2 }}
            transition={{ duration: isRefreshing ? 1 : 0, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
          >
            <RefreshCcw className="w-6 h-6 text-white/40" />
          </motion.div>
        </motion.div>

        {/* Hero Section - BBC Style Breaking News */}
        {!loading && featuredArticle && !zenMode && (
          <motion.section 
            style={{ y: heroY }}
            className="relative min-h-[70vh] md:min-h-[80vh] flex items-end overflow-hidden"
          >
            {/* Background Image or Gradient Fallback */}
            {featuredArticle.urlToImage ? (
              <motion.div 
                style={{ scale: heroScale, opacity: heroOpacity }}
                className="absolute inset-0"
              >
                <img src={featuredArticle.urlToImage} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
              </motion.div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-black to-purple-900/30" />
            )}
            
            {/* Breaking News Banner */}
            {breakingNews && breakingNews.length > 0 && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute top-0 left-0 right-0 z-10"
              >
                <div className="bg-red-600 text-white px-4 py-2 flex items-center gap-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <span className="text-xs font-bold tracking-wider uppercase">Breaking News</span>
                  <span className="text-xs opacity-80">{new Date().toLocaleTimeString()}</span>
                </div>
              </motion.div>
            )}
            
            <div className="relative max-w-7xl mx-auto px-6 w-full pb-12 pt-20">
              <motion.div 
                key={featuredArticle.url}
                initial={{ opacity: 0, y: 40 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6 }}
                className="max-w-4xl"
              >
                {/* Category & Source */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${currentCategory?.gradient}`}>
                    {currentCategory?.name}
                  </span>
                  <span className="text-sm text-white/70 font-medium">{featuredArticle.source?.name}</span>
                </div>
                
                {/* Headline */}
                <h1 
                  onClick={() => openArticle(featuredArticle)} 
                  className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  {featuredArticle.title}
                </h1>
                
                {/* Description */}
                <p className="text-lg md:text-xl text-white/70 mb-6 leading-relaxed max-w-3xl">
                  {featuredArticle.description}
                </p>
                
                {/* Meta Row */}
                <div className="flex items-center gap-4 text-sm text-white/50 mb-6">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {getReadingTime(featuredArticle.content || featuredArticle.description || '')} min read
                  </span>
                  <span>•</span>
                  <span>{new Date(featuredArticle.publishedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {(featuredArticle.viewCount || Math.floor(Math.random() * 500 + 100)).toLocaleString()} views
                  </span>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => openArticle(featuredArticle)} 
                    className="group flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-white/90 transition-all"
                  >
                    Read Full Story <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={(e) => toggleBookmark(featuredArticle, e)} 
                    className={`p-3 rounded-lg border transition-all ${isBookmarked(featuredArticle) ? 'border-white bg-white/10 text-white' : 'border-white/20 text-white/60 hover:border-white/40'}`}
                  >
                    <Bookmark className="w-5 h-5" fill={isBookmarked(featuredArticle) ? 'currentColor' : 'none'} />
                  </button>
                  <button 
                    onClick={(e) => handleShare(featuredArticle, e)} 
                    className="p-3 rounded-lg border border-white/20 text-white/60 hover:border-white/40 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}

        {/* Trending Bar */}
        {!loading && trendingArticles.length > 0 && !zenMode && (
          <section className="border-y border-white/5 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-4 h-4 text-white/40" />
                <span className="text-xs font-semibold tracking-wider text-white/40 uppercase">Trending Now</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {trendingArticles.map((article, idx) => (
                  <motion.button key={article.url} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} onClick={() => openArticle(article)} className="group text-left p-4 rounded-xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl font-bold text-white/20 group-hover:text-white/40 transition-colors">{String(idx + 2).padStart(2, '0')}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-white transition-colors">{article.title}</h3>
                        <p className="text-xs text-white/40 mt-1">{article.source?.name}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* World Map */}
        {!zenMode && (
          <section className="max-w-7xl mx-auto px-6 py-8">
            <WorldMap />
          </section>
        )}

        {/* Main Content with Sidebar */}
        <section className="max-w-7xl mx-auto px-6 py-8">
          {/* Categories Carousel */}
          <div className="mb-6">
            <CategoriesCarousel 
              selectedCategory={selectedCategory} 
              onCategoryChange={setSelectedCategory} 
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2">
              {/* Timeline Toggle */}
              <AnimatePresence>
                {showTimeline && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8"
                  >
                    <NewsTimeline />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              <AIRecommendations 
                userInterests={['technology', 'world', 'business']}
                readingHistory={bookmarkedArticles.map(a => a.title)}
                onArticleClick={(article) => {
                  setSelectedArticle(article)
                  setShowArticle(true)
                }}
              />
              <SentimentDashboard />
              <NewsComparison />
              <FactCheckIntegration article={selectedArticle} />
              <NewsTranslation article={selectedArticle} />
            </div>
          </div>
        </section>

        {/* Reading Mode Banner */}
        <AnimatePresence>
          {(tldrMode || speedReadMode || zenMode) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-b border-white/5 bg-white/[0.02]">
              <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {tldrMode && <Zap className="w-4 h-4 text-cyan-400" />}
                  {speedReadMode && <Clock className="w-4 h-4 text-purple-400" />}
                  {zenMode && <BookOpen className="w-4 h-4 text-emerald-400" />}
                  <span className="text-sm font-medium">{tldrMode && 'TLDR Mode — Quick reads only'}{speedReadMode && 'Speed Read — 10 latest stories'}{zenMode && 'Zen Mode — Minimal & focused'}</span>
                </div>
                <button onClick={() => { setTldrMode(false); setSpeedReadMode(false); setZenMode(false); }} className="text-xs text-white/40 hover:text-white transition-colors">Disable</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Articles Grid */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Latest Stories</h2>
              <p className="text-sm text-white/40 mt-1">{articles.length} articles • Updated {lastRefresh ? new Date(lastRefresh).toLocaleTimeString() : '—'}</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => { setTldrMode(!tldrMode); setSpeedReadMode(false); setZenMode(false); }} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tldrMode ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'border border-white/10 text-white/60 hover:border-white/20'}`}>TLDR</button>
              <button onClick={() => { setSpeedReadMode(!speedReadMode); setTldrMode(false); setZenMode(false); }} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${speedReadMode ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'border border-white/10 text-white/60 hover:border-white/20'}`}>Speed</button>
              <button onClick={() => { setZenMode(!zenMode); setTldrMode(false); setSpeedReadMode(false); }} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${zenMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'border border-white/10 text-white/60 hover:border-white/20'}`}>Zen</button>
            </div>
          </div>

          {loading && articles.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
                  <div className="aspect-[16/10] bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-shimmer bg-[length:200%_100%]" />
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between">
                      <div className="h-3 bg-white/5 rounded w-1/4 animate-pulse" />
                      <div className="h-3 bg-white/5 rounded w-1/6 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-5 bg-white/5 rounded w-full animate-pulse" />
                      <div className="h-5 bg-white/5 rounded w-3/4 animate-pulse" />
                    </div>
                    <div className="h-4 bg-white/5 rounded w-2/3 animate-pulse" />
                    <div className="flex justify-between pt-2">
                      <div className="flex gap-2">
                        <div className="h-3 bg-white/5 rounded w-12 animate-pulse" />
                        <div className="h-3 bg-white/5 rounded w-12 animate-pulse" />
                      </div>
                      <div className="h-3 bg-white/5 rounded w-16 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-white/40 mb-4">{error}</p>
              <button onClick={refresh} className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-all">Try Again</button>
            </div>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.05 }}}}>
              <AnimatePresence mode="popLayout">
                {filteredArticles.slice(zenMode ? 0 : 1).map((article, index) => (
                  <motion.article 
                    key={article.url} 
                    variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }}} 
                    layout 
                    onMouseEnter={(e) => handleArticleHover(article, e)}
                    onMouseMove={handleArticleMouseMove}
                    onMouseLeave={() => setHoveredArticle(null)} 
                    onClick={() => openArticle(article)} 
                    className="group cursor-pointer rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
                  >
                    {article.urlToImage && (
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <img src={article.urlToImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-white/50">{article.source?.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/30 flex items-center gap-1"><Clock className="w-3 h-3" />{getReadingTime(article.content || article.description || '')} min</span>
                          <span className="text-xs text-white/30">{new Date(article.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-white/80 transition-colors leading-snug">{article.title}</h3>
                      {!tldrMode && <p className="text-sm text-white/40 line-clamp-2 mb-4 leading-relaxed">{article.description}</p>}
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5 text-xs text-white/30"><Eye className="w-3.5 h-3.5" />{article.viewCount || Math.floor(Math.random() * 500 + 100)}</span>
                          <span className="flex items-center gap-1.5 text-xs text-white/30"><ThumbsUp className="w-3.5 h-3.5" />{article.likeCount || Math.floor(Math.random() * 50 + 10)}</span>
                          <span className="flex items-center gap-1.5 text-xs text-white/30"><MessageCircle className="w-3.5 h-3.5" />{Math.floor(Math.random() * 20 + 5)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => toggleBookmark(article, e)} className={`p-2 rounded-lg transition-all ${isBookmarked(article) ? 'text-white bg-white/10' : 'text-white/30 hover:text-white hover:bg-white/5'}`}><Bookmark className="w-4 h-4" fill={isBookmarked(article) ? 'currentColor' : 'none'} /></button>
                          <button onClick={(e) => handleShare(article, e)} className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all"><Share2 className="w-4 h-4" /></button>
                          <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {displayedCount < articles.length && !zenMode && (
            <div ref={loaderRef} className="flex justify-center py-12">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setDisplayedCount(prev => prev + 12)} className="px-8 py-4 border border-white/20 rounded-full font-medium hover:bg-white/5 transition-all flex items-center gap-2">Load More<ArrowRight className="w-4 h-4" /></motion.button>
            </div>
          )}
        </section>
      </main>

      {/* Bookmarks Panel */}
      <AnimatePresence>
        {showBookmarks && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm" onClick={() => setShowBookmarks(false)}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md h-full bg-black border-l border-white/10 overflow-y-auto">
              <div className="sticky top-0 z-10 p-6 border-b border-white/10 bg-black">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Saved</h2>
                  <button onClick={() => setShowBookmarks(false)} className="p-2 rounded-lg hover:bg-white/5 transition-all"><X className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="p-6">
                {bookmarkedArticles.length === 0 ? (<div className="text-center py-12"><Bookmark className="w-12 h-12 text-white/20 mx-auto mb-4" /><p className="text-white/40">No saved articles</p></div>) : (
                  <div className="space-y-3">
                    {bookmarkedArticles.map((article, idx) => (
                      <motion.div key={article.url} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} onClick={() => { setShowBookmarks(false); openArticle(article); }} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 cursor-pointer transition-all">
                        <h4 className="font-medium mb-1 line-clamp-2">{article.title}</h4>
                        <p className="text-xs text-white/40">{article.source?.name}</p>
                        <button onClick={(e) => toggleBookmark(article, e)} className="mt-2 text-xs text-red-400 hover:underline">Remove</button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-start justify-center pt-24 bg-black/90 backdrop-blur-xl" onClick={() => setShowSearch(false)}>
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl bg-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-white/40" />
                  <input type="text" placeholder="Search articles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none text-lg" autoFocus />
                  <button onClick={() => setShowSearch(false)} className="p-2 hover:bg-white/5 rounded-lg"><X className="w-5 h-5 text-white/40" /></button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto p-2">
                {searchQuery && articles.filter(a => a.title?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5).map((article, idx) => (
                  <button key={idx} onClick={() => { setShowSearch(false); openArticle(article); }} className="w-full p-4 text-left rounded-xl hover:bg-white/5 transition-all">
                    <p className="font-medium line-clamp-1">{article.title}</p>
                    <p className="text-xs text-white/40 mt-1">{article.source?.name}</p>
                  </button>
                ))}
                {searchQuery && articles.filter(a => a.title?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && <p className="p-4 text-center text-white/40">No results</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-xl" onClick={() => setShowHelp(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-black border border-white/10 rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Shortcuts</h2>
                <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-white/5 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                {[{ key: 'B', action: 'Toggle saved' }, { key: 'T', action: 'Cycle theme' }, { key: '/', action: 'Search' }, { key: 'R', action: 'Refresh' }, { key: 'ESC', action: 'Close' }].map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-white/40">{s.action}</span>
                    <kbd className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm font-mono">{s.key}</kbd>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Article Modal */}
      {selectedArticle && <ModernArticleView article={selectedArticle} allArticles={articles} isOpen={showArticle} onClose={() => setShowArticle(false)} onArticleClick={openArticle} />}

      {/* Share Modal */}
      {shareArticle && <ShareModal article={shareArticle} isOpen={showShare} onClose={() => setShowShare(false)} />}

      {/* Daily Digest */}
      <DailyDigest isOpen={showDailyDigest} onClose={() => setShowDailyDigest(false)} />

      {/* Hover Article Preview Card */}
      <AnimatePresence>
        {hoveredArticle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{
              left: Math.min(hoverPosition.x + 20, window.innerWidth - 320),
              top: Math.min(hoverPosition.y - 100, window.innerHeight - 300)
            }}
            className="fixed z-[80] w-80 p-4 bg-black/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl pointer-events-none"
          >
            {hoveredArticle.urlToImage && (
              <img src={hoveredArticle.urlToImage} alt="" className="w-full h-32 object-cover rounded-lg mb-3" />
            )}
            <h4 className="font-semibold mb-2 line-clamp-2">{hoveredArticle.title}</h4>
            <p className="text-xs text-white/50 mb-3 line-clamp-3">{hoveredArticle.description}</p>
            <div className="flex items-center justify-between text-xs text-white/40">
              <span>{hoveredArticle.source?.name}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{getReadingTime(hoveredArticle.content || hoveredArticle.description)} min</span>
            </div>
            <button className="mt-3 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2">
              <SparklesIcon className="w-3 h-3" /> Click to read
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 z-50 p-4 bg-white text-black rounded-full shadow-lg hover:bg-white/90 transition-all">
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-white/40" />
              <span className="text-sm text-white/40">Global Pulse © {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-white/30">
              <span className="flex items-center gap-2"><kbd className="px-2 py-1 bg-white/5 rounded">B</kbd>Saved</span>
              <span className="flex items-center gap-2"><kbd className="px-2 py-1 bg-white/5 rounded">T</kbd>Theme</span>
              <span className="flex items-center gap-2"><kbd className="px-2 py-1 bg-white/5 rounded">/</kbd>Search</span>
              <span className="flex items-center gap-2"><kbd className="px-2 py-1 bg-white/5 rounded">ESC</kbd>Close</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        onAuth={(user) => setCurrentUser(user)} 
      />

      {/* Voice Search */}
      <AnimatePresence>
        {showVoiceSearch && (
          <VoiceSearch 
            onResult={(transcript) => {
              setSearchQuery(transcript)
              setShowVoiceSearch(false)
            }}
            onClose={() => setShowVoiceSearch(false)}
          />
        )}
      </AnimatePresence>

      {/* Share Panel */}
      <AnimatePresence>
        {showSharePanel && shareArticleData && (
          <SharePanel
            article={{
              title: shareArticleData.title,
              url: shareArticleData.url,
              description: shareArticleData.description,
              source: shareArticleData.source
            }}
            onClose={() => {
              setShowSharePanel(false)
              setShareArticleData(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts 
        isOpen={showKeyboardShortcuts} 
        onClose={() => setShowKeyboardShortcuts(false)} 
      />

      {/* Breaking News Alerts */}
      <BreakingNewsAlerts 
        onAlertClick={(alert) => {
          // Handle alert click
        }}
      />

      {/* Social Feed Modal */}
      <AnimatePresence>
        {showSocialFeed && socialFeedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowSocialFeed(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] bg-black border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-semibold">Community Discussion</h3>
                <button onClick={() => setShowSocialFeed(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                <SocialFeed article={socialFeedArticle} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
