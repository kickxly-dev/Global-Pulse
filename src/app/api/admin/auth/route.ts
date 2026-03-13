import { NextRequest, NextResponse } from 'next/server'

// Admin credentials (in production, use proper auth with database)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@globalpulse.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Simple session token (in production, use JWT or proper session)
      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64')
      
      return NextResponse.json({ 
        success: true, 
        token,
        user: { email, role: 'admin' }
      })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid credentials' 
    }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Authentication failed' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const [email] = decoded.split(':')
    
    if (email === ADMIN_EMAIL) {
      return NextResponse.json({ authenticated: true, user: { email, role: 'admin' } })
    }
  } catch {
    // Invalid token
  }

  return NextResponse.json({ authenticated: false }, { status: 401 })
}

export const dynamic = 'force-dynamic'
