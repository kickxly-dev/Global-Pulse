export interface NewsArticle {
  id: string
  title: string
  description: string | null
  content: string | null
  url: string
  urlToImage: string | null
  publishedAt: string
  source: {
    id: string | null
    name: string
  }
  author: string | null
  category?: string
  country?: string
  language?: string
  // Database fields
  isBreaking?: boolean
  viewCount?: number
  likeCount?: number
  saveCount?: number
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface NewsApiResponse {
  status: string
  totalResults: number
  articles: NewsArticle[]
}

export interface UserPreferences {
  notificationsEnabled: boolean
  soundEnabled: boolean
  breakingNewsSound: string
  localAlertsSound: string
  personalTopicsSound: string
  preferredTopics: string[]
  preferredCountries: string[]
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
  autoRefresh: boolean
  refreshInterval: number
}

export interface NotificationPayload {
  title: string
  body: string
  icon: string
  badge: string
  url: string
  tag: string
  timestamp: number
  data?: any
}
