import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// POST /api/ai/recommend-insights - Get AI recommendations for relevant legal insights
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, category, limit = 5 } = body

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get all published insights (optionally filtered by category)
    let insightsQuery = supabase
      .from('legal_insights_with_stats')
      .select('*')
      .eq('is_published', true)
      .order('helpful_count', { ascending: false })
      .limit(50) // Get top 50 to analyze

    if (category) {
      insightsQuery = insightsQuery.eq('category', category)
    }

    const { data: insights, error } = await insightsQuery

    if (error || !insights || insights.length === 0) {
      return NextResponse.json({ insights: [] })
    }

    // Use AI to find most relevant insights
    const insightsText = insights.map((insight, idx) => 
      `[${idx}] Title: ${insight.title}\nCategory: ${insight.category}\nContent: ${insight.content.substring(0, 300)}...\n`
    ).join('\n')

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.3,
      system: `You are an AI assistant helping users find relevant legal insights. 
Analyze the user's query and recommend the most relevant legal insights from the provided list.
Consider:
- Topic relevance
- Category match
- Helpfulness based on ratings
- Content quality

Return ONLY a JSON array of insight indices (0-based) in order of relevance.
Example: [5, 12, 3, 8, 1]
Return at most ${limit} insights.`,
      messages: [
        {
          role: 'user',
          content: `User Query: ${query}\n\nAvailable Insights:\n${insightsText}\n\nReturn the indices of the ${limit} most relevant insights as a JSON array.`
        }
      ]
    })

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '[]'

    let recommendedIndices: number[] = []
    try {
      recommendedIndices = JSON.parse(responseText)
    } catch {
      // If parsing fails, return empty array
      return NextResponse.json({ insights: [] })
    }

    // Map indices to actual insights
    const recommendedInsights = recommendedIndices
      .filter(idx => idx >= 0 && idx < insights.length)
      .map(idx => insights[idx])

    return NextResponse.json({ insights: recommendedInsights })

  } catch (error) {
    console.error('Error recommending insights:', error)
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}
