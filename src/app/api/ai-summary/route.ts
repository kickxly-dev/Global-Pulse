import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json()
    
    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 })
    }

    // Use Groq API for fast AI summaries
    const groqApiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY
    
    if (!groqApiKey || groqApiKey === 'your_groq_api_key_here') {
      // Fallback: Generate a simple summary
      const sentences = content.split('. ').slice(0, 3).join('. ')
      return NextResponse.json({ 
        summary: `TL;DR: ${sentences}.`,
        fallback: true 
      })
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a concise news summarizer. Create a 2-3 sentence TLDR summary that captures the key points. Be factual and objective.'
          },
          {
            role: 'user',
            content: `Summarize this news article in 2-3 sentences:\n\nTitle: ${title}\n\nContent: ${content.slice(0, 1000)}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    })

    const data = await response.json()
    const summary = data.choices?.[0]?.message?.content || 'Summary unavailable.'

    return NextResponse.json({ summary })
  } catch (error: unknown) {
    console.error('AI Summary Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary', summary: 'AI summary temporarily unavailable.' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
