import { useState, useEffect } from 'react'
import { NewsArticle } from '@/types/news'

interface NotificationSettings {
  enabled: boolean
  breakingNews: boolean
  categoryAlerts: string[]
  soundEnabled: boolean
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  breakingNews: true,
  categoryAlerts: ['general', 'technology'],
  soundEnabled: true,
}

export function useBreakingNewsNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [lastNotifiedId, setLastNotifiedId] = useState<string>('')

  useEffect(() => {
    // Load settings
    const saved = localStorage.getItem('notificationSettings')
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) })
      } catch (e) {
        console.error('Failed to load notification settings:', e)
      }
    }

    // Check permission
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    // Load last notified ID
    const lastId = localStorage.getItem('lastNotifiedArticleId')
    if (lastId) {
      setLastNotifiedId(lastId)
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported')
      return false
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    return result === 'granted'
  }

  const updateSettings = (updates: Partial<NotificationSettings>) => {
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings))
  }

  const notifyBreakingNews = (article: NewsArticle) => {
    if (!settings.enabled || !settings.breakingNews) return
    if (permission !== 'granted') return
    if (article.id === lastNotifiedId) return

    // Check if article is breaking (published within last 2 hours)
    const publishedTime = new Date(article.publishedAt).getTime()
    const now = Date.now()
    const isBreaking = (now - publishedTime) < (2 * 60 * 60 * 1000)

    if (!isBreaking) return

    // Create notification
    const notification = new Notification('🚨 Breaking News', {
      body: article.title,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `breaking-${article.id}`,
      requireInteraction: false,
      silent: !settings.soundEnabled,
      data: {
        url: article.url,
        articleId: article.id,
      },
    })

    notification.onclick = () => {
      window.open(article.url, '_blank')
      notification.close()
    }

    // Save last notified
    setLastNotifiedId(article.id)
    localStorage.setItem('lastNotifiedArticleId', article.id)

    return notification
  }

  const notifyCategoryUpdate = (category: string, count: number) => {
    if (!settings.enabled) return
    if (!settings.categoryAlerts.includes(category)) return
    if (permission !== 'granted') return

    const notification = new Notification(`📰 ${category.charAt(0).toUpperCase() + category.slice(1)} News`, {
      body: `${count} new articles in ${category}`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `category-${category}`,
      silent: !settings.soundEnabled,
    })

    return notification
  }

  const checkAndNotify = (articles: NewsArticle[]) => {
    if (!settings.enabled || permission !== 'granted') return

    // Find breaking news (published within last 2 hours)
    const breakingArticles = articles.filter(article => {
      const publishedTime = new Date(article.publishedAt).getTime()
      const now = Date.now()
      return (now - publishedTime) < (2 * 60 * 60 * 1000)
    })

    // Notify for the most recent breaking news
    if (breakingArticles.length > 0) {
      const latest = breakingArticles[0]
      if (latest.id !== lastNotifiedId) {
        notifyBreakingNews(latest)
      }
    }
  }

  return {
    settings,
    permission,
    requestPermission,
    updateSettings,
    notifyBreakingNews,
    notifyCategoryUpdate,
    checkAndNotify,
  }
}
