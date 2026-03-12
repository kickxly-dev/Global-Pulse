'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Filter, X, Calendar, Globe, 
  Newspaper, Clock, ChevronDown, Check
} from 'lucide-react'

interface SearchFilters {
  dateRange: 'any' | 'today' | 'week' | 'month'
  sources: string[]
  sortBy: 'relevance' | 'date' | 'popularity'
  language: string
}

interface AdvancedSearchProps {
  query: string
  onQueryChange: (query: string) => void
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onSearch: () => void
}

const popularSources = [
  'BBC News', 'CNN', 'Reuters', 'The Guardian', 
  'New York Times', 'Washington Post', 'TechCrunch', 'The Verge'
]

export default function AdvancedSearch({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  onSearch,
}: AdvancedSearchProps) {
  const [showFilters, setShowFilters] = useState(false)

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleSource = (source: string) => {
    const newSources = filters.sources.includes(source)
      ? filters.sources.filter(s => s !== source)
      : [...filters.sources, source]
    updateFilter('sources', newSources)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex items-center bg-gray-900/80 border border-white/10 rounded-2xl overflow-hidden focus-within:border-cyber-blue transition-colors">
          <Search className="w-5 h-5 text-gray-400 ml-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Search news, topics, or sources..."
            className="flex-1 bg-transparent px-4 py-4 text-white placeholder-gray-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => onQueryChange('')}
              className="p-2 hover:bg-white/10 rounded-full mr-2 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-4 border-l border-white/10 transition-colors ${
              showFilters ? 'bg-cyber-blue/20 text-cyber-blue' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={onSearch}
            className="px-6 py-4 bg-cyber-blue text-gray-900 font-medium hover:bg-cyber-blue/80 transition-colors"
          >
            Search
          </button>
        </div>

        {/* Active Filters Pills */}
        {filters.sources.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.sources.map(source => (
              <span
                key={source}
                className="inline-flex items-center gap-1 px-3 py-1 bg-cyber-blue/20 border border-cyber-blue/30 rounded-full text-sm text-cyber-blue"
              >
                <Newspaper className="w-3 h-3" />
                {source}
                <button
                  onClick={() => toggleSource(source)}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={() => updateFilter('sources', [])}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-gray-900/80 border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Date Range */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                  <Calendar className="w-4 h-4 text-cyber-blue" />
                  Date Range
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['any', 'today', 'week', 'month'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => updateFilter('dateRange', range)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        filters.dateRange === range
                          ? 'bg-cyber-blue text-gray-900'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sources */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                  <Globe className="w-4 h-4 text-cyber-blue" />
                  Sources
                </label>
                <div className="flex flex-wrap gap-2">
                  {popularSources.map((source) => (
                    <button
                      key={source}
                      onClick={() => toggleSource(source)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        filters.sources.includes(source)
                          ? 'bg-cyber-blue/20 border border-cyber-blue text-cyber-blue'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      {filters.sources.includes(source) && (
                        <Check className="w-3 h-3 inline mr-1" />
                      )}
                      {source}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                  <Clock className="w-4 h-4 text-cyber-blue" />
                  Sort By
                </label>
                <div className="flex gap-2">
                  {(['relevance', 'date', 'popularity'] as const).map((sort) => (
                    <button
                      key={sort}
                      onClick={() => updateFilter('sortBy', sort)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        filters.sortBy === sort
                          ? 'bg-cyber-blue text-gray-900'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {sort.charAt(0).toUpperCase() + sort.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => {
                    onFiltersChange({
                      dateRange: 'any',
                      sources: [],
                      sortBy: 'relevance',
                      language: 'en',
                    })
                  }}
                  className="text-sm text-gray-500 hover:text-gray-300"
                >
                  Reset all filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
