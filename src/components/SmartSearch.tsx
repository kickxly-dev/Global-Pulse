'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Clock, TrendingUp, Filter, SlidersHorizontal } from 'lucide-react'

interface SmartSearchProps {
  onSearch: (query: string) => void
  onFilter?: (filters: SearchFilters) => void
}

interface SearchFilters {
  category: string
  dateRange: string
  source: string
}

export default function SmartSearch({ onSearch, onFilter }: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const popularSearches = [
    'Artificial Intelligence',
    'Climate Change',
    'Stock Market',
    'Space Exploration',
    'Health News',
    'Technology',
    'Politics',
    'Economy'
  ]

  useEffect(() => {
    // Load recent searches from localStorage
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('recentSearches')
        if (saved) {
          setRecentSearches(JSON.parse(saved))
        }
      }
    } catch (e) {
      console.error('Error loading recent searches:', e)
    }
  }, [])

  useEffect(() => {
    if (query.length > 2) {
      // Generate suggestions based on query
      const filtered = popularSearches.filter(s => 
        s.toLowerCase().includes(query.toLowerCase())
      )
      setSuggestions(filtered.slice(0, 5))
    } else {
      setSuggestions([])
    }
  }, [query])

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query)
      
      // Save to recent searches
      try {
        if (typeof window !== 'undefined') {
          const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
          setRecentSearches(newRecent)
          localStorage.setItem('recentSearches', JSON.stringify(newRecent))
        }
      } catch (e) {
        console.error('Error saving search:', e)
      }
      
      setIsFocused(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setSuggestions([])
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className={`relative flex items-center gap-2 p-2 rounded-2xl border transition-all duration-300 ${
        isFocused 
          ? 'bg-gray-800/80 border-cyber-blue/50 shadow-lg shadow-cyber-blue/10' 
          : 'bg-gray-900/50 border-white/10'
      }`}>
        <Search className={`w-5 h-5 transition-colors ${isFocused ? 'text-cyber-blue' : 'text-gray-500'}`} />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search news, topics, or keywords..."
          className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
        />
        
        {query && (
          <button
            onClick={clearSearch}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg transition-all ${showFilters ? 'bg-cyber-blue/20 text-cyber-blue' : 'hover:bg-white/10 text-gray-500'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-gradient-to-r from-cyber-blue to-cyber-purple text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-cyber-blue/30 transition-all"
        >
          Search
        </button>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && (suggestions.length > 0 || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
          >
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                  <TrendingUp className="w-3 h-3" />
                  <span>Suggestions</span>
                </div>
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(suggestion)
                      onSearch(suggestion)
                      setIsFocused(false)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors text-left"
                  >
                    <Search className="w-3 h-3 text-gray-500" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            
            {/* Recent Searches */}
            {recentSearches.length > 0 && !query && (
              <div className="p-3 border-t border-white/10">
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Recent Searches</span>
                </div>
                {recentSearches.map((search, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(search)
                      onSearch(search)
                      setIsFocused(false)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors text-left"
                  >
                    <Clock className="w-3 h-3 text-gray-500" />
                    {search}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-4 bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl"
          >
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Category</label>
                <select className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyber-blue">
                  <option value="">All Categories</option>
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="health">Health</option>
                  <option value="science">Science</option>
                  <option value="sports">Sports</option>
                  <option value="entertainment">Entertainment</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Date Range</label>
                <select className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyber-blue">
                  <option value="">Any Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Source</label>
                <select className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyber-blue">
                  <option value="">All Sources</option>
                  <option value="bbc">BBC</option>
                  <option value="cnn">CNN</option>
                  <option value="reuters">Reuters</option>
                  <option value="techcrunch">TechCrunch</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
