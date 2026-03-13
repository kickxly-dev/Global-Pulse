'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Globe, Search, Bookmark, RefreshCw, AlertCircle, Share2, 
  X, Newspaper, Moon, Sun, Zap, ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import { useNewsData } from '@/hooks/useNewsData'
import { useTheme } from '@/hooks/useTheme'
import ModernArticleView from '@/components/ModernArticleView'
import ShareModal from '@/components/ShareModal'

export default function HomePageClient() {
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookmarkedArticles, setBookmarkedArticles] = useState<any[]>([])
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<any>(null)
  const [showArticle, setShowArticle] = useState(false)
  const [shareArticle, setShareArticle] = useState<any>(null)
  const [showShare, setShowShare] = useState(false)
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

  // Check if article is bookmarked
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
    { id: 'general', name: 'General' },
    { id: 'technology', name: 'Technology' },
    { id: 'business', name: 'Business' },
    { id: 'health', name: 'Health' },
    { id: 'science', name: 'Science' },
    { id: 'sports', name: 'Sports' },
    { id: 'entertainment', name: 'Entertainment' },
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
              <Globe className="w-10 h-10 text-cyber-blue" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent">
                  Global Pulse
                </h1>
                <p className="text-xs text-gray-500">Real-time Global Intelligence</p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-2">
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
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-cyber-blue text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="w-8 h-8 text-cyber-blue animate-spin" />
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
              articles.map((article, index) => (
                <motion.div
                  key={article.url + index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => openArticle(article)}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-cyber-blue/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyber-blue transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{article.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {typeof article.source === 'object' ? article.source?.name : article.source}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {article.urlToImage && (
                      <img 
                        src={article.urlToImage} 
                        alt="" 
                        className="w-24 h-24 object-cover rounded-lg hidden sm:block"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
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
                </motion.div>
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
          isOpen={showArticle}
          onClose={() => setShowArticle(false)}
          onShare={() => handleShare(selectedArticle)}
          onBookmark={() => toggleBookmark(selectedArticle)}
          isBookmarked={isBookmarked(selectedArticle)}
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
    </div>
  )
}
