import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/insights/debug - Debug endpoint to check insights (development only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get all insights (including unpublished) to debug
    const { data: insights, error } = await supabase
      .from('legal_insights')
      .select('id, title, lawyer_id, is_published, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        details: 'Failed to fetch insights from database'
      }, { status: 500 })
    }

    // Get count of published vs unpublished
    const { count: publishedCount } = await supabase
      .from('legal_insights')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)

    const { count: unpublishedCount } = await supabase
      .from('legal_insights')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', false)

    // Check if the view works
    const { data: viewData, error: viewError } = await supabase
      .from('legal_insights_with_stats')
      .select('*')
      .eq('is_published', true)
      .limit(5)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      insights: insights || [],
      stats: {
        total: (publishedCount || 0) + (unpublishedCount || 0),
        published: publishedCount || 0,
        unpublished: unpublishedCount || 0
      },
      viewTest: {
        success: !viewError,
        error: viewError?.message,
        count: viewData?.length || 0,
        sample: viewData?.[0] || null
      },
      note: 'This endpoint is for debugging only. Remove in production.'
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
