import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Get personalized feed for user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    if (!userId) {
      // Return trending articles for anonymous users
      const trending = await prisma.article.findMany({
        orderBy: [
          { isBreaking: 'desc' },
          { viewCount: 'desc' },
          { publishedAt: 'desc' }
        ],
        take: limit
      })
      
      return NextResponse.json({ articles: trending, personalized: false })
    }

    // Get user preferences and history
    const user = await prisma.userPreference.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            bookmarks: { 
              take: 50,
              include: { article: { select: { category: true, source: true } } }
            },
            engagements: { 
              take: 100,
              include: { article: { select: { category: true, source: true } } }
            }
          }
        }
      }
    })

    if (!user || !user.user) {
      return NextResponse.json({ articles: [], personalized: false })
    }

    // Build preference weights
    const categoryWeights: Record<string, number> = {}
    const sourceWeights: Record<string, number> = {}
    
    // Weight from bookmarks
    user.user.bookmarks.forEach((b) => {
      if (b.article?.category) {
        categoryWeights[b.article.category] = (categoryWeights[b.article.category] || 0) + 3
      }
      if (b.article?.source) {
        sourceWeights[b.article.source] = (sourceWeights[b.article.source] || 0) + 2
      }
    })
    
    // Weight from engagements
    user.user.engagements.forEach((e) => {
      const weight = e.action === 'like' ? 2 : e.action === 'view' ? 1 : 0.5
      if (e.article?.category) {
        categoryWeights[e.article.category] = (categoryWeights[e.article.category] || 0) + weight
      }
      if (e.article?.source) {
        sourceWeights[e.article.source] = (sourceWeights[e.article.source] || 0) + weight * 0.5
      }
    })

    // Get candidate articles
    const candidates = await prisma.article.findMany({
      where: {
        publishedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      },
      take: 100
    })

    // Score articles
    const scored = candidates.map((article: { id: string; category: string; source: string | null; viewCount: number; likeCount: number; isBreaking: boolean; publishedAt: Date }) => {
      let score = 0
      
      // Category preference
      if (categoryWeights[article.category]) {
        score += categoryWeights[article.category] * 10
      }
      
      // Source preference
      if (article.source && sourceWeights[article.source]) {
        score += sourceWeights[article.source] * 5
      }
      
      // Engagement boost
      score += Math.log10(article.viewCount + 1) * 2
      score += Math.log10(article.likeCount + 1) * 3
      
      // Breaking news boost
      if (article.isBreaking) score += 20
      
      // Freshness boost
      const hoursOld = (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60)
      score += Math.max(0, 10 - hoursOld / 2)
      
      return { ...article, score }
    })

    // Sort by score and return
    const personalized = scored
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .slice(0, limit)

    return NextResponse.json({ 
      articles: personalized, 
      personalized: true,
      preferences: { categories: categoryWeights, sources: sourceWeights }
    })
  } catch (error: unknown) {
    console.error('Personalized feed error:', error)
    return NextResponse.json({ error: 'Failed to generate feed' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
