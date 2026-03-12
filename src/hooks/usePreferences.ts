import { useState, useEffect } from 'react'

export interface UserPreferences {
  favoriteCategories: string[]
  defaultCountry: string
  autoRefresh: boolean
  refreshInterval: number
  showBreakingNews: boolean
  showNotifications: boolean
  theme: 'cyber' | 'dark' | 'light'
  readingMode: 'normal' | 'tldr' | 'speedread' | 'zen'
}

const DEFAULT_PREFERENCES: UserPreferences = {
  favoriteCategories: ['general', 'technology'],
  defaultCountry: 'us',
  autoRefresh: true,
  refreshInterval: 60000, // 1 minute
  showBreakingNews: true,
  showNotifications: true,
  theme: 'cyber',
  readingMode: 'normal',
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem('userPreferences')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed })
      } catch (e) {
        console.error('Failed to parse preferences:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates }
    setPreferences(newPreferences)
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences))
  }

  const toggleFavoriteCategory = (category: string) => {
    const favorites = preferences.favoriteCategories
    const newFavorites = favorites.includes(category)
      ? favorites.filter(c => c !== category)
      : [...favorites, category]
    updatePreferences({ favoriteCategories: newFavorites })
  }

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES)
    localStorage.setItem('userPreferences', JSON.stringify(DEFAULT_PREFERENCES))
  }

  return {
    preferences,
    isLoaded,
    updatePreferences,
    toggleFavoriteCategory,
    resetPreferences,
  }
}
