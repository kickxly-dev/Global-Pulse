'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Globe, Search, Bookmark, RefreshCw, AlertCircle, Share2, 
  X, Newspaper, Moon, Sun, Zap, ExternalLink, TrendingUp, Activity, Brain, Trophy, Film,
  Clock, Sparkles, Wind, Maximize2, Minimize2
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // '/' to focus search
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      // 'r' to refresh
      if (e.key === 'r' && !e.metaKey && !e.ctrlKey) {
        refresh()
      }
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
      // 'b' to toggle bookmarks
      if (e.key === 'b' && !e.metaKey && !e.ctrlKey) {
        setShowBookmarks(prev => !prev)
      }
      // 't' to cycle theme
      if (e.key === 't' && !e.metaKey && !e.ctrlKey) {
        cycleTheme()
      }
      // 'Escape' to close modals
      if (e.key === 'Escape') {
        setShowArticle(false)
        setShowShare(false)
        setShowBookmarks(false)
        setShowDailyDigest(false)
        setShowBreakingAlert(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [refresh])
  const isBookmarked = (article: any) => {
    return bookmarkedArticles.some(a => a.url === article.url)
  }

  // Toggle bookmark
  const toggleBookmark = (article: any, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const bookmarked = isBookmarked(article)
    let newBookmarks
    
    if (bookmarked) {
      newBookmarks = bookmarkedArticles.filter(a => a.url !== article.url)
      toast.success('Removed from bookmarks')
    } else {
      newBookmarks = [...bookmarkedArticles, article]
      toast.success('Added to bookmarks')
    }
    
    setBookmarkedArticles(newBookmarks)
    localStorage.setItem('bookmarkedArticles', JSON.stringify(newBookmarks))
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

  const categories = [
    { id: 'general', name: 'General', icon: Globe },
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
              {/* Reading Modes */}
              <div className="hidden md:flex items-center space-x-1 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setTldrMode(!tldrMode)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    tldrMode ? 'bg-cyber-blue text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="TLDR Mode"
                >
                  TLDR
                </button>
                <button
                  onClick={() => setSpeedReadMode(!speedReadMode)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    speedReadMode ? 'bg-cyber-purple text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Speed Read"
                >
                  Speed
                </button>
                <button
                  onClick={() => setZenMode(!zenMode)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    zenMode ? 'bg-cyber-green text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Zen Mode"
                >
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
          
          <div className="flex items-center space-x-1 overflow-x-auto pb-2 scrollbar-hide">
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {loading && articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <RefreshCw className="w-12 h-12 text-cyber-blue animate-spin" />
                <p className="text-gray-400">Loading latest news...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-gray-400">{error}</p>
                <button
                  onClick={refresh}
                  className="mt-4 px-4 py-2 bg-cyber-blue rounded-lg text-white hover:bg-cyber-blue/80 transition-all"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {articles.slice(0, displayedCount).map((article, index) => (
                  <motion.article
                    key={article.url + index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    onClick={() => openArticle(article)}
                    className="group bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-cyber-blue/50 transition-all duration-300 cursor-pointer"
                  >
                    {article.urlToImage && (
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={article.urlToImage} 
                          alt={article.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => (e.currentTarget.parentElement!.style.display = 'none')}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 bg-cyber-blue/80 backdrop-blur-sm rounded text-xs text-white font-medium">
                            {typeof article.source === 'object' ? article.source?.name : article.source}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyber-blue transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {article.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-cyber-blue">
                            {Math.ceil((article.content?.length || 0) / 1000)} min read
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                        <button
                          onClick={(e) => toggleBookmark(article, e)}
                          className={`p-2 rounded-lg transition-all ${isBookmarked(article) ? 'bg-cyber-blue/20 text-cyber-blue' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked(article) ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => handleShare(article, e)}
                          className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all ml-auto"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </motion.article>
                ))}
                
                {/* Infinite scroll loader */}
                {displayedCount < articles.length && (
                  <div ref={loaderRef} className="flex justify-center py-8">
                    <RefreshCw className="w-8 h-8 text-cyber-blue animate-spin" />
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="hidden lg:block space-y-6">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search news..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-blue/50"
                />
              </div>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyber-blue" />
                Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Articles</span>
                  <span className="text-white font-medium">{articles.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Bookmarks</span>
                  <span className="text-white font-medium">{bookmarkedArticles.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Category</span>
                  <span className="text-cyber-blue font-medium capitalize">{selectedCategory}</span>
                </div>
                {lastRefresh && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Updated</span>
                    <span className="text-gray-500">
                      {new Date(lastRefresh).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Theme Selector */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5 text-cyber-blue" />
                Theme
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {['cyber', 'dark', 'light'].map((t) => (
                  <button
                    key={t}
                    onClick={() => changeTheme(t as any)}
                    className={`px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                      theme === t
                        ? 'bg-cyber-blue text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
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
