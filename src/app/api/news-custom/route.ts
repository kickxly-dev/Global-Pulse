import { NextResponse } from 'next/server'
import { NewsArticle } from '@/types/news'

// RSS Feed sources
const RSS_SOURCES = [
  { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml', category: 'general' },
  { name: 'CNN', url: 'http://rss.cnn.com/rss/edition.rss', category: 'general' },
  { name: 'Reuters', url: 'http://feeds.reuters.com/reuters/topNews', category: 'general' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'technology' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'technology' },
  { name: 'NYT Technology', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'technology' },
  { name: 'WSJ Business', url: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml', category: 'business' },
  { name: 'Financial Times', url: 'https://www.ft.com/rss/home', category: 'business' },
  { name: 'ESPN', url: 'https://www.espn.com/espn/rss/news', category: 'sports' },
  { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', category: 'science' },
]

// In-memory cache
let newsCache: NewsArticle[] = []
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Parse RSS feed
async function parseRSSFeed(source: typeof RSS_SOURCES[0]): Promise<NewsArticle[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'GlobalPulse News Aggregator/1.0'
      },
      signal: controller.signal
    })
    clearTimeout(timeout)

    if (!response.ok) return []

    const xmlText = await response.text()
    
    // Parse XML
    const items: NewsArticle[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    const matches = Array.from(xmlText.matchAll(itemRegex))

    for (const match of matches) {
      const itemXml = match[1]
      
      const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)
      const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/)
      const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)
      const imageMatch = itemXml.match(/<enclosure[^>]*url="([^"]*)"|<media:thumbnail[^>]*url="([^"]*)"|<img[^>]*src="([^"]*)"/)

      if (titleMatch && linkMatch) {
        const title = titleMatch[1].replace(/<[^>]*>/g, '').trim()
        const url = linkMatch[1].trim()
        const description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : ''
        const publishedAt = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString()
        const urlToImage = imageMatch ? (imageMatch[1] || imageMatch[2] || imageMatch[3] || null) : null

        items.push({
          id: `rss-${source.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: title.slice(0, 200),
          description: description.slice(0, 500),
          content: description,
          url,
          urlToImage,
          publishedAt,
          source: {
            id: source.name.toLowerCase().replace(/\s+/g, '-'),
            name: source.name
          },
          author: source.name,
          category: source.category
        })
      }
    }

    return items.slice(0, 10) // Limit to 10 per source
  } catch (error) {
    console.error(`Error parsing ${source.name}:`, error)
    return []
  }
}

// Aggregate all news
async function aggregateNews(): Promise<NewsArticle[]> {
  console.log('Aggregating news from RSS feeds...')
  
  const allArticles: NewsArticle[] = []
  
  // Fetch from all sources concurrently
  const promises = RSS_SOURCES.map(async (source) => {
    const articles = await parseRSSFeed(source)
    allArticles.push(...articles)
    console.log(`Fetched ${articles.length} articles from ${source.name}`)
  })
  
  await Promise.allSettled(promises)
  
  // Sort by date (newest first)
  allArticles.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
  
  // Remove duplicates based on title similarity
  const uniqueArticles: NewsArticle[] = []
  const seenTitles = new Set<string>()
  
  for (const article of allArticles) {
    const normalizedTitle = article.title.toLowerCase().slice(0, 50)
    if (!seenTitles.has(normalizedTitle)) {
      seenTitles.add(normalizedTitle)
      uniqueArticles.push(article)
    }
  }
  
  console.log(`Total unique articles: ${uniqueArticles.length}`)
  return uniqueArticles.slice(0, 100) // Return top 100
}

// Generate sample news for fallback
function generateSampleNews(): NewsArticle[] {
  return [
    {
      id: 'custom-1',
      title: 'Global Markets Rally as Inflation Data Shows Improvement',
      description: 'Major stock indices reached new highs today as consumer price index data came in below expectations.',
      content: 'Global markets experienced a significant rally today as new inflation data showed signs of cooling. The S&P 500 rose 2.3%, while tech stocks led gains with the Nasdaq up 3.1%.',
      url: '#',
      publishedAt: new Date().toISOString(),
      source: { id: 'global-pulse', name: 'Global Pulse' },
      author: 'AI Aggregator',
      category: 'business',
      urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800'
    },
    {
      id: 'custom-2', 
      title: 'Breakthrough in Quantum Computing Achieved by Research Team',
      description: 'Scientists have successfully demonstrated a 1000-qubit quantum processor with unprecedented stability.',
      content: 'A major breakthrough in quantum computing was announced today, with researchers demonstrating a stable 1000-qubit processor.',
      url: '#',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      source: { id: 'global-pulse', name: 'Global Pulse' },
      author: 'AI Aggregator',
      category: 'technology',
      urlToImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800'
    },
    {
      id: 'custom-3',
      title: 'Renewable Energy Surpasses Coal in Global Power Generation',
      description: 'For the first time in history, renewable energy sources have overtaken coal in electricity generation.',
      content: 'A historic milestone was reached this quarter as renewable energy sources including solar, wind, and hydroelectric power generated more electricity globally than coal-fired plants.',
      url: '#',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      source: { id: 'global-pulse', name: 'Global Pulse' },
      author: 'AI Aggregator',
      category: 'science',
      urlToImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800'
    }
  ]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const query = searchParams.get('q')
    const forceRefresh = searchParams.get('refresh') === 'true'
    
    // Check cache
    const now = Date.now()
    if (forceRefresh || newsCache.length === 0 || (now - lastFetchTime) > CACHE_DURATION) {
      newsCache = await aggregateNews()
      
      // If RSS fails, use sample data
      if (newsCache.length === 0) {
        newsCache = generateSampleNews()
      }
      
      lastFetchTime = now
    }
    
    let articles = [...newsCache]
    
    // Filter by category
    if (category && category !== 'general') {
      articles = articles.filter(a => 
        a.category?.toLowerCase() === category.toLowerCase()
      )
    }
    
    // Search filter
    if (query) {
      const searchTerm = query.toLowerCase()
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(searchTerm) ||
        a.description?.toLowerCase().includes(searchTerm)
      )
    }
    
    return NextResponse.json({
      status: 'ok',
      totalResults: articles.length,
      articles: articles.slice(0, 20), // Return top 20
      source: 'global-pulse-aggregator',
      lastUpdated: new Date(lastFetchTime).toISOString()
    })
    
  } catch (error) {
    console.error('News API Error:', error)
    
    // Return sample data on error
    return NextResponse.json({
      status: 'ok',
      totalResults: 3,
      articles: generateSampleNews(),
      source: 'global-pulse-fallback',
      lastUpdated: new Date().toISOString()
    })
  }
}

// POST endpoint for force refresh
export async function POST() {
  newsCache = await aggregateNews()
  lastFetchTime = Date.now()
  
  return NextResponse.json({
    status: 'refreshed',
    articles: newsCache.slice(0, 20),
    totalResults: newsCache.length
  })
}
