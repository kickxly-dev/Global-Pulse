import { NextRequest, NextResponse } from 'next/server'

// AI Sentiment Analysis using Groq
export async function POST(request: NextRequest) {
  try {
    const { title, description, content } = await request.json()
    
    const text = `${title}\n${description || ''}\n${content || ''}`.slice(0, 1500)
    
    const groqApiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY
    
    if (!groqApiKey || groqApiKey === 'your_groq_api_key_here') {
      // Fallback: Simple sentiment based on keywords
      return NextResponse.json({
        sentiment: analyzeSimpleSentiment(text),
        topics: extractTopics(text),
        confidence: 0.6,
        fallback: true
      })
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `Analyze news articles. Return JSON with:
- sentiment: "positive", "negative", or "neutral"
- score: number from -1 (very negative) to 1 (very positive)
- topics: array of 3-5 main topics
- emotions: array of emotions (urgent, hopeful, concerning, exciting, tragic)
- importance: number 1-10 (impact level)
- bias: "left", "center", "right", or "neutral"`
          },
          {
            role: 'user',
            content: `Analyze: ${text}`
          }
        ],
        max_tokens: 200,
        temperature: 0.2,
        response_format: { type: 'json_object' }
      }),
    })

    const data = await response.json()
    const analysis = JSON.parse(data.choices?.[0]?.message?.content || '{}')

    return NextResponse.json({
      sentiment: analysis.sentiment || 'neutral',
      score: analysis.score || 0,
      topics: analysis.topics || [],
      emotions: analysis.emotions || [],
      importance: analysis.importance || 5,
      bias: analysis.bias || 'neutral',
      confidence: 0.9
    })
  } catch (error: unknown) {
    console.error('Sentiment analysis error:', error)
    return NextResponse.json(
      { sentiment: 'neutral', score: 0, topics: [], confidence: 0 },
      { status: 500 }
    )
  }
}

// Simple keyword-based sentiment (fallback)
function analyzeSimpleSentiment(text: string): string {
  const positive = ['surge', 'rise', 'growth', 'success', 'breakthrough', 'gain', 'win', 'boost', 'recovery', 'hope']
  const negative = ['crisis', 'fall', 'drop', 'loss', 'fail', 'crash', 'threat', 'danger', 'war', 'death', 'decline']
  
  const lower = text.toLowerCase()
  const posCount = positive.filter(w => lower.includes(w)).length
  const negCount = negative.filter(w => lower.includes(w)).length
  
  if (posCount > negCount) return 'positive'
  if (negCount > posCount) return 'negative'
  return 'neutral'
}

function extractTopics(text: string): string[] {
  const topicKeywords: Record<string, string[]> = {
    'Technology': ['tech', 'ai', 'software', 'digital', 'cyber', 'app', 'data'],
    'Politics': ['government', 'election', 'president', 'congress', 'law', 'policy'],
    'Economy': ['market', 'stock', 'economy', 'trade', 'financial', 'bank'],
    'Health': ['health', 'medical', 'hospital', 'disease', 'vaccine', 'doctor'],
    'Science': ['research', 'study', 'scientist', 'discovery', 'experiment'],
    'Environment': ['climate', 'environment', 'pollution', 'energy', 'sustainable'],
    'Sports': ['game', 'team', 'player', 'championship', 'win', 'score'],
    'Entertainment': ['movie', 'music', 'celebrity', 'film', 'show', 'actor']
  }
  
  const lower = text.toLowerCase()
  const found: string[] = []
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(k => lower.includes(k))) {
      found.push(topic)
    }
  }
  
  return found.slice(0, 3)
}

export const dynamic = 'force-dynamic'
