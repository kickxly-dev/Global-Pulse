import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Get comments for article
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const articleId = searchParams.get('articleId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 })
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { articleId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
          },
          _count: {
            select: { likes: true, replies: true }
          }
        }
      }),
      prisma.comment.count({ where: { articleId } })
    ])

    return NextResponse.json({
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        user: {
          ...c.user,
          name: c.user.name || 'Anonymous'
        },
        likes: c._count.likes,
        replies: c._count.replies
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error: unknown) {
    console.error('Comments fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// Create comment
export async function POST(request: NextRequest) {
  try {
    const { articleId, userId, content, parentId } = await request.json()

    if (!articleId || !userId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: {
        articleId,
        userId,
        content,
        parentId
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      }
    })

    return NextResponse.json({ success: true, comment })
  } catch (error: unknown) {
    console.error('Comment create error:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}

// Like comment
export async function PUT(request: NextRequest) {
  try {
    const { commentId, userId } = await request.json()

    // Check if already liked
    const existing = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId } }
    })

    if (existing) {
      await prisma.commentLike.delete({ where: { id: existing.id } })
      return NextResponse.json({ liked: false })
    } else {
      await prisma.commentLike.create({
        data: { commentId, userId }
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error: unknown) {
    console.error('Comment like error:', error)
    return NextResponse.json({ error: 'Failed to like comment' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
