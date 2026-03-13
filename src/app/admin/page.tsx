'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, Newspaper, TrendingUp, Settings, LogOut, 
  Eye, ThumbsUp, Bookmark, AlertTriangle, Search, ChevronLeft,
  BarChart3, Users, Clock, RefreshCw, Trash2, Edit, ExternalLink,
  Menu, X, Bell, Activity
} from 'lucide-react'
import { toast } from 'sonner'

interface AdminStats {
  totalArticles: number
  totalViews: number
  totalLikes: number
  totalSaves: number
  breakingNews: number
  recentArticles: number
  totalBookmarks: number
}

interface Article {
  id: string
  title: string
  description: string | null
  url: string
  urlToImage: string | null
  source: string | null
  category: string
  viewCount: number
  likeCount: number
  saveCount: number
  isBreaking: boolean
  publishedAt: string
  bookmarkCount: number
  engagementCount: number
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [articlesPage, setArticlesPage] = useState(1)
  const [articlesTotal, setArticlesTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      fetch('/api/admin/auth', {
        headers: { authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.authenticated) {
            setIsAuthenticated(true)
          } else {
            localStorage.removeItem('adminToken')
          }
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  // Fetch stats when authenticated
  useEffect(() => {
    if (isAuthenticated && activeTab === 'dashboard') {
      fetchStats()
    }
  }, [isAuthenticated, activeTab])

  // Fetch articles when on articles tab
  useEffect(() => {
    if (isAuthenticated && activeTab === 'articles') {
      fetchArticles()
    }
  }, [isAuthenticated, activeTab, articlesPage, searchQuery, categoryFilter])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      
      if (data.success) {
        localStorage.setItem('adminToken', data.token)
        setIsAuthenticated(true)
        toast.success('Welcome back!')
      } else {
        toast.error('Invalid credentials')
      }
    } catch {
      toast.error('Login failed')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setIsAuthenticated(false)
    setEmail('')
    setPassword('')
  }

  const fetchStats = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      setStats(data.stats)
    } catch {
      toast.error('Failed to fetch stats')
    } finally {
      setRefreshing(false)
    }
  }

  const fetchArticles = async () => {
    setRefreshing(true)
    try {
      const params = new URLSearchParams({
        page: articlesPage.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
        ...(categoryFilter && { category: categoryFilter })
      })
      const res = await fetch(`/api/admin/articles?${params}`)
      const data = await res.json()
      setArticles(data.articles)
      setArticlesTotal(data.pagination.total)
    } catch {
      toast.error('Failed to fetch articles')
    } finally {
      setRefreshing(false)
    }
  }

  const toggleBreaking = async (article: Article) => {
    try {
      await fetch('/api/admin/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: article.id, isBreaking: !article.isBreaking })
      })
      toast.success(`Breaking news ${article.isBreaking ? 'removed' : 'set'}`)
      fetchArticles()
    } catch {
      toast.error('Failed to update')
    }
  }

  const deleteArticle = async (id: string) => {
    if (!confirm('Delete this article?')) return
    try {
      await fetch(`/api/admin/articles?id=${id}`, { method: 'DELETE' })
      toast.success('Article deleted')
      fetchArticles()
      fetchStats()
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-white/40">Global Pulse</p>
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors"
                placeholder="admin@globalpulse.com"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 72 }}
        className="bg-white/5 border-r border-white/10 flex flex-col"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="font-bold">Admin</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg">
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        <nav className="flex-1 p-2 space-y-1">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
            { id: 'articles', icon: Newspaper, label: 'Articles' },
            { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        
        <div className="p-2 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold capitalize">{activeTab}</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (activeTab === 'dashboard') fetchStats()
                  if (activeTab === 'articles') fetchArticles()
                }}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="flex items-center gap-2 text-sm text-white/40">
                <Clock className="w-4 h-4" />
                {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Articles', value: stats.totalArticles, icon: Newspaper, color: 'from-cyan-500 to-blue-500' },
                  { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'from-purple-500 to-pink-500' },
                  { label: 'Total Likes', value: stats.totalLikes.toLocaleString(), icon: ThumbsUp, color: 'from-emerald-500 to-teal-500' },
                  { label: 'Total Saves', value: stats.totalSaves.toLocaleString(), icon: Bookmark, color: 'from-orange-500 to-amber-500' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold mb-1">{stat.value}</p>
                    <p className="text-sm text-white/40">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="font-semibold text-red-400">Breaking News</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.breakingNews}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold text-emerald-400">Last 24h</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.recentArticles} new</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-blue-400">Bookmarks</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalBookmarks}</p>
                </div>
              </div>
            </div>
          )}

          {/* Articles Tab */}
          {activeTab === 'articles' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search articles..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30"
                >
                  <option value="">All Categories</option>
                  <option value="general">General</option>
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="health">Health</option>
                  <option value="science">Science</option>
                  <option value="sports">Sports</option>
                  <option value="entertainment">Entertainment</option>
                </select>
              </div>

              {/* Articles Table */}
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-white/60">Article</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-white/60">Category</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-white/60">Stats</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-white/60">Breaking</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-white/60">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {articles.map((article) => (
                        <tr key={article.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {article.urlToImage && (
                                <img src={article.urlToImage} alt="" className="w-12 h-12 object-cover rounded-lg" />
                              )}
                              <div className="min-w-0">
                                <p className="font-medium line-clamp-1">{article.title}</p>
                                <p className="text-xs text-white/40">{article.source}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs rounded-full bg-white/10 capitalize">{article.category}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 text-xs text-white/40">
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.viewCount}</span>
                              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{article.likeCount}</span>
                              <span className="flex items-center gap-1"><Bookmark className="w-3 h-3" />{article.bookmarkCount}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleBreaking(article)}
                              className={`px-3 py-1 text-xs rounded-full transition-all ${
                                article.isBreaking
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : 'bg-white/5 text-white/40 border border-white/10'
                              }`}
                            >
                              {article.isBreaking ? 'Yes' : 'No'}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              >
                                <ExternalLink className="w-4 h-4 text-white/40" />
                              </a>
                              <button
                                onClick={() => deleteArticle(article.id)}
                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-white/40 hover:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                  <p className="text-sm text-white/40">
                    Showing {articles.length} of {articlesTotal} articles
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setArticlesPage(p => Math.max(1, p - 1))}
                      disabled={articlesPage === 1}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm disabled:opacity-30"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setArticlesPage(p => p + 1)}
                      disabled={articles.length < 20}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm disabled:opacity-30"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">Advanced analytics coming soon</p>
                <p className="text-sm text-white/20 mt-2">Charts, trends, and detailed reports</p>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="font-semibold mb-4">API Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">News API Key</label>
                    <input
                      type="password"
                      value="••••••••••••"
                      disabled
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Groq API Key (AI Summaries)</label>
                    <input
                      type="password"
                      value="••••••••••••"
                      disabled
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg opacity-50"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="font-semibold mb-4">Refresh Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Auto-refresh interval (seconds)</label>
                    <input
                      type="number"
                      defaultValue={15}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
