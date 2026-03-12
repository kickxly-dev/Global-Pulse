'use client'

import { useState, useEffect, useCallback } from 'react'

export interface SearchHistoryItem {
  query: string
  timestamp: number
  count: number
}

const MAX_HISTORY = 20
const STORAGE_KEY = 'searchHistory'

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse search history:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  const saveHistory = useCallback((newHistory: SearchHistoryItem[]) => {
    setHistory(newHistory)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
  }, [])

  const addSearch = useCallback((query: string) => {
    if (!query.trim()) return

    const normalizedQuery = query.toLowerCase().trim()
    const now = Date.now()

    setHistory(prev => {
      const existing = prev.find(h => h.query.toLowerCase() === normalizedQuery)
      let newHistory: SearchHistoryItem[]

      if (existing) {
        newHistory = [
          { ...existing, timestamp: now, count: existing.count + 1 },
          ...prev.filter(h => h.query.toLowerCase() !== normalizedQuery)
        ]
      } else {
        newHistory = [
          { query: normalizedQuery, timestamp: now, count: 1 },
          ...prev
        ].slice(0, MAX_HISTORY)
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
      return newHistory
    })
  }, [])

  const removeSearch = useCallback((query: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(h => h.query.toLowerCase() !== query.toLowerCase())
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
      return newHistory
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const getTrending = useCallback((limit: number = 5): SearchHistoryItem[] => {
    return [...history]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }, [history])

  const getRecent = useCallback((limit: number = 10): SearchHistoryItem[] => {
    return history.slice(0, limit)
  }, [history])

  return {
    history,
    isLoaded,
    addSearch,
    removeSearch,
    clearHistory,
    getTrending,
    getRecent,
  }
}

// Trending topics (simulated - in production would come from backend)
export const TRENDING_TOPICS = [
  { query: 'AI technology', count: 1250, trending: 'up' },
  { query: 'climate change', count: 980, trending: 'up' },
  { query: 'stock market', count: 850, trending: 'stable' },
  { query: 'space exploration', count: 720, trending: 'up' },
  { query: 'electric vehicles', count: 650, trending: 'up' },
  { query: 'cryptocurrency', count: 580, trending: 'down' },
  { query: 'healthcare', count: 520, trending: 'stable' },
  { query: 'renewable energy', count: 480, trending: 'up' },
]
