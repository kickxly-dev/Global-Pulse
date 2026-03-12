import { useState, useEffect } from 'react'
import { NewsArticle } from '@/types/news'

export interface ReadingStats {
  totalArticlesRead: number
  totalReadingTime: number // in minutes
  categoriesViewed: Record<string, number>
  sourcesViewed: Record<string, number>
  countriesExplored: Record<string, number>
  averageReadingTime: number
  mostReadCategory: string
  mostReadSource: string
  streakDays: number
  lastReadDate: string | null
}

export interface DailyStats {
  date: string
  articlesRead: number
  readingTime: number
  categories: string[]
}

const STORAGE_KEY = 'readingAnalytics'

const DEFAULT_STATS: ReadingStats = {
  totalArticlesRead: 0,
  totalReadingTime: 0,
  categoriesViewed: {},
  sourcesViewed: {},
  countriesExplored: {},
  averageReadingTime: 0,
  mostReadCategory: '',
  mostReadSource: '',
  streakDays: 0,
  lastReadDate: null,
}

export function useAnalytics() {
  const [stats, setStats] = useState<ReadingStats>(DEFAULT_STATS)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load analytics from localStorage
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setStats(parsed.stats || DEFAULT_STATS)
        setDailyStats(parsed.dailyStats || [])
      } catch (e) {
        console.error('Failed to parse analytics:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  const trackArticleRead = (article: NewsArticle, readTime: number = 2) => {
    const today = new Date().toISOString().split('T')[0]
    
    // Update main stats
    const newStats: ReadingStats = {
      ...stats,
      totalArticlesRead: stats.totalArticlesRead + 1,
      totalReadingTime: stats.totalReadingTime + readTime,
      categoriesViewed: {
        ...stats.categoriesViewed,
        [article.category || 'general']: (stats.categoriesViewed[article.category || 'general'] || 0) + 1,
      },
      sourcesViewed: {
        ...stats.sourcesViewed,
        [article.source.name]: (stats.sourcesViewed[article.source.name] || 0) + 1,
      },
      countriesExplored: {
        ...stats.countriesExplored,
        [article.country || 'us']: (stats.countriesExplored[article.country || 'us'] || 0) + 1,
      },
      averageReadingTime: Math.round((stats.totalReadingTime + readTime) / (stats.totalArticlesRead + 1)),
      lastReadDate: today,
    }

    // Calculate most read category
    const sortedCategories = Object.entries(newStats.categoriesViewed).sort((a, b) => b[1] - a[1])
    if (sortedCategories.length > 0) {
      newStats.mostReadCategory = sortedCategories[0][0]
    }

    // Calculate most read source
    const sortedSources = Object.entries(newStats.sourcesViewed).sort((a, b) => b[1] - a[1])
    if (sortedSources.length > 0) {
      newStats.mostReadSource = sortedSources[0][0]
    }

    // Calculate streak
    if (stats.lastReadDate) {
      const lastDate = new Date(stats.lastReadDate)
      const todayDate = new Date(today)
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        // Same day, streak continues
        newStats.streakDays = stats.streakDays
      } else if (diffDays === 1) {
        // Next day, increment streak
        newStats.streakDays = stats.streakDays + 1
      } else {
        // Streak broken
        newStats.streakDays = 1
      }
    } else {
      newStats.streakDays = 1
    }

    setStats(newStats)

    // Update daily stats
    const todayStats = dailyStats.find(d => d.date === today)
    let newDailyStats: DailyStats[]
    
    if (todayStats) {
      newDailyStats = dailyStats.map(d => 
        d.date === today 
          ? {
              ...d,
              articlesRead: d.articlesRead + 1,
              readingTime: d.readingTime + readTime,
              categories: Array.from(new Set([...d.categories, article.category || 'general'])),
            }
          : d
      )
    } else {
      newDailyStats = [
        ...dailyStats,
        {
          date: today,
          articlesRead: 1,
          readingTime: readTime,
          categories: [article.category || 'general'],
        },
      ].slice(-30) // Keep last 30 days
    }

    setDailyStats(newDailyStats)

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      stats: newStats,
      dailyStats: newDailyStats,
    }))
  }

  const resetStats = () => {
    setStats(DEFAULT_STATS)
    setDailyStats([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    stats,
    dailyStats,
    isLoaded,
    trackArticleRead,
    resetStats,
  }
}
