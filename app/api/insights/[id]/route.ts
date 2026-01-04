import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/insights/[id] - Get a specific insight
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data: insight, error } = await supabase
      .from('legal_insights_with_stats')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 })
    }

    // Check if user can view this insight
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!insight.is_published && (!user || user.id !== insight.lawyer_id)) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 })
    }

    // Get user's rating if authenticated
    if (user) {
      const { data: rating } = await supabase
        .from('legal_insight_ratings')
        .select('rating')
        .eq('insight_id', id)
        .eq('user_id', user.id)
        .single()

      insight.user_rating = rating?.rating || null
    }

    return NextResponse.json(insight)
  } catch (error) {
    console.error('Error fetching insight:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/insights/[id] - Update an insight (author only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, content, category, is_published, ai_tags } = body

    // Verify ownership
    const { data: existing } = await supabase
      .from('legal_insights')
      .select('lawyer_id, is_published')
      .eq('id', id)
      .single()

    if (!existing || existing.lawyer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // If publishing (or already published), verify subscription is active
    if (is_published === true || (is_published === undefined && existing.is_published)) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status, ends_at')
        .eq('lawyer_id', user.id)
        .eq('status', 'active')
        .single()

      if (!subscription || new Date(subscription.ends_at) < new Date()) {
        return NextResponse.json(
          { error: 'Active subscription required to publish insights' },
          { status: 403 }
        )
      }
    }

    // Build update object
    const updates: any = {}
    if (title !== undefined) {
      if (title.length < 10 || title.length > 200) {
        return NextResponse.json(
          { error: 'Title must be between 10 and 200 characters' },
          { status: 400 }
        )
      }
      updates.title = title
    }
    if (content !== undefined) {
      if (content.length < 100 || content.length > 5000) {
        return NextResponse.json(
          { error: 'Content must be between 100 and 5000 characters' },
          { status: 400 }
        )
      }
      updates.content = content
    }
    if (category !== undefined) updates.category = category
    if (is_published !== undefined) updates.is_published = is_published
    if (ai_tags !== undefined) updates.ai_tags = ai_tags

    const { data: insight, error } = await supabase
      .from('legal_insights')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating insight:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(insight)
  } catch (error) {
    console.error('Error updating insight:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/insights/[id] - Delete an insight (author only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const { data: existing } = await supabase
      .from('legal_insights')
      .select('lawyer_id')
      .eq('id', id)
      .single()

    if (!existing || existing.lawyer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('legal_insights')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting insight:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
