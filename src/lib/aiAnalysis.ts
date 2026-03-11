import { NewsArticle } from '@/types/news'

export type Sentiment = 'positive' | 'negative' | 'neutral'
export type Mood = 'happy' | 'sad' | 'angry' | 'fearful' | 'neutral' | 'exciting'

interface AnalysisResult {
  summary: string
  sentiment: Sentiment
  mood: Mood
  confidence: number
  readTime: number
  keywords: string[]
}

// Sentiment keywords for analysis
const POSITIVE_WORDS = ['success', 'win', 'achieve', 'breakthrough', 'improve', 'growth', 'positive', 'celebrate', 'victory', 'progress', 'innovation', 'advance', 'benefit', 'gain', 'rise', 'boost', 'recover', 'milestone']
const NEGATIVE_WORDS = ['fail', 'loss', 'crash', 'crisis', 'decline', 'fall', 'negative', 'disaster', 'threat', 'danger', 'war', 'conflict', 'attack', 'death', 'injury', 'collapse', 'recession', 'pandemic']
const NEUTRAL_WORDS = ['announce', 'report', 'update', 'release', 'statement', 'reveal', 'plan', 'consider', 'discuss', 'review']

export function analyzeArticle(article: NewsArticle): AnalysisResult {
  const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase()
  
  // Generate smart summary (simulate AI summary)
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
  
  // Calculate confidence (simulated)
  const confidence = 0.75 + Math.random() * 0.2
  
  return {
    summary,
    sentiment,
    mood,
    confidence,
    readTime,
    keywords
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
