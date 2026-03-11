import { useState, useEffect, useCallback, useRef } from 'react'
import { NewsArticle } from '@/types/news'
import { toast } from 'sonner'

interface UseNewsDataParams {
  category?: string
  country?: string
  query?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useNewsData({
  category = 'general',
  country = 'us',
  query = '',
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}: UseNewsDataParams) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalResults, setTotalResults] = useState(0)
  const previousArticlesRef = useRef<Set<string>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchNews = useCallback(async (showToast = false) => {
    try {
      setError(null)
      
      const params = new URLSearchParams({
        category,
        country,
        ...(query && { query }),
      })

      const response = await fetch(`/api/news?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Check for new articles
      const newArticleIds = new Set<string>(data.articles.map((a: NewsArticle) => a.id))
      const hasNewArticles = data.articles.some(
        (article: NewsArticle) => !previousArticlesRef.current.has(article.id)
      )

      if (hasNewArticles && previousArticlesRef.current.size > 0 && showToast) {
        const newCount = data.articles.filter(
          (article: NewsArticle) => !previousArticlesRef.current.has(article.id)
        ).length
        
        toast.success(`${newCount} new ${newCount === 1 ? 'story' : 'stories'} available`, {
          duration: 3000,
        })

        // Play notification sound if enabled
        const settings = JSON.parse(localStorage.getItem('userPreferences') || '{}')
        if (settings.soundEnabled) {
          playNotificationSound('breaking')
        }
      }

      previousArticlesRef.current = newArticleIds
      setArticles(data.articles || [])
      setTotalResults(data.totalResults || 0)
      setLoading(false)
    } catch (err: any) {
      console.error('Error fetching news:', err)
      setError(err.message)
      setLoading(false)
      
      if (showToast) {
        toast.error('Failed to fetch latest news')
      }
    }
  }, [category, country, query])

  useEffect(() => {
    fetchNews(false)

    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchNews(true)
      }, refreshInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchNews, autoRefresh, refreshInterval])

  const refresh = useCallback(() => {
    setLoading(true)
    fetchNews(true)
  }, [fetchNews])

  return {
    articles,
    loading,
    error,
    refresh,
    totalResults,
  }
}

function playNotificationSound(type: 'breaking' | 'local' | 'personal') {
  try {
    const settings = JSON.parse(localStorage.getItem('userPreferences') || '{}')
    
    // Check quiet hours
    if (settings.quietHoursEnabled) {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      if (currentTime >= settings.quietHoursStart && currentTime <= settings.quietHoursEnd) {
        return // Don't play sound during quiet hours
      }
    }

    const soundMap = {
      breaking: settings.breakingNewsSound || '/sounds/breaking.mp3',
      local: settings.localAlertsSound || '/sounds/alert.mp3',
      personal: settings.personalTopicsSound || '/sounds/notification.mp3',
    }

    const audio = new Audio(soundMap[type])
    audio.volume = 0.5
    audio.play().catch(err => console.error('Error playing sound:', err))
  } catch (err) {
    console.error('Error in playNotificationSound:', err)
  }
}
