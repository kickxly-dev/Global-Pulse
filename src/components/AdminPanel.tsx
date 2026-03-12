'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Database, Users, Settings, Activity, Zap, Eye, EyeOff, Trash2, Download, RefreshCw, Lock, Newspaper, TrendingUp, BarChart3 } from 'lucide-react'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalArticles: number
  apiCalls: number
  errorRate: number
  avgResponseTime: number
  storageUsed: string
  uptime: string
}

interface Article {
  id: string
  title: string
  description: string
  source: { name: string }
  publishedAt: string
  category?: string
  url?: string
}

export default function AdminPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalArticles: 0,
    apiCalls: 0,
    errorRate: 0,
    avgResponseTime: 0,
    storageUsed: '0 MB',
    uptime: '0 days',
  })
  const [logs, setLogs] = useState<string[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'users' | 'logs'>('overview')

  // Secret key combination: Ctrl+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault()
        setIsVisible(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Load admin data
  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData()
      const interval = setInterval(loadAdminData, 5000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const generateSampleArticles = () => {
    const sampleArticles: Article[] = Array.from({ length: 20 }, (_, i) => ({
      id: `article-${i}`,
      title: `Sample News Article ${i + 1}`,
      description: `This is a sample description for article ${i + 1}...`,
      source: { name: ['CNN', 'BBC', 'Reuters', 'AP News'][i % 4] },
      publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
      category: ['general', 'technology', 'business', 'health'][i % 4],
      url: `https://example.com/article-${i}`,
    }))
    setArticles(sampleArticles)
  }

  const loadAdminData = () => {
    // Simulate admin data loading
    setStats({
      totalUsers: Math.floor(Math.random() * 10000) + 1000,
      activeUsers: Math.floor(Math.random() * 500) + 100,
      totalArticles: Math.floor(Math.random() * 50000) + 10000,
      apiCalls: Math.floor(Math.random() * 100000) + 50000,
      errorRate: Math.random() * 5,
      avgResponseTime: Math.random() * 500 + 100,
      storageUsed: `${Math.floor(Math.random() * 500) + 100} MB`,
      uptime: `${Math.floor(Math.random() * 30) + 1} days`,
    })

    // Load articles from localStorage with error handling
    try {
      const saved = localStorage.getItem('cachedArticles')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setArticles(Array.isArray(parsed) ? parsed.slice(0, 50) : [])
        } catch (parseError) {
          console.error('Failed to parse cached articles:', parseError)
          setArticles([])
        }
      } else {
        // Generate sample articles if no cached data
        generateSampleArticles()
      }
    } catch (e) {
      console.error('localStorage access error:', e)
      generateSampleArticles()
    }

    // Add some logs
    const newLogs = [
      `[${new Date().toISOString()}] User login: user@example.com`,
      `[${new Date().toISOString()}] API call: /api/news`,
      `[${new Date().toISOString()}] Error: Rate limit exceeded for IP 192.168.1.1`,
      `[${new Date().toISOString()}] Newsletter subscription: test@email.com`,
    ]
    setLogs(prev => [...newLogs, ...prev].slice(0, 50))
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Secret password: "admin123"
    if (password === 'admin123') {
      setIsAuthenticated(true)
      setPassword('')
    } else {
      alert('Invalid password')
    }
  }

  const clearData = (type: 'cache' | 'logs' | 'all') => {
    if (confirm(`Clear ${type}? This action cannot be undone.`)) {
      if (type === 'logs') setLogs([])
      // In production, this would clear actual data
      alert(`${type} cleared`)
    }
  }

  const exportData = () => {
    const data = {
      stats,
      logs,
      timestamp: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={() => setIsVisible(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-cyber-darker border border-cyber-red/50 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-cyber-red" />
              <h1 className="text-2xl font-bold text-cyber-red">Admin Panel</h1>
              <Lock className="w-4 h-4 text-gray-500" />
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white"
            >
              <EyeOff className="w-5 h-5" />
            </button>
          </div>

          {!isAuthenticated ? (
            <form onSubmit={handleLogin} className="max-w-sm mx-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-cyber-dark border border-gray-700 rounded-lg text-white focus:border-cyber-red focus:outline-none"
                    placeholder="Enter password"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-cyber-red hover:bg-cyber-red/80 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Access Admin
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex space-x-1 bg-cyber-dark/50 border border-gray-700 rounded-lg p-1">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'articles', label: 'Articles', icon: Newspaper },
                  { id: 'users', label: 'Users', icon: Users },
                  { id: 'logs', label: 'Logs', icon: Settings },
                ].map(tab => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-cyber-blue text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-cyber-dark/50 border border-gray-700 rounded-lg p-4">
                      <Users className="w-5 h-5 text-cyber-blue mb-2" />
                      <p className="text-xs text-gray-400">Total Users</p>
                      <p className="text-xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
                    </div>
                    <div className="bg-cyber-dark/50 border border-gray-700 rounded-lg p-4">
                      <Activity className="w-5 h-5 text-cyber-green mb-2" />
                      <p className="text-xs text-gray-400">Active Now</p>
                      <p className="text-xl font-bold text-white">{stats.activeUsers}</p>
                    </div>
                    <div className="bg-cyber-dark/50 border border-gray-700 rounded-lg p-4">
                      <Database className="w-5 h-5 text-cyber-yellow mb-2" />
                      <p className="text-xs text-gray-400">Articles</p>
                      <p className="text-xl font-bold text-white">{stats.totalArticles.toLocaleString()}</p>
                    </div>
                    <div className="bg-cyber-dark/50 border border-gray-700 rounded-lg p-4">
                      <Zap className="w-5 h-5 text-cyber-purple mb-2" />
                      <p className="text-xs text-gray-400">API Calls</p>
                      <p className="text-xl font-bold text-white">{stats.apiCalls.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-cyber-dark/30 border border-gray-700 rounded-lg p-4">
                    <h2 className="text-lg font-bold text-white mb-3">Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Error Rate</p>
                        <p className={`text-lg font-bold ${
                          stats.errorRate > 5 ? 'text-cyber-red' : 
                          stats.errorRate > 2 ? 'text-cyber-yellow' : 'text-cyber-green'
                        }`}>
                          {stats.errorRate.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Avg Response</p>
                        <p className="text-lg font-bold text-cyber-blue">
                          {stats.avgResponseTime.toFixed(0)}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Uptime</p>
                        <p className="text-lg font-bold text-cyber-green">{stats.uptime}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Articles Tab */}
              {activeTab === 'articles' && (
                <div className="bg-cyber-dark/30 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Recent Articles</h2>
                    <span className="text-sm text-gray-400">{articles.length} articles</span>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {articles.map((article, i) => (
                      <div key={article.id || i} className="bg-cyber-dark/50 border border-gray-700 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-white line-clamp-1">{article.title}</h3>
                            <p className="text-xs text-gray-400 line-clamp-2 mt-1">{article.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs text-cyber-blue">{article.source.name}</span>
                              {article.category && (
                                <span className="text-xs text-cyber-yellow">• {article.category}</span>
                              )}
                              <span className="text-xs text-gray-500">
                                • {new Date(article.publishedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {article.url && (
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-cyber-blue hover:text-cyber-blue/80"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="bg-cyber-dark/30 border border-gray-700 rounded-lg p-4">
                  <h2 className="text-lg font-bold text-white mb-4">User Management</h2>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-cyber-blue mx-auto mb-4" />
                      <p className="text-gray-400">User management features coming soon</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Logs Tab */}
              {activeTab === 'logs' && (
                <div className="bg-cyber-dark/30 border border-gray-700 rounded-lg p-4">
                  <h2 className="text-lg font-bold text-white mb-3">System Logs</h2>
                  <div className="bg-black rounded-lg p-3 h-48 overflow-y-auto font-mono text-xs">
                    {logs.map((log, i) => (
                      <div key={i} className="text-gray-400 hover:text-white">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => loadAdminData()}
                  className="px-4 py-2 bg-cyber-blue hover:bg-cyber-blue/80 text-white rounded-lg flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={exportData}
                  className="px-4 py-2 bg-cyber-green hover:bg-cyber-green/80 text-white rounded-lg flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Data</span>
                </button>
                <button
                  onClick={() => clearData('cache')}
                  className="px-4 py-2 bg-cyber-yellow hover:bg-cyber-yellow/80 text-black rounded-lg flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Cache</span>
                </button>
                <button
                  onClick={() => clearData('logs')}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Logs</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
