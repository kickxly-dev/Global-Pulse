'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Globe, Search, Bookmark, RefreshCw, AlertCircle, Share2, 
  X, Newspaper, Moon, Sun, Zap, ExternalLink, TrendingUp, Activity, Brain, Trophy, Film,
  Clock, Sparkles, Wind, Maximize2, Minimize2, BookOpen
} from 'lucide-react'
import { toast } from 'sonner'
import { useNewsData } from '@/hooks/useNewsData'
import { useTheme } from '@/hooks/useTheme'
import ModernArticleView from '@/components/ModernArticleView'
import ShareModal from '@/components/ShareModal'
import DailyDigest from '@/components/DailyDigest'
import AutoRefreshIndicator from '@/components/AutoRefreshIndicator'

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
  const [breakingNews, setBreakingNews] = useState<any[]>([])
  const [showBreakingAlert, setShowBreakingAlert] = useState(false)
  const [tldrMode, setTldrMode] = useState(false)
  const [speedReadMode, setSpeedReadMode] = useState(false)
  const [zenMode, setZenMode] = useState(false)
  const [displayedCount, setDisplayedCount] = useState(10)
  const loaderRef = useRef<HTMLDivElement>(null)
  const previousArticleCount = useRef(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const { articles, loading, error, refresh, lastRefresh } = useNewsData({
    category: selectedCategory,
    query: searchQuery,
    country: 'us',
    refreshInterval: 60000
  })
  
  const { theme, changeTheme } = useTheme()

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bookmarkedArticles')
    if (saved) {
      setBookmarkedArticles(JSON.parse(saved))
    }
  }, [])

  // Detect breaking news and new articles
  useEffect(() => {
    if (articles.length > previousArticleCount.current && previousArticleCount.current > 0) {
      const newArticles = articles.slice(0, articles.length - previousArticleCount.current)
      const breaking = newArticles.filter(article => {
        const publishedTime = new Date(article.publishedAt).getTime()
        const now = Date.now()
        return (now - publishedTime) < (60 * 60 * 1000) // Less than 1 hour old
      })
      
      if (breaking.length > 0) {
        setBreakingNews(breaking)
        setShowBreakingAlert(true)
        toast.success(`${breaking.length} breaking news article${breaking.length > 1 ? 's' : ''}!`, {
          icon: '🚨'
        })
        setTimeout(() => setShowBreakingAlert(false), 10000)
      }
    }
    previousArticleCount.current = articles.length
  }, [articles])

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && displayedCount < articles.length) {
          setDisplayedCount((prev) => Math.min(prev + 10, articles.length))
        }
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [loading, displayedCount, articles.length])

  // Reset displayed count when category or search changes
  useEffect(() => {
    setDisplayedCount(10)
  }, [selectedCategory, searchQuery])

  // Calculate global mood
  const globalMood = useMemo(() => {
    if (articles.length === 0) return null
    const sentimentScores = articles.map(a => {
      const title = (a.title || '').toLowerCase()
      let score = 0
      const positive = ['breakthrough', 'success', 'win', 'growth', 'positive', 'advances', 'rises', 'gains', 'soars', 'surges']
      const negative = ['crisis', 'crash', 'fail', 'loss', 'death', 'war', 'decline', 'drops', 'falls', 'plunges']
      positive.forEach(word => { if (title.includes(word)) score += 1 })
      negative.forEach(word => { if (title.includes(word)) score -= 1 })
      return score
    })
    const avgScore = sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
    return {
      dominant: avgScore > 0.1 ? 'positive' : avgScore < -0.1 ? 'negative' : 'neutral',
      score: avgScore
    }
  }, [articles])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.key === 'r' && !e.metaKey && !e.ctrlKey) {
        refresh()
      }
      if (e.key === 'b' && !e.metaKey && !e.ctrlKey) {
        setShowBookmarks(prev => !prev)
      }
      if (e.key === 't' && !e.metaKey && !e.ctrlKey) {
        cycleTheme()
      }
      if (e.key === 'Escape') {
        setShowArticle(false)
        setShowShare(false)
        setShowBookmarks(false)
        setShowDailyDigest(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [refresh])

  const isBookmarked = (article: any) => {
    return bookmarkedArticles.some(a => a.url === article.url)
  }

  // Toggle bookmark with proper state handling
  const toggleBookmark = (article: any, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    
    const bookmarked = isBookmarked(article)
    let newBookmarks: any[]
    
    if (bookmarked) {
      newBookmarks = bookmarkedArticles.filter(a => a.url !== article.url)
      toast.success('Removed from bookmarks')
    } else {
      newBookmarks = [...bookmarkedArticles, article]
      toast.success('Added to bookmarks')
    }
    
    setBookmarkedArticles(newBookmarks)
    
    // Save to localStorage immediately
    try {
      localStorage.setItem('bookmarkedArticles', JSON.stringify(newBookmarks))
    } catch (err) {
      console.error('Failed to save bookmarks:', err)
    }
  }

  // Open article
  const openArticle = (article: any) => {
    setSelectedArticle(article)
    setShowArticle(true)
  }

  // Share article
  const handleShare = (article: any, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setShareArticle(article)
    setShowShare(true)
  }

  // Cycle theme
  const cycleTheme = () => {
    const themes = ['cyber', 'dark', 'light'] as const
    const currentIndex = themes.indexOf(theme as any)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    changeTheme(nextTheme)
    toast.success(`Theme: ${nextTheme.toUpperCase()}`)
  }

  // Filter articles based on reading mode
  const filteredArticles = useMemo(() => {
    let filtered = [...articles]
    
    // Zen mode: only show first 3 articles
    if (zenMode) {
      filtered = filtered.slice(0, 3)
    }
    
    // TLDR mode: filter to show only articles with short descriptions (priority to concise content)
    if (tldrMode) {
      filtered = filtered.filter(a => (a.description?.length || 0) < 200)
        .sort((a, b) => (a.description?.length || 0) - (b.description?.length || 0))
    }
    
    // Speed Read mode: prioritize recent articles and limit count
    if (speedReadMode) {
      filtered = filtered
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, Math.min(10, filtered.length))
    }
    
    return filtered.slice(0, displayedCount)
  }, [articles, displayedCount, zenMode, tldrMode, speedReadMode])

  const categories = [
    { id: 'technology', name: 'Tech', icon: Zap },
    { id: 'business', name: 'Business', icon: TrendingUp },
    { id: 'health', name: 'Health', icon: Activity },
    { id: 'science', name: 'Science', icon: Brain },
    { id: 'sports', name: 'Sports', icon: Trophy },
    { id: 'entertainment', name: 'Entertainment', icon: Film },
  ]

  return (
    <div className={`min-h-screen bg-cyber-darker ${theme === 'light' ? 'theme-light' : theme === 'dark' ? 'theme-dark' : 'theme-cyber'}`}>
      {/* Live Data Stream Indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink animate-pulse" />
      
      {/* Breaking News Alert */}
      <AnimatePresence>
        {showBreakingAlert && breakingNews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-4 right-4 z-50 bg-red-500/90 backdrop-blur-sm rounded-lg p-4 border border-red-400/50 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-white font-bold">Breaking News</h3>
                  <p className="text-red-100 text-sm">{breakingNews.length} new article{breakingNews.length > 1 ? 's' : ''} detected</p>
                </div>
              </div>
              <button
                onClick={() => setShowBreakingAlert(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent">
                  Global Pulse
                </h1>
                <p className="text-xs text-gray-500">Real-time Global Intelligence</p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-2">
              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1.5 border border-white/10">
                  <button
                    onClick={() => setTldrMode(!tldrMode)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                      tldrMode 
                        ? 'bg-cyber-blue text-white shadow-lg shadow-cyber-blue/30' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    title="TLDR Mode - Show only short articles"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    TLDR
                  </button>
                  <button
                    onClick={() => setSpeedReadMode(!speedReadMode)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                      speedReadMode 
                        ? 'bg-cyber-purple text-white shadow-lg shadow-cyber-purple/30' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    title="Speed Read - Show 10 most recent articles"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Speed
                  </button>
                  <button
                    onClick={() => setZenMode(!zenMode)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                      zenMode 
                        ? 'bg-cyber-green text-white shadow-lg shadow-cyber-green/30' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    title="Zen Mode - Minimal distraction, 3 articles only"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Zen
                  </button>
                </div>

              <button
                onClick={() => setShowBookmarks(true)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all relative"
              >
                <Bookmark className="w-5 h-5 text-gray-300" />
                {bookmarkedArticles.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyber-blue rounded-full text-xs flex items-center justify-center text-white font-bold">
                    {bookmarkedArticles.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setShowDailyDigest(true)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              >
                <Newspaper className="w-5 h-5 text-gray-300" />
              </button>
              
              <button
                onClick={cycleTheme}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              >
                {theme === 'light' ? <Sun className="w-5 h-5 text-yellow-400" /> : 
                 theme === 'dark' ? <Moon className="w-5 h-5 text-gray-300" /> : 
                 <Zap className="w-5 h-5 text-cyber-blue" />}
              </button>
              
              <button
                onClick={refresh}
                disabled={loading}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-gray-300 ${loading ? 'animate-spin' : ''}`} />
              </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-cyber-blue text-white shadow-lg shadow-cyber-blue/25'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Reading Mode Status */}
        {(tldrMode || speedReadMode || zenMode) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {tldrMode && <Zap className="w-5 h-5 text-cyber-blue" />}
              {speedReadMode && <Clock className="w-5 h-5 text-cyber-purple" />}
              {zenMode && <BookOpen className="w-5 h-5 text-cyber-green" />}
              <span className="text-sm">
                {tldrMode && 'TLDR Mode: Showing short articles only'}
                {speedReadMode && 'Speed Read: Showing 10 most recent articles'}
                {zenMode && 'Zen Mode: Showing 3 articles for focused reading'}
              </span>
            </div>
            <button
              onClick={() => { setTldrMode(false); setSpeedReadMode(false); setZenMode(false); }}
              className="text-xs text-cyber-blue hover:underline"
            >
              Disable
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && articles.length === 0 ? (
            // Loading skeletons
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-700" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-700 rounded w-full" />
                  <div className="h-3 bg-gray-700 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={refresh}
                className="px-6 py-2 bg-cyber-blue text-white rounded-lg hover:bg-cyber-blue/80 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {filteredArticles.map((article, index) => (
                <motion.article
                  key={article.url + index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  onClick={() => openArticle(article)}
                  className="group bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-cyber-blue/50 hover:shadow-lg hover:shadow-cyber-blue/10 transition-all duration-300 cursor-pointer"
                >
                  {article.urlToImage && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={article.urlToImage} 
                        alt={article.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-cyber-blue/80 backdrop-blur-sm rounded text-xs text-white font-medium">
                          {typeof article.source === 'object' ? article.source?.name : article.source}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-2 group-hover:text-cyber-blue transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    {!tldrMode && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {article.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <span className="text-cyber-blue">
                        {Math.ceil((article.content?.length || 0) / 1000) || 2} min
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                      <button
                        onClick={(e) => toggleBookmark(article, e)}
                        className={`p-1.5 rounded-lg transition-all ${isBookmarked(article) ? 'bg-cyber-blue/20 text-cyber-blue' : 'text-gray-400 hover:text-white'}`}
                        title="Bookmark"
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked(article) ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => handleShare(article, e)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white transition-all"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white transition-all ml-auto"
                        title="Open original"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </motion.article>
              ))}
            </>
          )}
        </div>

        {/* Load More */}
        {displayedCount < articles.length && !zenMode && (
          <div ref={loaderRef} className="flex justify-center py-8">
            <button
              onClick={() => setDisplayedCount(prev => prev + 10)}
              className="px-6 py-2 bg-cyber-blue/10 text-cyber-blue rounded-lg hover:bg-cyber-blue/20 transition-all"
            >
              Load More
            </button>
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
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowBookmarks(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-white/10 p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Bookmarks</h2>
                <button
                  onClick={() => setShowBookmarks(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              {bookmarkedArticles.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No bookmarks yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookmarkedArticles.map((article, index) => (
                    <motion.div
                      key={article.url + index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-cyber-blue/50 transition-all cursor-pointer"
                      onClick={() => {
                        setShowBookmarks(false)
                        openArticle(article)
                      }}
                    >
                      <h4 className="text-white font-medium mb-2 line-clamp-2">{article.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {typeof article.source === 'object' ? article.source?.name : article.source}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleBookmark(article)
                          }}
                          className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
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
      
      {/* Auto Refresh Indicator */}
      <AutoRefreshIndicator
        isAutoRefreshing={loading}
        lastRefresh={lastRefresh}
      />
    </div>
  )
}
