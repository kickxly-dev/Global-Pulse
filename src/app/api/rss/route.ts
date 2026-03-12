import { NextResponse } from 'next/server'
import { NewsArticle } from '@/types/news'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'general'
  
  // In production, fetch from database
  // For now, return RSS format
  const articles: NewsArticle[] = []
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Global Pulse - ${category}</title>
    <link>https://global-pulse.onrender.com</link>
    <description>Live global news from around the world</description>
    <language>en-us</language>
    <atom:link href="https://global-pulse.onrender.com/api/rss?category=${category}" rel="self" type="application/rss+xml"/>
    ${articles.map(article => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${article.url}</link>
      <description><![CDATA[${article.description}]]></description>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <author>${article.source.name}</author>
      <guid isPermaLink="true">${article.url}</guid>
    </item>
    `).join('')}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
