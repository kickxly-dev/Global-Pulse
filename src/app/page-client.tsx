'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Globe, Bookmark, RefreshCw, AlertCircle
} from 'lucide-react'
import { useNewsData } from '@/hooks/useNewsData'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import EnhancedNewsCard from '@/components/EnhancedNewsCard'
import ModernArticleView from '@/components/ModernArticleView'
import ShareModal from '@/components/ShareModal'
import BookmarksPanel from '@/components/FixedFeatures'
import DailyDigest from '@/components/DailyDigest'
import AutoRefreshIndicator from '@/components/AutoRefreshIndicator'
import ModernLoading from '@/components/ModernLoading'
import { useTheme } from '@/hooks/useTheme'

export default function HomePageClient() {
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [country, setCountry] = useState('us')
  const [searchQuery, setSearchQuery] = useState('')
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showArticle, setShowArticle] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<any>(null)
  const [showShare, setShowShare] = useState(false)
  const [shareArticle, setShareArticle] = useState<any>(null)
  const [showDailyDigest, setShowDailyDigest] = useState(false)
  const [breakingNewsAlert, setBreakingNewsAlert] = useState(false)
  const [newStoryAnimation, setNewStoryAnimation] = useState(false)
  const [bookmarkedArticles, setBookmarkedArticles] = useState<any[]>([])
  const [globalMood, setGlobalMood] = useState<any>({ dominant: 'neutral' })
  const previousArticleCount = useRef(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const { articles, loading, error, refresh, lastRefresh } = useNewsData({
    category: selectedCategory,
    query: searchQuery,
    country: country,
    refreshInterval: 60000
  })
  
  const { theme, changeTheme } = useTheme()

  useEffect(() => {
    const saved = localStorage.getItem('bookmarkedArticles')
    if (saved) {
      setBookmarkedArticles(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (articles.length > previousArticleCount.current && previousArticleCount.current > 0) {
      setNewStoryAnimation(true)
      setTimeout(() => setNewStoryAnimation(false), 1500)
      
      const hasBreaking = articles.some(article => {
        const publishedTime = new Date(article.publishedAt).getTime()
        const now = Date.now()
        return (now - publishedTime) < (60 * 60 * 1000)
      })
      
      if (hasBreaking) {
        setBreakingNewsAlert(true)
        setTimeout(() => setBreakingNewsAlert(false), 5000)
      }
    }
    previousArticleCount.current = articles.length
  }, [articles])

  const isArticleBookmarked = (article: any) => {
    return bookmarkedArticles.some(a => a.url === article.url)
  }

  const toggleBookmark = (article: any) => {
    const isBookmarked = isArticleBookmarked(article)
    let newBookmarks
    
    if (isBookmarked) {
      newBookmarks = bookmarkedArticles.filter(a => a.url !== article.url)
      toast.success('Removed from bookmarks')
    } else {
      newBookmarks = [...bookmarkedArticles, article]
      toast.success('Added to bookmarks')
    }
    
    setBookmarkedArticles(newBookmarks)
    localStorage.setItem('bookmarkedArticles', JSON.stringify(newBookmarks))
  }

  const handleShare = (article: any) => {
    setShareArticle(article)
    setShowShare(true)
  }

  const handleReadArticle = (article: any) => {
    setSelectedArticle(article)
    setShowArticle(true)
  }

  const categories = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'technology', name: 'Technology', icon: Globe },
    { id: 'business', name: 'Business', icon: Globe },
    { id: 'health', name: 'Health', icon: Globe },
    { id: 'science', name: 'Science', icon: Globe },
    { id: 'sports', name: 'Sports', icon: Globe },
    { id: 'entertainment', name: 'Entertainment', icon: Globe },
  ]

  return (
    <div className={`min-h-screen bg-cyber-darker ${theme === 'light' ? 'theme-light' : theme === 'dark' ? 'theme-dark' : 'theme-cyber'}`}>
      
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
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowBookmarks(true)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all relative"
              >
                <Bookmark className="w-5 h-5 text-gray-300" />
                {bookmarkedArticles.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyber-blue rounded-full text-xs flex items-center justify-center text-white">
                    {bookmarkedArticles.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setShowDailyDigest(true)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              >
                <Globe className="w-5 h-5 text-gray-300" />
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
              <ModernLoading />
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-400">{error}</p>
                <button
                  onClick={refresh}
                  className="mt-4 px-4 py-2 bg-cyber-blue rounded-lg text-white hover:bg-cyber-blue/80 transition-all"
                >
                  Try Again
                </button>
              </div>
            ) : (
              articles.map((article, index) => (
                <EnhancedNewsCard
                  key={article.url + index}
                  article={article}
                  onRead={() => handleReadArticle(article)}
                  onShare={() => handleShare(article)}
                  onBookmark={() => toggleBookmark(article)}
                  isBookmarked={isArticleBookmarked(article)}
                />
              ))
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
              <h3 className="text-lg font-semibold text-white mb-4">Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Articles</span>
                  <span className="text-white">{articles.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Bookmarks</span>
                  <span className="text-white">{bookmarkedArticles.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Global Mood</span>
                  <span className="text-white capitalize">{globalMood?.dominant || 'neutral'}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
              <div className="flex space-x-2">
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
      
      {showArticle && selectedArticle && (
        <ModernArticleView
          article={selectedArticle}
          isOpen={showArticle}
          onClose={() => setShowArticle(false)}
          onShare={() => handleShare(selectedArticle)}
          onBookmark={() => toggleBookmark(selectedArticle)}
          isBookmarked={isArticleBookmarked(selectedArticle)}
        />
      )}
      
      {showShare && shareArticle && (
        <ShareModal
          article={shareArticle}
          isOpen={showShare}
          onClose={() => setShowShare(false)}
        />
      )}
      
      {showBookmarks && (
        <BookmarksPanel
          isOpen={showBookmarks}
          onClose={() => setShowBookmarks(false)}
          bookmarks={bookmarkedArticles}
          onRemoveBookmark={toggleBookmark}
          onReadArticle={handleReadArticle}
        />
      )}
      
      <DailyDigest
        isOpen={showDailyDigest}
        onClose={() => setShowDailyDigest(false)}
      />
      
      <AutoRefreshIndicator
        isAutoRefreshing={loading}
        lastRefresh={lastRefresh}
      />
    </div>
  )
}
