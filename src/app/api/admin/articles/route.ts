import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET - List all articles with pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const breaking = searchParams.get('breaking')

    const where: any = {}
    if (category) where.category = category
    if (breaking === 'true') where.isBreaking = true
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { bookmarks: true, engagements: true }
          }
        }
      }),
      prisma.article.count({ where })
    ])

    return NextResponse.json({
      articles: articles.map((a: { id: string; title: string; description: string | null; url: string; urlToImage: string | null; source: string | null; author: string | null; publishedAt: Date; category: string; viewCount: number; likeCount: number; saveCount: number; isBreaking: boolean; _count: { bookmarks: number; engagements: number } }) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        url: a.url,
        urlToImage: a.urlToImage,
        source: a.source,
        author: a.author,
        publishedAt: a.publishedAt,
        category: a.category,
        viewCount: a.viewCount,
        likeCount: a.likeCount,
        saveCount: a.saveCount,
        isBreaking: a.isBreaking,
        bookmarkCount: a._count.bookmarks,
        engagementCount: a._count.engagements
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: unknown) {
    console.error('Admin articles error:', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

// PUT - Update article
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updates } = data

    if (!id) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 })
    }

    const article = await prisma.article.update({
      where: { id },
      data: updates
    })

    return NextResponse.json({ success: true, article })
  } catch (error: unknown) {
    console.error('Update article error:', error)
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

// DELETE - Delete article
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 })
    }

    await prisma.article.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Delete article error:', error)
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
