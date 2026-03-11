import { NextRequest, NextResponse } from 'next/server'
import { fetchTopHeadlines, searchNews } from '@/lib/newsApi'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') || 'general'
    const country = searchParams.get('country') || 'us'
    const query = searchParams.get('query')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')

    let data
    if (query) {
      data = await searchNews(query, { pageSize })
    } else {
      data = await fetchTopHeadlines({ category, country, pageSize })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch news' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
