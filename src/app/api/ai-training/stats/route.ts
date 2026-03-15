import { queryDatabase } from '@/lib/server-db'
import { NextResponse } from 'next/server'

// Get AI training statistics
export async function GET() {
  try {
    // Get total articles
    const articlesCount = await queryDatabase('SELECT COUNT(*) as count FROM news_articles')
    const totalArticles = parseInt(articlesCount[0].count)

    // Get articles by category
    const categoryData = await queryDatabase(`
      SELECT category, COUNT(*) as count 
      FROM news_articles 
      GROUP BY category
    `)
    
    const categories: Record<string, number> = {}
    categoryData.forEach((row: any) => {
      categories[row.category || 'general'] = parseInt(row.count)
    })

    // Get last trained article
    const lastArticle = await queryDatabase(`
      SELECT MAX(updated_at) as last_updated 
      FROM news_articles 
      WHERE embedding IS NOT NULL
    `)

    return NextResponse.json({
      totalArticles,
      categories,
      lastTrained: lastArticle[0]?.last_updated || new Date().toISOString(),
      modelVersion: 'v1.0-news-trained',
      accuracy: 0.85, // Placeholder - would be calculated from actual model performance
      embeddingsGenerated: await queryDatabase('SELECT COUNT(*) as count FROM news_articles WHERE embedding IS NOT NULL').then(r => parseInt(r[0].count))
    })

  } catch (error) {
    console.error('Error fetching training stats:', error)
    return NextResponse.json({
      totalArticles: 0,
      categories: {},
      lastTrained: new Date().toISOString(),
      modelVersion: 'v1.0',
      accuracy: 0
    })
  }
}
