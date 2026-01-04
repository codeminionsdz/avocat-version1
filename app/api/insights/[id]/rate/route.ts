import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/insights/[id]/rate - Rate an insight
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { rating } = body

    if (!rating || !['helpful', 'not_helpful'].includes(rating)) {
      return NextResponse.json(
        { error: 'Invalid rating. Must be "helpful" or "not_helpful"' },
        { status: 400 }
      )
    }

    // Check if insight exists and is published
    const { data: insight } = await supabase
      .from('legal_insights')
      .select('id, is_published')
      .eq('id', id)
      .single()

    if (!insight || !insight.is_published) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 })
    }

    // Upsert rating (insert or update if exists)
    const { data, error } = await supabase
      .from('legal_insight_ratings')
      .upsert({
        insight_id: id,
        user_id: user.id,
        rating
      }, {
        onConflict: 'insight_id,user_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error rating insight:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error rating insight:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/insights/[id]/rate - Remove rating from an insight
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const { error } = await supabase
      .from('legal_insight_ratings')
      .delete()
      .eq('insight_id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing rating:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
