import { NextRequest, NextResponse } from 'next/server'
import { fetchTopHeadlines } from '@/lib/newsApi'

export async function POST(request: NextRequest) {
  try {
    const { email, preferences } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Get today's top stories for the digest
    const newsResponse = await fetchTopHeadlines({
      category: 'general',
      pageSize: 10,
    })

    if (!newsResponse.articles || newsResponse.articles.length === 0) {
      return NextResponse.json({ error: 'No articles available for digest' }, { status: 404 })
    }

    // Create digest content
    const digest = {
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      articles: newsResponse.articles.slice(0, 5).map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        category: article.category || 'general'
      })),
      preferences: preferences || {
        categories: ['general', 'technology', 'business'],
        frequency: 'daily'
      }
    }

    // Save subscription to localStorage equivalent (in production, use a database)
    const subscriptions = JSON.parse(localStorage.getItem('digestSubscriptions') || '[]')
    if (!subscriptions.find((sub: any) => sub.email === email)) {
      subscriptions.push({
        email,
        preferences,
        subscribedAt: new Date().toISOString(),
        lastSent: new Date().toISOString()
      })
      localStorage.setItem('digestSubscriptions', JSON.stringify(subscriptions))
    }

    // In a real implementation, you would:
    // 1. Use an email service like SendGrid, Mailgun, or AWS SES
    // 2. Create HTML email template
    // 3. Send the digest
    // 4. Schedule daily sending with a cron job

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to Daily News Digest',
      digest: {
        date: digest.date,
        articleCount: digest.articles.length,
        nextDelivery: 'Tomorrow at 8:00 AM'
      }
    })

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get digest statistics
    const subscriptions = JSON.parse(localStorage.getItem('digestSubscriptions') || '[]')
    const subscribers = subscriptions.length
    
    return NextResponse.json({
      subscribers,
      lastDigestSent: new Date().toLocaleDateString(),
      nextDigest: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get digest info' },
      { status: 500 }
    )
  }
}
