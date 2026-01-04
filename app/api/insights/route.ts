import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/insights - Get all published insights with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    
    const category = searchParams.get('category')
    const lawyerId = searchParams.get('lawyer_id')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('legal_insights_with_stats')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) {
      query = query.eq('category', category)
    }

    if (lawyerId) {
      query = query.eq('lawyer_id', lawyerId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get user's ratings if authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user && data) {
      const insightIds = data.map((insight: any) => insight.id)
      const { data: ratings } = await supabase
        .from('legal_insight_ratings')
        .select('insight_id, rating')
        .eq('user_id', user.id)
        .in('insight_id', insightIds)

      const ratingsMap = new Map(ratings?.map(r => [r.insight_id, r.rating]))
      
      data.forEach((insight: any) => {
        insight.user_rating = ratingsMap.get(insight.id) || null
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/insights - Create a new insight (lawyers only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Please sign in' 
      }, { status: 401 })
    }

    const body = await request.json()
    
    // Explicitly read is_published from body, default to false if not provided
    const { 
      title, 
      content, 
      category, 
      is_published = false 
    } = body

    // Log for debugging
    console.log('Creating insight:', { 
      title: title?.substring(0, 30) + '...', 
      category, 
      is_published,
      contentLength: content?.length 
    })

    // Validate required fields
    if (!title || !content || !category) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          details: {
            title: !title ? 'Title is required' : undefined,
            content: !content ? 'Content is required' : undefined,
            category: !category ? 'Category is required' : undefined
          }
        },
        { status: 400 }
      )
    }

    // Validate title length (minimum 10 characters)
    if (title.length < 10) {
      return NextResponse.json(
        { 
          success: false,
          error: `Title must be at least 10 characters (currently ${title.length})` 
        },
        { status: 400 }
      )
    }

    if (title.length > 200) {
      return NextResponse.json(
        { 
          success: false,
          error: `Title must be at most 200 characters (currently ${title.length})` 
        },
        { status: 400 }
      )
    }

    // Validate content length (minimum 100 characters)
    if (content.length < 100) {
      return NextResponse.json(
        { 
          success: false,
          error: `Content must be at least 100 characters (currently ${content.length})` 
        },
        { status: 400 }
      )
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { 
          success: false,
          error: `Content must be at most 5000 characters (currently ${content.length})` 
        },
        { status: 400 }
      )
    }

    // Verify user is a lawyer
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to verify user profile' 
        },
        { status: 500 }
      )
    }

    if (profile?.role !== 'lawyer') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Only lawyers can create insights',
          details: 'Your account must have lawyer role'
        },
        { status: 403 }
      )
    }

    // Verify lawyer is active
    const { data: lawyerProfile, error: lawyerError } = await supabase
      .from('lawyer_profiles')
      .select('status')
      .eq('id', user.id)
      .single()

    if (lawyerError) {
      console.error('Error fetching lawyer profile:', lawyerError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to verify lawyer status' 
        },
        { status: 500 }
      )
    }

    if (lawyerProfile?.status !== 'active') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Only active lawyers can create insights',
          details: `Current status: ${lawyerProfile?.status || 'unknown'}`
        },
        { status: 403 }
      )
    }

    // If publishing, verify subscription is active
    if (is_published) {
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('status, ends_at')
        .eq('lawyer_id', user.id)
        .eq('status', 'active')
        .single()

      if (subError || !subscription) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Active subscription required to publish insights',
            details: 'You can save as draft without a subscription'
          },
          { status: 403 }
        )
      }

      if (new Date(subscription.ends_at) < new Date()) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Your subscription has expired',
            details: 'Please renew your subscription to publish insights'
          },
          { status: 403 }
        )
      }
    }

    // Insert the insight
    const { data: insight, error: insertError } = await supabase
      .from('legal_insights')
      .insert({
        lawyer_id: user.id,
        title,
        content,
        category,
        is_published
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating insight:', insertError)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to create insight',
        details: insertError.message 
      }, { status: 500 })
    }

    console.log('Insight created successfully:', { 
      id: insight.id, 
      is_published: insight.is_published 
    })

    return NextResponse.json({ 
      success: true,
      insight 
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Unexpected error creating insight:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
