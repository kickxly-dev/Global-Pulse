import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { randomBytes } from 'crypto'

// Register new user
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Create user (in production, hash password with bcrypt)
    const userId = randomBytes(16).toString('hex')
    const user = await prisma.user.create({
      data: {
        id: userId,
        email,
        name: name || email.split('@')[0],
        // Store hashed password in production!
        password: Buffer.from(password).toString('base64'),
      }
    })

    // Create default preferences
    await prisma.userPreference.create({
      data: {
        userId: user.id,
        notificationsEnabled: true,
        soundEnabled: true,
        preferredTopics: ['general', 'technology'],
        preferredCountries: ['us'],
      }
    })

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    return NextResponse.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name }
    })
  } catch (error: unknown) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}

// Login
export async function PUT(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = await prisma.user.findUnique({ where: { email } })
    
    if (!user || user.password !== Buffer.from(password).toString('base64')) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    return NextResponse.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name }
    })
  } catch (error: unknown) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

// Get current user
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const decoded = Buffer.from(token, 'base64').toString()
    const [userId] = decoded.split(':')

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
        _count: { select: { bookmarks: true, engagements: true } }
      }
    })

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        preferences: user.preferences,
        stats: {
          bookmarks: user._count.bookmarks,
          engagements: user._count.engagements
        }
      }
    })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}

export const dynamic = 'force-dynamic'
