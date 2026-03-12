'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Globe2, Clock, TrendingUp, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchBarProps {
  onSearch: (query: string) => void
  onCountryChange: (country: string) => void
  currentCountry: string
}

const COUNTRIES = [
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'it', name: 'Italy', flag: '🇮🇹' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'cn', name: 'China', flag: '🇨🇳' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷' },
  { code: 'mx', name: 'Mexico', flag: '🇲🇽' },
  { code: 'ru', name: 'Russia', flag: '🇷🇺' },
  { code: 'za', name: 'South Africa', flag: '🇿🇦' },
  { code: 'kr', name: 'South Korea', flag: '🇰🇷' },
]

const TRENDING_SEARCHES = [
  'AI', 'Climate', 'Technology', 'Politics', 'Economy', 'Space', 'Health'
]

export default function SearchBar({ onSearch, onCountryChange, currentCountry }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load search history from localStorage
    const saved = localStorage.getItem('searchHistory')
    if (saved) {
      setSearchHistory(JSON.parse(saved))
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      // Save to search history
      const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10)
      setSearchHistory(newHistory)
      localStorage.setItem('searchHistory', JSON.stringify(newHistory))
      
      onSearch(query)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    onSearch(suggestion)
    setShowSuggestions(false)
  }

  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('searchHistory')
  }

  const removeHistoryItem = (item: string) => {
    const filtered = searchHistory.filter(h => h !== item)
    setSearchHistory(filtered)
    localStorage.setItem('searchHistory', JSON.stringify(filtered))
  }

  return (
    <div className="cyber-card relative">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search global news..."
            className="w-full pl-10 pr-4 py-3 bg-cyber-dark border border-cyber-blue/30 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue transition-all"
          />
          
          {/* Search Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-cyber-dark border border-cyber-blue/30 rounded-lg shadow-xl z-50 overflow-hidden"
              >
                {/* Search History */}
                {searchHistory.length > 0 && (
                  <div className="p-3 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>Recent Searches</span>
                      </div>
                      <button
                        onClick={clearHistory}
                        className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.slice(0, 5).map((item) => (
                        <div
                          key={item}
                          className="flex items-center space-x-1 px-2 py-1 bg-cyber-dark/50 border border-gray-700 rounded text-sm text-gray-300 hover:border-cyber-blue/50 cursor-pointer group"
                        >
                          <span onClick={() => handleSuggestionClick(item)}>{item}</span>
                          <X
                            className="w-3 h-3 text-gray-500 hover:text-red-500 hidden group-hover:block"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeHistoryItem(item)
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Trending Searches */}
                <div className="p-3">
                  <div className="flex items-center space-x-2 text-xs text-gray-400 mb-2">
                    <TrendingUp className="w-3 h-3" />
                    <span>Trending</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_SEARCHES.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSuggestionClick(term)}
                        className="px-2 py-1 bg-cyber-blue/10 border border-cyber-blue/30 rounded text-sm text-cyber-blue hover:bg-cyber-blue/20 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <Globe2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          <select
            value={currentCountry}
            onChange={(e) => onCountryChange(e.target.value)}
            className="pl-10 pr-4 py-3 bg-cyber-dark border border-cyber-blue/30 rounded-lg text-gray-100 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue transition-all appearance-none cursor-pointer min-w-[180px]"
          >
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="cyber-button px-6 py-3 whitespace-nowrap"
        >
          Search
        </button>
      </form>
    </div>
  )
}
