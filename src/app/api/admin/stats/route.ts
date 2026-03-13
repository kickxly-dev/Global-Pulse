import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Get admin stats
export async function GET(request: NextRequest) {
  try {
    // Get total articles
    const totalArticles = await prisma.article.count()
    
    // Get articles by category
    const articlesByCategory = await prisma.article.groupBy({
      by: ['category'],
      _count: { id: true }
    })
    
    // Get total engagement
    const engagement = await prisma.article.aggregate({
      _sum: {
        viewCount: true,
        likeCount: true,
        saveCount: true
      }
    })
    
    // Get breaking news count
    const breakingNews = await prisma.article.count({
      where: { isBreaking: true }
    })
    
    // Get articles from last 24 hours
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentArticles = await prisma.article.count({
      where: { createdAt: { gte: last24h } }
    })
    
    // Get top articles by views
    const topArticles = await prisma.article.findMany({
      orderBy: { viewCount: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        viewCount: true,
        likeCount: true,
        source: true,
        category: true
      }
    })
    
    // Get engagement over time (last 7 days)
    const last7days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const dailyEngagement = await prisma.engagement.groupBy({
      by: ['action'],
      where: { createdAt: { gte: last7days } },
      _count: { id: true }
    })
    
    // Get total bookmarks
    const totalBookmarks = await prisma.bookmark.count()
    
    return NextResponse.json({
      stats: {
        totalArticles,
        totalViews: engagement._sum.viewCount || 0,
        totalLikes: engagement._sum.likeCount || 0,
        totalSaves: engagement._sum.saveCount || 0,
        breakingNews,
        recentArticles,
        totalBookmarks
      },
      articlesByCategory: articlesByCategory.map((c: { category: string; _count: { id: number } }) => ({
        category: c.category,
        count: c._count.id
      })),
      topArticles,
      dailyEngagement: dailyEngagement.map((e: { action: string; _count: { id: number } }) => ({
        action: e.action,
        count: e._count.id
      }))
    })
  } catch (error: unknown) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
