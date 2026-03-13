'use client'

import { useState, useEffect, useCallback } from 'react'
import { NewsArticle } from '@/types/news'

interface UseCustomNewsReturn {
  articles: NewsArticle[]
  loading: boolean
  error: string | null
  refresh: () => void
  lastUpdated: Date | null
}

export function useCustomNews(
  category: string = 'general',
  query: string = '',
  refreshInterval: number = 300000 // 5 minutes
): UseCustomNewsReturn {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchNews = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (category && category !== 'general') params.append('category', category)
      if (query) params.append('q', query)
      if (forceRefresh) params.append('refresh', 'true')

      const url = `/api/news-custom?${params.toString()}`
      
      const response = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache' }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status === 'ok') {
        setArticles(data.articles)
        setLastUpdated(new Date(data.lastUpdated))
      } else {
        throw new Error('Invalid response')
      }
    } catch (err) {
      console.error('Custom news fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch news')
      
      // Fallback to sample data
      setArticles([
        {
          id: 'fallback-1',
          title: 'Global Markets Update: Tech Stocks Lead Gains',
          description: 'Technology stocks are driving market growth today with major indices up 2%.',
          content: 'Market update content...',
          url: '#',
          publishedAt: new Date().toISOString(),
          source: { id: 'global-pulse', name: 'Global Pulse' },
          author: 'Aggregator',
          category: 'business',
          urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800'
        },
        {
          id: 'fallback-2',
          title: 'AI Breakthrough: New Model Achieves Human-Level Performance',
          description: 'Researchers announce major advancement in artificial intelligence capabilities.',
          content: 'AI news content...',
          url: '#',
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          source: { id: 'global-pulse', name: 'Global Pulse' },
          author: 'Aggregator',
          category: 'technology',
          urlToImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'
        }
      ])
    } finally {
      setLoading(false)
    }
  }, [category, query])

  // Initial fetch
  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval <= 0) return

    const interval = setInterval(() => {
      fetchNews(true) // Force refresh on interval
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [fetchNews, refreshInterval])

  const refresh = () => fetchNews(true)

  return { articles, loading, error, refresh, lastUpdated }
}
