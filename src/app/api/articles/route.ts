import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { fetchTopHeadlines } from '@/lib/newsApi'

// GET - Fetch articles from database or API
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') || 'general'
    const country = searchParams.get('country') || 'us'
    const forceRefresh = searchParams.get('refresh') === 'true'

    // Check database for cached articles (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const cachedArticles = await prisma.article.findMany({
      where: {
        category,
        updatedAt: { gte: fiveMinutesAgo }
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
      include: {
        _count: {
          select: { bookmarks: true, engagements: true }
        }
      }
    })

    // If we have cached articles and not forcing refresh, return them
    if (cachedArticles.length > 0 && !forceRefresh) {
      return NextResponse.json({
        articles: cachedArticles.map((a: { id: string; title: string; description: string | null; url: string; urlToImage: string | null; source: string | null; author: string | null; publishedAt: Date; content: string | null; category: string; viewCount: number; likeCount: number; saveCount: number; isBreaking: boolean }) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          url: a.url,
          urlToImage: a.urlToImage,
          source: { name: a.source },
          author: a.author,
          publishedAt: a.publishedAt,
          content: a.content,
          category: a.category,
          viewCount: a.viewCount,
          likeCount: a.likeCount,
          saveCount: a.saveCount,
          isBreaking: a.isBreaking
        })),
        totalResults: cachedArticles.length,
        cached: true
      })
    }

    // Fetch fresh articles from NewsAPI
    const data = await fetchTopHeadlines({ category, country, pageSize: 50 })
    const articles = data.articles || []

    // Store/update articles in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storePromises = articles.map(async (article: any) => {
      const publishedAt = new Date(article.publishedAt)
      const hoursSincePublished = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60)
      const isBreaking = hoursSincePublished < 2

      return prisma.article.upsert({
        where: { url: article.url },
        update: {
          title: article.title,
          description: article.description,
          urlToImage: article.urlToImage,
          source: article.source?.name,
          author: article.author,
          content: article.content,
          category,
          isBreaking,
          updatedAt: new Date()
        },
        create: {
          title: article.title,
          description: article.description,
          url: article.url,
          urlToImage: article.urlToImage,
          source: article.source?.name,
          author: article.author,
          publishedAt,
          content: article.content,
          category,
          isBreaking
        }
      })
    })

    await Promise.all(storePromises)

    // Fetch with engagement counts
    const storedArticles = await prisma.article.findMany({
      where: { category },
      orderBy: { publishedAt: 'desc' },
      take: 50,
      include: {
        _count: {
          select: { bookmarks: true, engagements: true }
        }
      }
    })

    return NextResponse.json({
      articles: storedArticles.map((a: { id: string; title: string; description: string | null; url: string; urlToImage: string | null; source: string | null; author: string | null; publishedAt: Date; content: string | null; category: string; viewCount: number; likeCount: number; saveCount: number; isBreaking: boolean }) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        url: a.url,
        urlToImage: a.urlToImage,
        source: { name: a.source },
        author: a.author,
        publishedAt: a.publishedAt,
        content: a.content,
        category: a.category,
        viewCount: a.viewCount,
        likeCount: a.likeCount,
        saveCount: a.saveCount,
        isBreaking: a.isBreaking
      })),
      totalResults: storedArticles.length,
      cached: false
    })
  } catch (error: unknown) {
    console.error('Database API Error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

// POST - Track engagement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { articleUrl, action, userId } = body

    // Track engagement
    await prisma.engagement.create({
      data: { articleUrl, action, userId }
    })

    // Update article counters
    const updateData: any = {}
    if (action === 'view') updateData.viewCount = { increment: 1 }
    if (action === 'like') updateData.likeCount = { increment: 1 }
    if (action === 'save') updateData.saveCount = { increment: 1 }

    if (Object.keys(updateData).length > 0) {
      await prisma.article.update({
        where: { url: articleUrl },
        data: updateData
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
