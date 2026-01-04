import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/insights/my - Get all insights for the authenticated lawyer
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const includeUnpublished = searchParams.get('include_unpublished') === 'true'

    let query = supabase
      .from('legal_insights')
      .select('*')
      .eq('lawyer_id', user.id)
      .order('created_at', { ascending: false })

    if (!includeUnpublished) {
      query = query.eq('is_published', true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get ratings for each insight
    if (data && data.length > 0) {
      const insightIds = data.map((insight: any) => insight.id)
      const { data: ratings } = await supabase
        .from('legal_insight_ratings')
        .select('insight_id, rating')
        .in('insight_id', insightIds)

      const statsMap = new Map()
      ratings?.forEach((r: any) => {
        if (!statsMap.has(r.insight_id)) {
          statsMap.set(r.insight_id, { helpful: 0, not_helpful: 0 })
        }
        const stats = statsMap.get(r.insight_id)
        if (r.rating === 'helpful') {
          stats.helpful++
        } else {
          stats.not_helpful++
        }
      })

      data.forEach((insight: any) => {
        const stats = statsMap.get(insight.id) || { helpful: 0, not_helpful: 0 }
        insight.helpful_count = stats.helpful
        insight.not_helpful_count = stats.not_helpful
        insight.total_ratings = stats.helpful + stats.not_helpful
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching lawyer insights:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
