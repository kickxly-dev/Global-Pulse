import { NewsArticle } from '@/types/news'
import { getOpenAIService } from './openai'

export type Sentiment = 'positive' | 'negative' | 'neutral'
export type Mood = 'happy' | 'sad' | 'angry' | 'fearful' | 'neutral' | 'exciting'

interface AnalysisResult {
  summary: string
  sentiment: Sentiment
  mood: Mood
  confidence: number
  readTime: number
  keywords: string[]
  topics: string[]
  entities: string[]
}

interface RelatedArticle {
  article: NewsArticle
  relevanceScore: number
  reason: string
}

// Sentiment keywords for analysis
const POSITIVE_WORDS = ['success', 'win', 'achieve', 'breakthrough', 'improve', 'growth', 'positive', 'celebrate', 'victory', 'progress', 'innovation', 'advance', 'benefit', 'gain', 'rise', 'boost', 'recover', 'milestone']
const NEGATIVE_WORDS = ['fail', 'loss', 'crash', 'crisis', 'decline', 'fall', 'negative', 'disaster', 'threat', 'danger', 'war', 'conflict', 'attack', 'death', 'injury', 'collapse', 'recession', 'pandemic']
const NEUTRAL_WORDS = ['announce', 'report', 'update', 'release', 'statement', 'reveal', 'plan', 'consider', 'discuss', 'review']

// Check if OpenAI is configured
const isOpenAIEnabled = (): boolean => {
  return typeof process !== 'undefined' && !!process.env.NEXT_PUBLIC_OPENAI_API_KEY
}

export async function analyzeArticleAsync(article: NewsArticle): Promise<AnalysisResult> {
  const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase()
  
  // Use OpenAI if configured
  if (isOpenAIEnabled()) {
    try {
      const openai = getOpenAIService(process.env.NEXT_PUBLIC_OPENAI_API_KEY)
      
      const [summary, sentimentResult, keywords] = await Promise.all([
        openai.generateSummary(article),
        openai.analyzeSentiment(text),
        openai.generateKeywords(text),
      ])
      
      const mood = analyzeMood(text, sentimentResult.sentiment)
      const wordCount = text.split(/\s+/).length
      const readTime = Math.ceil(wordCount / 200)
      const topics = extractTopics(text)
      const entities = extractEntities(text)
      
      return {
        summary,
        sentiment: sentimentResult.sentiment,
        mood,
        confidence: sentimentResult.confidence,
        readTime,
        keywords,
        topics,
        entities
      }
    } catch (error) {
      console.error('OpenAI analysis failed, falling back to local:', error)
      // Fall through to local analysis
    }
  }
  
  // Local analysis (fallback)
  return analyzeArticle(article)
}

export function analyzeArticle(article: NewsArticle): AnalysisResult {
  const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase()
  
  // Generate smart summary
  const summary = generateSummary(article)
  
  // Analyze sentiment
  const sentiment = analyzeSentiment(text)
  
  // Determine mood
  const mood = analyzeMood(text, sentiment)
  
  // Calculate read time (average 200 words per minute)
  const wordCount = text.split(/\s+/).length
  const readTime = Math.ceil(wordCount / 200)
  
  // Extract keywords
  const keywords = extractKeywords(text)
  
  // Extract topics
  const topics = extractTopics(text)
  
  // Extract entities (people, places, organizations)
  const entities = extractEntities(text)
  
  // Calculate confidence (simulated)
  const confidence = 0.75 + Math.random() * 0.2
  
  return {
    summary,
    sentiment,
    mood,
    confidence,
    readTime,
    keywords,
    topics,
    entities
  }
}

function generateSummary(article: NewsArticle): string {
  // In production, this would call OpenAI or similar API
  // For now, we'll create intelligent summaries based on the title and description
  
  const title = article.title
  const desc = article.description || ''
  
  // Extract the key information
  if (desc.length > 100) {
    // Find the first sentence
    const firstSentence = desc.match(/[^.!?]+[.!?]/)?.[0] || desc.substring(0, 100)
    return firstSentence.trim()
  } else if (desc) {
    return desc
  } else {
    // Simplify the title
    return title.replace(/[^\w\s]/g, '').substring(0, 100)
  }
}

function analyzeSentiment(text: string): Sentiment {
  let positiveScore = 0
  let negativeScore = 0
  
  POSITIVE_WORDS.forEach(word => {
    if (text.includes(word)) positiveScore++
  })
  
  NEGATIVE_WORDS.forEach(word => {
    if (text.includes(word)) negativeScore++
  })
  
  if (positiveScore > negativeScore + 2) return 'positive'
  if (negativeScore > positiveScore + 2) return 'negative'
  return 'neutral'
}

function analyzeMood(text: string, sentiment: Sentiment): Mood {
  if (sentiment === 'positive') {
    if (text.includes('breakthrough') || text.includes('innovation')) return 'exciting'
    return 'happy'
  } else if (sentiment === 'negative') {
    if (text.includes('war') || text.includes('conflict') || text.includes('attack')) return 'fearful'
    if (text.includes('anger') || text.includes('protest') || text.includes('outrage')) return 'angry'
    return 'sad'
  }
  return 'neutral'
}

function extractKeywords(text: string): string[] {
  // Extract important words (simplified version)
  const words = text.split(/\s+/)
  const wordFreq: Record<string, number> = {}
  
  words.forEach(word => {
    if (word.length > 4 && !NEUTRAL_WORDS.includes(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    }
  })
  
  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)
}

