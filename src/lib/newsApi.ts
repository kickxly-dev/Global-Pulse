import axios from 'axios'
import { NewsArticle, NewsApiResponse } from '@/types/news'

// RSS Feed Sources - Free, no API key required
const RSS_FEEDS: Record<string, string[]> = {
  general: [
    'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://www.theguardian.com/world/rss',
    'https://www.aljazeera.com/xml/rss/all.xml',
    'http://feeds.reuters.com/reuters/topNews',
  ],
  technology: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
    'https://feeds.bbci.co.uk/news/technology/rss.xml',
    'https://www.theguardian.com/technology/rss',
    'https://techcrunch.com/feed/',
  ],
  business: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
    'https://feeds.bbci.co.uk/news/business/rss.xml',
    'http://feeds.reuters.com/reuters/businessNews',
    'https://www.theguardian.com/business/rss',
  ],
  health: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
    'https://feeds.bbci.co.uk/news/health/rss.xml',
    'https://www.theguardian.com/society/health/rss',
  ],
  science: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml',
    'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
    'https://www.theguardian.com/science/rss',
  ],
  sports: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml',
    'https://feeds.bbci.co.uk/sport/rss.xml',
    'https://www.theguardian.com/sport/rss',
  ],
  entertainment: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml',
    'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
    'https://www.theguardian.com/culture/rss',
  ],
}

// Use rss2json.com API to convert RSS to JSON (free, no key needed)
const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url='

// Country coordinates for map markers
const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  us: { lat: 37.0902, lng: -95.7129 },
  gb: { lat: 55.3781, lng: -3.4360 },
  ca: { lat: 56.1304, lng: -106.3468 },
  au: { lat: -25.2744, lng: 133.7751 },
  de: { lat: 51.1657, lng: 10.4515 },
  fr: { lat: 46.2276, lng: 2.2137 },
  it: { lat: 41.8719, lng: 12.5674 },
  jp: { lat: 36.2048, lng: 138.2529 },
  in: { lat: 20.5937, lng: 78.9629 },
  cn: { lat: 35.8617, lng: 104.1954 },
  br: { lat: -14.2350, lng: -51.9253 },
  mx: { lat: 23.6345, lng: -102.5528 },
  ru: { lat: 61.5240, lng: 105.3188 },
  za: { lat: -30.5595, lng: 22.9375 },
  kr: { lat: 35.9078, lng: 127.7669 },
  es: { lat: 40.4637, lng: -3.7492 },
  nl: { lat: 52.1326, lng: 5.2913 },
  se: { lat: 60.1282, lng: 18.6435 },
  no: { lat: 60.4720, lng: 8.4689 },
  ch: { lat: 46.8182, lng: 8.2275 },
  ae: { lat: 23.4241, lng: 53.8478 },
  sg: { lat: 1.3521, lng: 103.8198 },
  nz: { lat: -40.9006, lng: 174.8860 },
  ar: { lat: -38.4161, lng: -63.6167 },
  eg: { lat: 26.8206, lng: 30.8025 },
  ng: { lat: 9.0820, lng: 8.6753 },
  pk: { lat: 30.3753, lng: 69.3451 },
  bd: { lat: 23.6850, lng: 90.3563 },
  id: { lat: -0.7893, lng: 113.9213 },
  tr: { lat: 38.9637, lng: 35.2433 },
  sa: { lat: 23.8859, lng: 45.0792 },
  il: { lat: 31.0461, lng: 34.8516 },
  pl: { lat: 51.9194, lng: 19.1451 },
  ua: { lat: 48.3794, lng: 31.1656 },
  ro: { lat: 45.9432, lng: 24.9668 },
  be: { lat: 50.5039, lng: 4.4699 },
  at: { lat: 47.5162, lng: 14.5501 },
  gr: { lat: 39.0742, lng: 21.8243 },
  pt: { lat: 39.3999, lng: -8.2245 },
  cz: { lat: 49.8175, lng: 15.4730 },
  hu: { lat: 47.1625, lng: 19.5033 },
  ie: { lat: 53.4129, lng: -8.2439 },
  my: { lat: 4.2105, lng: 101.9758 },
  th: { lat: 15.8700, lng: 100.9925 },
  ph: { lat: 12.8797, lng: 121.7740 },
  vn: { lat: 14.0583, lng: 108.2772 },
  cl: { lat: -35.6751, lng: -71.5430 },
  co: { lat: 4.5709, lng: -74.2973 },
  ve: { lat: 6.4238, lng: -66.5897 },
  pe: { lat: -9.1900, lng: -75.0152 },
}

