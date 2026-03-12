import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Clean up expired entries every minute
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 60000)

export function rateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests, skipSuccessfulRequests = false } = config

  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Get client identifier (IP or user ID)
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userId = request.headers.get('x-user-id') || ''
    const identifier = userId || ip

    const key = `${identifier}:${request.nextUrl.pathname}`
    const now = Date.now()

    // Check if rate limit exceeded
    const current = store[key]
    if (current && current.resetTime > now) {
      if (current.count >= maxRequests) {
        const retryAfter = Math.ceil((current.resetTime - now) / 1000)
        
        return NextResponse.json(
          {
            error: 'Too many requests',
            message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
            retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(retryAfter),
              'X-RateLimit-Limit': String(maxRequests),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil(current.resetTime / 1000)),
            },
          }
        )
      }
      
      // Increment count
      store[key] = {
        count: current.count + 1,
        resetTime: current.resetTime,
      }
    } else {
      // Create new entry
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      }
    }

    // Return null to allow request to proceed
    return null
  }
}

// Pre-configured rate limiters
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
})

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 searches per minute
})

// Client-side rate limit hook
export function useClientRateLimit(maxRequests: number, windowMs: number) {
  const requests: number[] = []

  const checkLimit = (): boolean => {
    const now = Date.now()
    
    // Remove expired requests
    while (requests.length > 0 && requests[0] < now - windowMs) {
      requests.shift()
    }

    if (requests.length >= maxRequests) {
      return false // Rate limit exceeded
    }

    requests.push(now)
    return true // Request allowed
  }

  const getRemaining = (): number => {
    const now = Date.now()
    const activeRequests = requests.filter(r => r > now - windowMs)
    return Math.max(0, maxRequests - activeRequests.length)
  }

  const getResetTime = (): number => {
    if (requests.length === 0) return 0
    return requests[0] + windowMs
  }

  return { checkLimit, getRemaining, getResetTime }
}
