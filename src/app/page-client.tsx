'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, Search, Bookmark, RefreshCw } from 'lucide-react'
import { useNewsData } from '@/hooks/useNewsData'
import { useTheme } from '@/hooks/useTheme'

export default function HomePageClient() {
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')
  
  const { articles, loading, error, refresh } = useNewsData({
    category: selectedCategory,
    query: searchQuery,
    country: 'us',
    refreshInterval: 60000
  })
  
  const { theme } = useTheme()

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
            
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                <Bookmark className="w-5 h-5 text-gray-300" />
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
                <div
                  key={article.url + index}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-cyber-blue/50 transition-all cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{article.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{article.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{article.source}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="hidden lg:block">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search news..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-blue/50"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