// Country name mapping for GDELT
const COUNTRY_NAMES: Record<string, string> = {
  us: 'United States',
  gb: 'United Kingdom',
  ca: 'Canada',
  au: 'Australia',
  de: 'Germany',
  fr: 'France',
  it: 'Italy',
  jp: 'Japan',
  in: 'India',
  cn: 'China',
  br: 'Brazil',
  mx: 'Mexico',
  ru: 'Russia',
  za: 'South Africa',
  kr: 'South Korea',
  es: 'Spain',
  nl: 'Netherlands',
  se: 'Sweden',
  no: 'Norway',
  ch: 'Switzerland',
}

export async function fetchTopHeadlines(params: {
  category?: string
  country?: string
  query?: string
  pageSize?: number
}): Promise<NewsApiResponse> {
  try {
    const { category = 'general', country = 'us', query, pageSize = 50 } = params

    // Get RSS feeds for the category
    const feeds = RSS_FEEDS[category] || RSS_FEEDS.general
    
    // Fetch from multiple feeds
    const feedPromises = feeds.map(feedUrl => 
      axios.get(`${RSS2JSON_API}${encodeURIComponent(feedUrl)}`, {
        timeout: 10000,
      }).catch(err => {
        console.error(`Failed to fetch ${feedUrl}:`, err.message)
        return null
      })
    )

    const responses = await Promise.all(feedPromises)
    
    // Combine all articles
    let allArticles: any[] = []
    responses.forEach(response => {
      if (response?.data?.items) {
        allArticles = allArticles.concat(response.data.items)
      }
    })

    // Filter by query if provided
    if (query) {
      const queryLower = query.toLowerCase()
      allArticles = allArticles.filter(article => 
        article.title?.toLowerCase().includes(queryLower) ||
        article.description?.toLowerCase().includes(queryLower)
      )
    }

    // Transform to our format
    const articles = allArticles.slice(0, pageSize).map((item: any, index: number) => ({
      id: item.link || `rss-${Date.now()}-${index}`,
      title: item.title || 'Untitled',
      description: item.description || item.content || '',
      url: item.link || '#',
      urlToImage: item.thumbnail || item.enclosure?.link || null,
      publishedAt: item.pubDate || item.pubdate || new Date().toISOString(),
      source: {
        id: item.author || 'rss',
        name: item.author || 'RSS Feed',
      },
      author: item.author || null,
      content: item.content || item.description || '',
      coordinates: COUNTRY_COORDINATES[country] || { lat: 0, lng: 0 },
      country,
      category,
    }))

    return {
      status: 'ok',
      totalResults: articles.length,
      articles,
    }
  } catch (error: any) {
    console.error('Error fetching RSS feeds:', error.message)
    throw new Error('Failed to fetch news from RSS feeds')
  }
}

export async function searchNews(query: string, params?: {
  language?: string
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt'
  pageSize?: number
}): Promise<NewsApiResponse> {
  try {
    const { pageSize = 50 } = params || {}

    // Search across all general feeds
    const feeds = RSS_FEEDS.general
    
    const feedPromises = feeds.map(feedUrl => 
      axios.get(`${RSS2JSON_API}${encodeURIComponent(feedUrl)}`, {
        timeout: 10000,
      }).catch(() => null)
    )

    const responses = await Promise.all(feedPromises)
    
    let allArticles: any[] = []
    responses.forEach(response => {
      if (response?.data?.items) {
        allArticles = allArticles.concat(response.data.items)
      }
    })

    // Filter by query
    const queryLower = query.toLowerCase()
    const filtered = allArticles.filter(article => 
      article.title?.toLowerCase().includes(queryLower) ||
      article.description?.toLowerCase().includes(queryLower)
    )

    const articles = filtered.slice(0, pageSize).map((item: any, index: number) => ({
      id: item.link || `search-${Date.now()}-${index}`,
      title: item.title || 'Untitled',
      description: item.description || item.content || '',
      url: item.link || '#',
      urlToImage: item.thumbnail || null,
      publishedAt: item.pubDate || new Date().toISOString(),
      source: {
        id: item.author || 'rss',
        name: item.author || 'RSS Feed',
      },
      author: item.author || null,
      content: item.content || item.description || '',
      coordinates: { lat: 0, lng: 0 },
    }))

    return {
      status: 'ok',
      totalResults: articles.length,
      articles,
    }
  } catch (error: any) {
    console.error('Error searching RSS feeds:', error.message)
    throw new Error('Failed to search news from RSS feeds')
  }
}

export function isBreakingNews(article: NewsArticle): boolean {
  const publishedTime = new Date(article.publishedAt).getTime()
  const now = Date.now()
  const hoursDiff = (now - publishedTime) / (1000 * 60 * 60)
  
  // Consider news breaking if published within last 2 hours
  return hoursDiff < 2
}

export function getArticleCategory(article: NewsArticle): 'breaking' | 'local' | 'personal' {
  if (isBreakingNews(article)) {
    return 'breaking'
  }
  
  // Check if it's from user's country (would need user preferences)
  if (article.country) {
    return 'local'
  }
  
  return 'personal'
}
