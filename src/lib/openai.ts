import { NewsArticle } from '@/types/news'

interface AIConfig {
  apiKey?: string
  model?: string
  maxTokens?: number
  provider?: 'openai' | 'groq'
}

const DEFAULT_CONFIG: AIConfig = {
  model: 'llama-3.3-70b-versatile', // Groq's fast Llama model
  maxTokens: 150,
  provider: 'groq',
}

export class AIService {
  private config: AIConfig
  
  // Groq API endpoint (OpenAI-compatible)
  private groqUrl = 'https://api.groq.com/openai/v1/chat/completions'
  private openaiUrl = 'https://api.openai.com/v1/chat/completions'

  constructor(config?: Partial<AIConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  private getApiUrl(): string {
    return this.config.provider === 'groq' ? this.groqUrl : this.openaiUrl
  }

  async generateSummary(article: NewsArticle): Promise<string> {
    if (!this.config.apiKey) {
      return this.generateLocalSummary(article)
    }

    try {
      const response = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a news summarizer. Create concise, informative TLDR summaries in 2-3 sentences. Focus on key facts and impact.',
            },
            {
              role: 'user',
              content: `Summarize this news article:\n\nTitle: ${article.title}\n\nDescription: ${article.description || 'No description'}\n\nContent: ${article.content?.substring(0, 500) || 'No content'}`,
            },
          ],
          max_tokens: this.config.maxTokens,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || this.generateLocalSummary(article)
    } catch (error) {
      console.error('AI summary failed:', error)
      return this.generateLocalSummary(article)
    }
  }

  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral'
    confidence: number
    mood: string
  }> {
    if (!this.config.apiKey) {
      return this.analyzeLocalSentiment(text)
    }

    try {
      const response = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'Analyze the sentiment of news text. Respond with JSON: {"sentiment": "positive/negative/neutral", "confidence": 0-1, "mood": "one word mood"}',
            },
            {
              role: 'user',
              content: text.substring(0, 500),
            },
          ],
          max_tokens: 50,
          temperature: 0.3,
        }),
      })

      const data = await response.json()
      const result = JSON.parse(data.choices[0]?.message?.content || '{}')
      return {
        sentiment: result.sentiment || 'neutral',
        confidence: result.confidence || 0.5,
        mood: result.mood || 'neutral',
      }
    } catch (error) {
      console.error('AI sentiment failed:', error)
      return this.analyzeLocalSentiment(text)
    }
  }

  async generateKeywords(text: string): Promise<string[]> {
    if (!this.config.apiKey) {
      return this.extractLocalKeywords(text)
    }

    try {
      const response = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'Extract 5 key topics/keywords from the text. Respond with JSON array of strings.',
            },
            {
              role: 'user',
              content: text.substring(0, 300),
            },
          ],
          max_tokens: 50,
          temperature: 0.3,
        }),
      })

      const data = await response.json()
      const keywords = JSON.parse(data.choices[0]?.message?.content || '[]')
      return Array.isArray(keywords) ? keywords : this.extractLocalKeywords(text)
    } catch (error) {
      console.error('AI keywords failed:', error)
      return this.extractLocalKeywords(text)
    }
  }

  // Fallback methods (local processing)
  private generateLocalSummary(article: NewsArticle): string {
    const desc = article.description || ''
    if (desc.length > 100) {
      const firstSentence = desc.match(/[^.!?]+[.!?]/)?.[0] || desc.substring(0, 100)
      return firstSentence.trim()
    }
    return desc || article.title.replace(/[^\w\s]/g, '').substring(0, 100)
  }

  private analyzeLocalSentiment(text: string): { sentiment: 'positive' | 'negative' | 'neutral'; confidence: number; mood: string } {
    const positiveWords = ['success', 'win', 'achieve', 'breakthrough', 'improve', 'growth']
    const negativeWords = ['fail', 'loss', 'crisis', 'decline', 'war', 'disaster']
    
    const lower = text.toLowerCase()
    let positiveScore = positiveWords.filter(w => lower.includes(w)).length
    let negativeScore = negativeWords.filter(w => lower.includes(w)).length
    
    if (positiveScore > negativeScore + 2) {
      return { sentiment: 'positive', confidence: 0.75, mood: 'happy' }
    }
    if (negativeScore > positiveScore + 2) {
      return { sentiment: 'negative', confidence: 0.75, mood: 'sad' }
    }
    return { sentiment: 'neutral', confidence: 0.6, mood: 'neutral' }
  }

  private extractLocalKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/)
    const wordFreq: Record<string, number> = {}
    
    words.forEach(word => {
      if (word.length > 4) {
        wordFreq[word] = (wordFreq[word] || 0) + 1
      }
    })
    
    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word)
  }
}

// Singleton instance
let aiService: AIService | null = null

export function getAIService(apiKey?: string, provider?: 'openai' | 'groq'): AIService {
  if (!aiService) {
    aiService = new AIService({ apiKey, provider })
  } else if (apiKey) {
    aiService = new AIService({ apiKey, provider })
  }
  return aiService
}

// Backward compatibility
export const OpenAIService = AIService
export const getOpenAIService = getAIService
