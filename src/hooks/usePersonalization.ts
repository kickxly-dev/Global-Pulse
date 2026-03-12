'use client'

import { useState, useEffect, useCallback } from 'react'
import { NewsArticle } from '@/types/news'
import { useAnalytics } from './useAnalytics'

interface PersonalizationData {
  favoriteCategories: Record<string, number>
  favoriteSources: Record<string, number>
  readingTimes: number[]
  keywords: Record<string, number>
}

const STORAGE_KEY = 'personalizationData'

export function usePersonalization() {
  const [data, setData] = useState<PersonalizationData>({
    favoriteCategories: {},
    favoriteSources: {},
    readingTimes: [],
    keywords: {},
  })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setData(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load personalization data:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  const saveData = useCallback((newData: PersonalizationData) => {
    setData(newData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
  }, [])

  const trackInteraction = useCallback((article: NewsArticle, action: 'read' | 'bookmark' | 'share') => {
    setData(prev => {
      const newData = { ...prev }
      
      // Track category
      if (article.category) {
        newData.favoriteCategories = {
          ...newData.favoriteCategories,
          [article.category]: (newData.favoriteCategories[article.category] || 0) + 1,
        }
      }
      
      // Track source
      const sourceName = article.source.name
      newData.favoriteSources = {
        ...newData.favoriteSources,
        [sourceName]: (newData.favoriteSources[sourceName] || 0) + 1,
      }
      
      // Track reading time
      if (action === 'read') {
        newData.readingTimes = [...newData.readingTimes.slice(-100), Date.now()]
      }
      
      // Extract keywords from title
      const words = article.title.toLowerCase().split(/\s+/)
      words.forEach(word => {
        if (word.length > 4) {
          newData.keywords = {
            ...newData.keywords,
            [word]: (newData.keywords[word] || 0) + 1,
          }
        }
      })
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
      return newData
    })
  }, [])

  const getRecommendedArticles = useCallback((articles: NewsArticle[], limit: number = 10): NewsArticle[] => {
    if (!isLoaded) return articles.slice(0, limit)

    const scored = articles.map(article => {
      let score = 0
      
      // Category preference
      if (article.category && data.favoriteCategories[article.category]) {
        score += data.favoriteCategories[article.category] * 2
      }
      
      // Source preference
      if (data.favoriteSources[article.source.name]) {
        score += data.favoriteSources[article.source.name]
      }
      
      // Keyword matching
      const titleWords = article.title.toLowerCase().split(/\s+/)
      titleWords.forEach(word => {
        if (data.keywords[word]) {
          score += data.keywords[word] * 0.5
        }
      })
      
      // Recency bonus
      const age = Date.now() - new Date(article.publishedAt).getTime()
      const hoursOld = age / (1000 * 60 * 60)
      if (hoursOld < 6) score += 5
      else if (hoursOld < 24) score += 3
      else if (hoursOld < 48) score += 1
      
      return { article, score }
    })

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.article)
  }, [data, isLoaded])

  const getTopCategories = useCallback((limit: number = 3): string[] => {
    return Object.entries(data.favoriteCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([cat]) => cat)
  }, [data.favoriteCategories])

  const getTopSources = useCallback((limit: number = 3): string[] => {
    return Object.entries(data.favoriteSources)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([source]) => source)
  }, [data.favoriteSources])

  return {
    data,
    isLoaded,
    trackInteraction,
    getRecommendedArticles,
    getTopCategories,
    getTopSources,
  }
}
