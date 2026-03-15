import { queryDatabase } from '@/lib/server-db'
import { NextRequest, NextResponse } from 'next/server'

// Lazy load OpenAI client
let openai: any = null
function getOpenAI() {
  if (!openai) {
    const OpenAI = require('openai')
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY,
    })
  }
  return openai
}

// Store news article for AI training
export async function POST(request: NextRequest) {
  try {
    // Ensure table exists first
    await ensureTableExists()
    
    const body = await request.json()
    const { article } = body

    if (!article) {
      return NextResponse.json({ error: 'Article data required' }, { status: 400 })
    }

    // Store article with embeddings for AI training
    const result = await queryDatabase(`
      INSERT INTO news_articles (
        title, 
        description, 
        content, 
        url, 
        image_url, 
        source, 
        category, 
        published_at, 
        sentiment,
        keywords,
        embedding,
        training_data
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (url) DO UPDATE SET
        title = $1,
        description = $2,
        content = $3,
        image_url = $5,
        source = $6,
        category = $7,
        published_at = $8,
        sentiment = $9,
        keywords = $10,
        training_data = $12,
        updated_at = NOW()
      RETURNING *
    `, [
      article.title,
      article.description,
      article.content || article.description,
      article.url,
      article.image_url || article.urlToImage,
      article.source?.name || article.source,
      article.category || 'general',
      article.publishedAt || new Date().toISOString(),
      article.sentiment || 'neutral',
      article.keywords || JSON.stringify(extractKeywords(article)),
      null, // embedding will be generated async
      JSON.stringify(formatForTraining(article))
    ])

    // Generate embedding asynchronously
    generateEmbedding(result[0].id, article).catch(console.error)

    return NextResponse.json({ 
      success: true, 
      article: result[0],
      message: 'Article stored for AI training'
    })

  } catch (error) {
    console.error('Error storing article:', error)
    return NextResponse.json({ error: 'Failed to store article' }, { status: 500 })
  }
}

// Get training dataset
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '100')

  try {
    let query = `
      SELECT 
        id,
        title,
        description,
        content,
        category,
        source,
        sentiment,
        keywords,
        training_data,
        created_at
      FROM news_articles 
      WHERE training_data IS NOT NULL
    `
    
    const params: any[] = []
    
    if (category) {
      query += ` AND category = $${params.length + 1}`
      params.push(category)
    }
    
    query += ` ORDER BY published_at DESC LIMIT $${params.length + 1}`
    params.push(limit)

    const articles = await queryDatabase(query, params)

    return NextResponse.json({
      articles: articles.map(a => ({
        ...a,
        training_data: JSON.parse(a.training_data || '{}'),
        keywords: JSON.parse(a.keywords || '[]')
      })),
      count: articles.length
    })

  } catch (error) {
    console.error('Error fetching training data:', error)
    return NextResponse.json({ error: 'Failed to fetch training data' }, { status: 500 })
  }
}

// Ensure news_articles table exists
async function ensureTableExists() {
  try {
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS news_articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        url TEXT UNIQUE NOT NULL,
        image_url TEXT,
        source TEXT,
        category TEXT,
        published_at TIMESTAMP WITH TIME ZONE,
        sentiment TEXT,
        keywords JSONB,
        embedding JSONB,
        training_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)
  } catch (error) {
    console.error('Error creating table:', error)
    throw error
  }
}
function extractKeywords(article: any): string[] {
  const text = `${article.title} ${article.description}`.toLowerCase()
  const words = text.split(/\s+/).filter(w => w.length > 3)
  const frequency: Record<string, number> = {}
  
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1
  })
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)
}

// Format article for AI training
function formatForTraining(article: any) {
  return {
    instruction: `Analyze this news article about ${article.category || 'general news'}:`,
    input: `Title: ${article.title}\nDescription: ${article.description}\nSource: ${article.source?.name || article.source}`,
    output: `Summary: ${article.description}\nKey Points: ${extractKeyPoints(article)}\nCategory: ${article.category || 'general'}\nSentiment: ${article.sentiment || 'neutral'}`,
    category: article.category,
    source: article.source?.name || article.source,
    timestamp: new Date().toISOString()
  }
}

// Extract key points from article
function extractKeyPoints(article: any): string[] {
  const sentences = (article.content || article.description || '').split(/[.!?]+/)
  return sentences
    .filter((s: string) => s.length > 20 && s.length < 200)
    .slice(0, 3)
    .map((s: string) => s.trim())
}

// Generate embedding for article using OpenAI
async function generateEmbedding(articleId: string, article: any) {
  try {
    const text = `${article.title}\n${article.description}`
    
    const client = getOpenAI()
    const response = await client.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    })
    
    const embedding = response.data[0].embedding
    
    await queryDatabase(
      'UPDATE news_articles SET embedding = $1 WHERE id = $2',
      [JSON.stringify(embedding), articleId]
    )
    
    console.log(`Generated embedding for article: ${article.title}`)
  } catch (error) {
    console.error('Error generating embedding:', error)
  }
}
