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

// Check if article is breaking news (published within last 2 hours)
function isBreakingNews(article: NewsArticle): boolean {
  const publishedTime = new Date(article.publishedAt).getTime()
  const now = Date.now()
  const hoursDiff = (now - publishedTime) / (1000 * 60 * 60)
  return hoursDiff < 2
}

// Send browser notification for breaking news
function sendBreakingNewsNotification(article: NewsArticle) {
  if (typeof window === 'undefined') return
  
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('🔴 BREAKING NEWS', {
      body: article.title,
      icon: article.urlToImage || '/icon.png',
      tag: article.id,
      requireInteraction: true,
    })
  }
}

export function useNewsData({
  category = 'general',
  country = 'us',
  query = '',
  autoRefresh = true,
  refreshInterval = 15000, // 15 seconds for real-time
}: UseNewsDataParams) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalResults, setTotalResults] = useState(0)
  const [breakingNews, setBreakingNews] = useState<NewsArticle[]>([])
  const [newArticlesCount, setNewArticlesCount] = useState(0)
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const previousArticlesRef = useRef<Set<string>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchNews = useCallback(async (showToast = false, isAuto = false, forceRefresh = false) => {
    try {
      setError(null)
      
      if (isAuto) {
        setIsAutoRefreshing(true)
      }
      
      // Use database API for caching
      const params = new URLSearchParams({
        category,
        country,
        ...(query && { query }),
        ...(forceRefresh && { refresh: 'true' })
      })

      const response = await fetch(`/api/articles?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      const fetchedArticles = data.articles || []
      
      // Check for new articles
      const newArticleIds = new Set<string>(fetchedArticles.map((a: NewsArticle) => a.url))
      const newArticles = fetchedArticles.filter(
        (article: NewsArticle) => !previousArticlesRef.current.has(article.url)
      )
      const hasNewArticles = newArticles.length > 0

      // Detect breaking news
      const breaking = newArticles.filter((a: NewsArticle) => a.isBreaking || isBreakingNews(a))
      if (breaking.length > 0) {
        setBreakingNews(breaking)
        breaking.forEach(sendBreakingNewsNotification)
        
        toast.error(`🔴 ${breaking.length} BREAKING NEWS ALERT${breaking.length > 1 ? 'S' : ''}`, {
          duration: 5000,
          action: {
            label: 'View',
            onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
          },
        })
      }

      if (hasNewArticles && previousArticlesRef.current.size > 0 && showToast) {
        setNewArticlesCount(newArticles.length)
        
        toast.success(`${newArticles.length} new ${newArticles.length === 1 ? 'story' : 'stories'} available`, {
          duration: 3000,
          action: {
            label: 'Refresh',
            onClick: () => window.location.reload(),
          },
        })
      }

      previousArticlesRef.current = newArticleIds
      setArticles(fetchedArticles)
      setTotalResults(data.totalResults || 0)
      setLastRefresh(new Date())
      setLoading(false)
      setIsAutoRefreshing(false)
    } catch (err: any) {
      console.error('Error fetching news:', err)
      setError(err.message)
      setLoading(false)
      setIsAutoRefreshing(false)
      
      if (showToast) {
        toast.error('Failed to fetch latest news')
      }
    }
  }, [category, country, query])

  useEffect(() => {
    fetchNews(false)

    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchNews(true, true, true) // Force refresh from API
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
    fetchNews(true, false, true)
  }, [fetchNews])

  // Track engagement
  const trackEngagement = useCallback(async (articleUrl: string, action: 'view' | 'like' | 'share') => {
    try {
      await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleUrl, action })
      })
    } catch (err) {
      console.error('Failed to track engagement:', err)
    }
  }, [])

  return {
    articles,
    loading,
    error,
    refresh,
    totalResults,
    breakingNews,
    newArticlesCount,
    isBreakingNews,
    isAutoRefreshing,
    lastRefresh,
    trackEngagement,
  }
}

function playNotificationSound(type: 'breaking' | 'local' | 'personal') {
  try {
    const settings = JSON.parse(localStorage.getItem('userPreferences') || '{}')
    
    if (settings.quietHoursEnabled) {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      if (currentTime >= settings.quietHoursStart && currentTime <= settings.quietHoursEnd) {
        return
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
