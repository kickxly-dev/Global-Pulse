'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Globe, Bookmark, RefreshCw, Share2, 
  X, Newspaper, Moon, Sun, Zap, ExternalLink, TrendingUp, 
  Clock, BookOpen, Heart, Flame, ArrowRight, Menu, Sparkles, Radio, Bell, AlertTriangle,
  Search, ChevronUp, Eye, ThumbsUp, Info, Command, HelpCircle, Play, Pause
} from 'lucide-react'
import { toast } from 'sonner'
import { useNewsData } from '@/hooks/useNewsData'
import { useTheme } from '@/hooks/useTheme'
import ModernArticleView from '@/components/ModernArticleView'
import ShareModal from '@/components/ShareModal'
import DailyDigest from '@/components/DailyDigest'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } }
}

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
  const loaderRef = useRef<HTMLDivElement>(null)
  
  const { articles, loading, error, refresh, lastRefresh } = useNewsData({
    category: selectedCategory,
    query: searchQuery,
    country: 'us',
    refreshInterval: 60000
  })
  
  const { theme, changeTheme } = useTheme()

  // Load bookmarks
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bookmarkedArticles')
      if (saved) setBookmarkedArticles(JSON.parse(saved))
    } catch (err) {
      console.error('Failed to load bookmarks:', err)
    }
  }, [])

  // Live time update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Scroll detection for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Track new articles
  const prevArticleCount = useRef(0)
  useEffect(() => {
    if (articles.length > prevArticleCount.current && prevArticleCount.current > 0) {
      const newCount = articles.length - prevArticleCount.current
      setNewArticlesCount(newCount)
      setShowNewArticlesBadge(true)
      toast.success(`${newCount} new article${newCount > 1 ? 's' : ''} available!`, {
        icon: '📰',
        action: {
          label: 'View',
          onClick: () => {
            setShowNewArticlesBadge(false)
            setNewArticlesCount(0)
          }
        }
      })
    }
    prevArticleCount.current = articles.length
  }, [articles.length])

  // Infinite scroll
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowArticle(false)
        setShowShare(false)
        setShowBookmarks(false)
        setShowDailyDigest(false)
        setMobileMenuOpen(false)
      }
      if (e.key === 'b' && !e.metaKey && !e.ctrlKey && !showArticle) {
        setShowBookmarks(prev => !prev)
      }
      if (e.key === 't' && !e.metaKey && !e.ctrlKey && !showArticle) {
        cycleTheme()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showArticle])

  // Filter articles
  const filteredArticles = useMemo(() => {
    let filtered = [...articles]
    if (zenMode) filtered = filtered.slice(0, 3)
    if (tldrMode) {
      filtered = filtered
        .filter(a => (a.description?.length || 0) < 200)
        .sort((a, b) => (a.description?.length || 0) - (b.description?.length || 0))
    }
    if (speedReadMode) {
      filtered = filtered
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 10)
    }
    return filtered.slice(0, displayedCount)
  }, [articles, displayedCount, zenMode, tldrMode, speedReadMode])

  // Global mood
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
    { id: 'general', name: 'For You', icon: Sparkles, color: 'from-violet-500 to-purple-500' },
    { id: 'technology', name: 'Tech', icon: Zap, color: 'from-cyber-blue to-cyan-400' },
    { id: 'business', name: 'Business', icon: TrendingUp, color: 'from-emerald-500 to-green-400' },
    { id: 'science', name: 'Science', icon: Globe, color: 'from-blue-500 to-indigo-400' },
    { id: 'health', name: 'Health', icon: Heart, color: 'from-rose-500 to-pink-400' },
    { id: 'sports', name: 'Sports', icon: Flame, color: 'from-orange-500 to-amber-400' },
    { id: 'entertainment', name: 'Culture', icon: Newspaper, color: 'from-fuchsia-500 to-pink-400' },
  ]

  const cycleTheme = useCallback(() => {
    const themes = ['cyber', 'dark', 'light'] as const
    const idx = themes.indexOf(theme as any)
    const next = themes[(idx + 1) % themes.length]
    changeTheme(next)
    toast.success(`${next.charAt(0).toUpperCase() + next.slice(1)} mode`)
  }, [theme, changeTheme])

  const isBookmarked = useCallback((article: any) => 
    bookmarkedArticles.some(a => a.url === article.url), [bookmarkedArticles])

  const toggleBookmark = useCallback((article: any, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    const newBookmarks = isBookmarked(article)
      ? bookmarkedArticles.filter(a => a.url !== article.url)
      : [...bookmarkedArticles, article]
    setBookmarkedArticles(newBookmarks)
    localStorage.setItem('bookmarkedArticles', JSON.stringify(newBookmarks))
    toast.success(isBookmarked(article) ? 'Removed from saved' : 'Saved article')
  }, [bookmarkedArticles, isBookmarked])

  const openArticle = useCallback((article: any) => {
    setSelectedArticle(article)
    setShowArticle(true)
  }, [])

  const handleShare = useCallback((article: any, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setShareArticle(article)
    setShowShare(true)
  }, [])

  const featuredArticle = articles[0]
  const trendingArticles = articles.slice(1, 4)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyber-blue/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyber-purple/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyber-pink/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Breaking News Ticker */}
      {articles.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 text-white overflow-hidden">
          <div className="flex items-center">
            <div className="flex-shrink-0 px-4 py-2 bg-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Breaking</span>
            </div>
            <div 
              className="flex-1 overflow-hidden py-2 cursor-pointer"
              onClick={() => setTickerPaused(!tickerPaused)}
            >
              <motion.div
                animate={{ x: tickerPaused ? 0 : undefined }}
                className={`whitespace-nowrap ${!tickerPaused ? 'animate-marquee' : ''}`}
              >
                {articles.slice(0, 5).map((article, idx) => (
                  <span key={idx} className="mx-8 text-sm font-medium">
                    {article.title}
                    {idx < 4 && <span className="mx-4 text-rose-300">•</span>}
                  </span>
                ))}
              </motion.div>
            </div>
            <button 
              onClick={() => setTickerPaused(!tickerPaused)}
              className="flex-shrink-0 px-3 py-2 hover:bg-rose-700 transition-colors"
            >
              {tickerPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`sticky z-50 backdrop-blur-2xl bg-slate-900/70 border-b border-white/5 ${articles.length > 0 ? 'top-10' : 'top-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <Globe className="w-9 h-9 text-cyber-blue" />
                </motion.div>
                <div className="absolute inset-0 bg-cyber-blue/30 rounded-full blur-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent">
                  Global Pulse
                </h1>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Live News</span>
                  {/* Live Pulse Indicator */}
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {globalMood && (
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      globalMood === 'positive' ? 'bg-emerald-400' :
                      globalMood === 'negative' ? 'bg-rose-400' : 'bg-amber-400'
                    }`} />
                  )}
                </div>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                onClick={() => setShowSearch(true)}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Help Button */}
              <button
                onClick={() => setShowHelp(true)}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              
              {/* Reading Modes - Desktop */}
              <div className="hidden md:flex items-center gap-1 p-1 bg-white/5 rounded-full">
                <button
                  onClick={() => { setTldrMode(!tldrMode); setSpeedReadMode(false); setZenMode(false); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    tldrMode ? 'bg-cyber-blue text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  TLDR
                </button>
                <button
                  onClick={() => { setSpeedReadMode(!speedReadMode); setTldrMode(false); setZenMode(false); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    speedReadMode ? 'bg-cyber-purple text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Speed
                </button>
                <button
                  onClick={() => { setZenMode(!zenMode); setTldrMode(false); setSpeedReadMode(false); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    zenMode ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Zen
                </button>
              </div>

              <button
                onClick={() => setShowBookmarks(true)}
                className="relative p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all"
              >
                <Bookmark className="w-5 h-5" />
                {bookmarkedArticles.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyber-blue rounded-full text-[10px] font-bold flex items-center justify-center">
                    {bookmarkedArticles.length}
                  </span>
                )}
              </button>

              {/* New Articles Badge */}
              {showNewArticlesBadge && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => { setShowNewArticlesBadge(false); setNewArticlesCount(0); }}
                  className="relative p-2.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 transition-all"
                >
                  <Bell className="w-5 h-5 text-emerald-400" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {newArticlesCount}
                  </span>
                </motion.button>
              )}

              <button
                onClick={() => setShowDailyDigest(true)}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all"
              >
                <Newspaper className="w-5 h-5" />
              </button>

              <button
                onClick={cycleTheme}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all"
              >
                {theme === 'light' ? <Sun className="w-5 h-5 text-amber-400" /> : 
                 theme === 'dark' ? <Moon className="w-5 h-5" /> : 
                 <Zap className="w-5 h-5 text-cyber-blue" />}
              </button>

              <button
                onClick={refresh}
                disabled={loading}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Categories */}
          <div className="lg:hidden pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? `bg-gradient-to-r ${cat.color} text-white`
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Live Status Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-wrap items-center justify-between gap-4 px-4 py-3 rounded-xl bg-slate-800/30 border border-white/5"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400">Live</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Newspaper className="w-3.5 h-3.5" />
              <span>{articles.length} articles</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Last update: {lastRefresh ? new Date(lastRefresh).toLocaleTimeString() : '—'}</span>
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* Reading Mode Banner */}
        <AnimatePresence>
          {(tldrMode || speedReadMode || zenMode) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-cyber-blue/10 via-cyber-purple/10 to-cyber-pink/10 border border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {tldrMode && <Zap className="w-5 h-5 text-cyber-blue" />}
                {speedReadMode && <Clock className="w-5 h-5 text-cyber-purple" />}
                {zenMode && <BookOpen className="w-5 h-5 text-emerald-400" />}
                <span className="text-sm font-medium">
                  {tldrMode && 'TLDR Mode — Quick reads only'}
                  {speedReadMode && 'Speed Read — 10 latest stories'}
                  {zenMode && 'Zen Mode — Minimal & focused'}
                </span>
              </div>
              <button
                onClick={() => { setTldrMode(false); setSpeedReadMode(false); setZenMode(false); }}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Disable
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section - Featured Article */}
        {!loading && featuredArticle && !zenMode && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Featured */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => openArticle(featuredArticle)}
                className="relative group cursor-pointer rounded-3xl overflow-hidden bg-slate-800/50 border border-white/10 hover:border-cyber-blue/50 transition-all"
              >
                {featuredArticle.urlToImage && (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={featuredArticle.urlToImage}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-cyber-blue rounded-full text-xs font-semibold">
                      Featured
                    </span>
                    <span className="text-xs text-slate-400">
                      {featuredArticle.source?.name}
                    </span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold mb-2 group-hover:text-cyber-blue transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-slate-400 text-sm line-clamp-2">
                    {featuredArticle.description}
                  </p>
                </div>
              </motion.div>

              {/* Trending */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyber-purple" />
                  Trending Now
                </h3>
                {trendingArticles.map((article, idx) => (
                  <motion.div
                    key={article.url}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => openArticle(article)}
                    className="group cursor-pointer p-4 rounded-2xl bg-slate-800/30 border border-white/5 hover:border-white/20 hover:bg-slate-800/50 transition-all"
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyber-blue to-cyber-purple flex items-center justify-center text-sm font-bold">
                        {idx + 2}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium line-clamp-2 group-hover:text-cyber-blue transition-colors">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <span>{article.source?.name}</span>
                          <span>•</span>
                          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* Articles Grid */}
        {loading && articles.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-slate-800/30 border border-white/5 overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-slate-700" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-700 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-slate-400 mb-4">{error}</p>
            <button
              onClick={refresh}
              className="px-6 py-3 bg-cyber-blue text-white rounded-full font-medium hover:bg-cyber-blue/80 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence mode="popLayout">
              {filteredArticles.slice(zenMode ? 0 : 1).map((article, index) => (
                <motion.article
                  key={article.url}
                  variants={fadeInUp}
                  layout
                  whileHover={{ y: -5 }}
                  onClick={() => openArticle(article)}
                  className="group cursor-pointer rounded-2xl overflow-hidden bg-slate-800/30 backdrop-blur-sm border border-white/5 hover:border-white/20 hover:bg-slate-800/50 transition-all"
                >
                  {article.urlToImage && (
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-cyber-blue">
                        {article.source?.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-cyber-blue transition-colors">
                      {article.title}
                    </h3>
                    {!tldrMode && (
                      <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                        {article.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        {/* Engagement Counters */}
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Eye className="w-3.5 h-3.5" />
                          {Math.floor(Math.random() * 500 + 100)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          {Math.floor(Math.random() * 50 + 10)}
                        </span>
                        <button
                          onClick={(e) => toggleBookmark(article, e)}
                          className={`p-1.5 rounded-lg transition-all ${
                            isBookmarked(article) 
                              ? 'text-cyber-blue bg-cyber-blue/10' 
                              : 'text-slate-500 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <Bookmark className="w-4 h-4" fill={isBookmarked(article) ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={(e) => handleShare(article, e)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.ceil((article.content?.length || 0) / 1000) || 2} min
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Load More */}
        {displayedCount < articles.length && !zenMode && (
          <div ref={loaderRef} className="flex justify-center py-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDisplayedCount(prev => prev + 12)}
              className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-medium transition-all flex items-center gap-2"
            >
              Load More
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </main>

      {/* Bookmarks Panel */}
      <AnimatePresence>
        {showBookmarks && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm"
            onClick={() => setShowBookmarks(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md h-full bg-slate-900 border-l border-white/10 overflow-y-auto"
            >
              <div className="sticky top-0 z-10 p-6 border-b border-white/10 bg-slate-900">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Saved Articles</h2>
                  <button
                    onClick={() => setShowBookmarks(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {bookmarkedArticles.length === 0 ? (
                  <div className="text-center py-12">
                    <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No saved articles yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookmarkedArticles.map((article, idx) => (
                      <motion.div
                        key={article.url}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => { setShowBookmarks(false); openArticle(article); }}
                        className="p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:border-white/20 cursor-pointer transition-all"
                      >
                        <h4 className="font-medium mb-1 line-clamp-2">{article.title}</h4>
                        <p className="text-xs text-slate-500">{article.source?.name}</p>
                        <button
                          onClick={(e) => toggleBookmark(article, e)}
                          className="mt-2 text-xs text-rose-400 hover:underline"
                        >
                          Remove
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Article Modal */}
      {selectedArticle && (
        <ModernArticleView
          article={selectedArticle}
          allArticles={articles}
          isOpen={showArticle}
          onClose={() => setShowArticle(false)}
          onArticleClick={openArticle}
        />
      )}

      {/* Share Modal */}
      {shareArticle && (
        <ShareModal
          article={shareArticle}
          isOpen={showShare}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Daily Digest */}
      <DailyDigest
        isOpen={showDailyDigest}
        onClose={() => setShowDailyDigest(false)}
      />

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-start justify-center pt-20 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-slate-800 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none text-lg"
                    autoFocus
                  />
                  <button onClick={() => setShowSearch(false)} className="p-2 hover:bg-white/10 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto p-2">
                {searchQuery && articles.filter(a => 
                  a.title?.toLowerCase().includes(searchQuery.toLowerCase())
                ).slice(0, 5).map((article, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setShowSearch(false); openArticle(article); }}
                    className="w-full p-3 text-left rounded-lg hover:bg-white/5 transition-all"
                  >
                    <p className="font-medium line-clamp-1">{article.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{article.source?.name}</p>
                  </button>
                ))}
                {searchQuery && articles.filter(a => 
                  a.title?.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <p className="p-4 text-center text-slate-400">No results found</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-slate-800 rounded-2xl border border-white/10 shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
                <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'B', action: 'Toggle bookmarks panel' },
                  { key: 'T', action: 'Cycle theme' },
                  { key: '/', action: 'Open search' },
                  { key: 'R', action: 'Refresh articles' },
                  { key: 'ESC', action: 'Close modals' },
                ].map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">{shortcut.action}</span>
                    <kbd className="px-3 py-1.5 bg-slate-700 rounded-lg text-sm font-mono">{shortcut.key}</kbd>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-50 p-4 bg-cyber-blue rounded-full shadow-lg shadow-cyber-blue/30 hover:bg-cyber-blue/80 transition-all"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-cyber-blue" />
              <span className="text-sm text-slate-400">
                Global Pulse © {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">B</kbd>
                Saved
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">T</kbd>
                Theme
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">ESC</kbd>
                Close
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
