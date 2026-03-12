import { useState, useEffect } from 'react'
import { NewsArticle } from '@/types/news'

interface OfflineArticle extends NewsArticle {
  savedAt: string
  isOffline: boolean
}

export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(true)
  const [offlineArticles, setOfflineArticles] = useState<OfflineArticle[]>([])
  const [storageSize, setStorageSize] = useState(0)

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    setIsOnline(navigator.onLine)
    
    // Load offline articles
    loadOfflineArticles()
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadOfflineArticles = () => {
    const saved = localStorage.getItem('offlineArticles')
    if (saved) {
      try {
        const articles = JSON.parse(saved)
        setOfflineArticles(articles)
        
        // Calculate storage size
        const size = new Blob([saved]).size
        setStorageSize(size)
      } catch (e) {
        console.error('Failed to load offline articles:', e)
      }
    }
  }

  const saveForOffline = (article: NewsArticle) => {
    const offlineArticle: OfflineArticle = {
      ...article,
      savedAt: new Date().toISOString(),
      isOffline: true,
    }
    
    const existing = offlineArticles.filter(a => a.id !== article.id)
    const updated = [offlineArticle, ...existing].slice(0, 50) // Max 50 articles
    
    localStorage.setItem('offlineArticles', JSON.stringify(updated))
    setOfflineArticles(updated)
    
    // Calculate new storage size
    const size = new Blob([JSON.stringify(updated)]).size
    setStorageSize(size)
  }

  const removeFromOffline = (articleId: string) => {
    const filtered = offlineArticles.filter(a => a.id !== articleId)
    localStorage.setItem('offlineArticles', JSON.stringify(filtered))
    setOfflineArticles(filtered)
    
    const size = new Blob([JSON.stringify(filtered)]).size
    setStorageSize(size)
  }

  const clearOfflineArticles = () => {
    localStorage.removeItem('offlineArticles')
    setOfflineArticles([])
    setStorageSize(0)
  }

  const isArticleOffline = (articleId: string) => {
    return offlineArticles.some(a => a.id === articleId)
  }

  const getStorageSizeFormatted = () => {
    if (storageSize < 1024) return `${storageSize} B`
    if (storageSize < 1024 * 1024) return `${(storageSize / 1024).toFixed(1)} KB`
    return `${(storageSize / (1024 * 1024)).toFixed(1)} MB`
  }

  return {
    isOnline,
    offlineArticles,
    storageSize,
    getStorageSizeFormatted,
    saveForOffline,
    removeFromOffline,
    clearOfflineArticles,
    isArticleOffline,
  }
}