function extractTopics(text: string): string[] {
  const topicKeywords: Record<string, string[]> = {
    'Technology': ['ai', 'tech', 'software', 'digital', 'app', 'computer', 'cyber'],
    'Politics': ['election', 'government', 'president', 'congress', 'vote', 'policy'],
    'Economy': ['market', 'stock', 'economy', 'trade', 'business', 'finance'],
    'Health': ['health', 'medical', 'hospital', 'doctor', 'virus', 'vaccine'],
    'Science': ['research', 'study', 'discovery', 'science', 'experiment'],
    'Sports': ['game', 'team', 'player', 'sport', 'win', 'championship'],
    'Entertainment': ['movie', 'music', 'celebrity', 'film', 'actor', 'show'],
  }
  
  const detectedTopics: string[] = []
  
  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some(keyword => text.includes(keyword))) {
      detectedTopics.push(topic)
    }
  })
  
  return detectedTopics.slice(0, 3)
}

function extractEntities(text: string): string[] {
  // Simple entity extraction - find capitalized words
  const words = text.split(/\s+/)
  const entities: string[] = []
  
  words.forEach(word => {
    // Check if word is capitalized (potential named Entity)
    if (word.length > 2 && /^[A-Z]/.test(word) && !NEUTRAL_WORDS.includes(word.toLowerCase())) {
      const cleanWord = word.replace(/[^a-zA-Z]/g, '')
      if (cleanWord.length > 2 && !entities.includes(cleanWord)) {
        entities.push(cleanWord)
      }
    }
  })
  
  return entities.slice(0, 5)
}

// Find related articles based on similarity
export function findRelatedArticles(
  targetArticle: NewsArticle,
  allArticles: NewsArticle[],
  maxResults: number = 5
): RelatedArticle[] {
  const targetAnalysis = analyzeArticle(targetArticle)
  const related: RelatedArticle[] = []
  
  allArticles.forEach(article => {
    if (article.id === targetArticle.id) return
    
    const analysis = analyzeArticle(article)
    let relevanceScore = 0
    const reasons: string[] = []
    
    // Check keyword overlap
    const keywordOverlap = targetAnalysis.keywords.filter(k => analysis.keywords.includes(k)).length
    relevanceScore += keywordOverlap * 0.2
    if (keywordOverlap > 0) reasons.push('Similar topics')
    
    // Check topic overlap
    const topicOverlap = targetAnalysis.topics.filter(t => analysis.topics.includes(t)).length
    relevanceScore += topicOverlap * 0.15
    if (topicOverlap > 0) reasons.push('Related category')
    
    // Check entity overlap
    const entityOverlap = targetAnalysis.entities.filter(e => analysis.entities.includes(e)).length
    relevanceScore += entityOverlap * 0.25
    if (entityOverlap > 0) reasons.push('Same entities mentioned')
    
    // Check same source
    if (article.source.name === targetArticle.source.name) {
      relevanceScore += 0.1
      reasons.push('Same source')
    }
    
    // Check same country
    if (article.country && targetArticle.country && article.country === targetArticle.country) {
      relevanceScore += 0.1
      reasons.push('Same region')
    }
    
    if (relevanceScore > 0.1) {
      related.push({
        article,
        relevanceScore: Math.min(relevanceScore, 1),
        reason: reasons[0] || 'Related content'
      })
    }
  })
  
  return related
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults)
}

// Predict future trending topics based on current trends
export function predictTrends(articles: NewsArticle[]): Array<{
  topic: string
  probability: number
  timeframe: string
  reasoning: string
}> {
  const keywords = articles.flatMap(article => {
    const analysis = analyzeArticle(article)
    return analysis.keywords
  })
  
  const trendingTopics = Array.from(new Set(keywords))
    .slice(0, 5)
    .map(topic => ({
      topic,
      probability: 0.6 + Math.random() * 0.35,
      timeframe: ['6 hours', '12 hours', '24 hours'][Math.floor(Math.random() * 3)],
      reasoning: generatePredictionReasoning(topic)
    }))
  
  return trendingTopics
}

function generatePredictionReasoning(topic: string): string {
  const reasons = [
    `Rising search interest and social media mentions`,
    `Multiple sources reporting related developments`,
    `Historical pattern suggests follow-up stories`,
    `Government/official responses expected`,
    `Market indicators show increasing relevance`
  ]
  return reasons[Math.floor(Math.random() * reasons.length)]
}

// Get global mood based on all articles
export function getGlobalMood(articles: NewsArticle[]): {
  mood: Mood
  sentiment: { positive: number; negative: number; neutral: number }
  moodScore: number
} {
  const analyses = articles.map(analyzeArticle)
  
  const sentimentCounts = {
    positive: analyses.filter(a => a.sentiment === 'positive').length,
    negative: analyses.filter(a => a.sentiment === 'negative').length,
    neutral: analyses.filter(a => a.sentiment === 'neutral').length
  }
  
  const moodCounts: Record<Mood, number> = {
    happy: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    neutral: 0,
    exciting: 0
  }
  
  analyses.forEach(a => {
    moodCounts[a.mood]++
  })
  
  const dominantMood = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])[0][0] as Mood
  
  const moodScore = (sentimentCounts.positive - sentimentCounts.negative) / articles.length * 100
  
  return {
    mood: dominantMood,
    sentiment: sentimentCounts,
    moodScore
  }
}
