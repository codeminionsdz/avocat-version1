// ============================================
// GET /api/consultations - List User Consultations
// POST /api/consultations - Create Consultation Request
// ============================================

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    // Get user's profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    let query = supabase
      .from('consultations')
      .select(`
        *,
        client:profiles!consultations_client_id_fkey(id, full_name, phone),
        lawyer:profiles!consultations_lawyer_id_fkey(id, full_name, phone)
      `)
      .order('created_at', { ascending: false })

    // Filter based on user role
    if (profile?.role === 'lawyer') {
      query = query.eq('lawyer_id', user.id)
    } else {
      query = query.eq('client_id', user.id)
    }

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching consultations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY: Only clients can request consultations
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'lawyer') {
      return NextResponse.json(
        { error: 'Lawyers cannot request consultations' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      lawyer_id,
      category,
      description,
      consultation_type,
      requested_duration,
      requested_time
    } = body

    // Validate required fields
    if (!lawyer_id || !category || !description || !consultation_type || !requested_duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate description length (minimum 20 characters)
    if (description.trim().length < 20) {
      return NextResponse.json(
        { error: 'Description must be at least 20 characters' },
        { status: 400 }
      )
    }

    // Validate consultation_type
    if (!['chat', 'call', 'in_person'].includes(consultation_type)) {
      return NextResponse.json(
        { error: 'Invalid consultation type. Must be: chat, call, or in_person' },
        { status: 400 }
      )
    }

    // Validate duration
    if (![15, 30].includes(requested_duration)) {
      return NextResponse.json(
        { error: 'Invalid duration. Must be 15 or 30 minutes' },
        { status: 400 }
      )
    }

    // Check if lawyer exists and is available
    const { data: lawyer } = await supabase
      .from('lawyer_profiles')
      .select('id, is_available')
      .eq('id', lawyer_id)
      .single()

    if (!lawyer) {
      return NextResponse.json(
        { error: 'Lawyer not found' },
        { status: 404 }
      )
    }

    // Create consultation request with explicit status = 'pending'
    const { data: consultation, error } = await supabase
      .from('consultations')
      .insert({
        client_id: user.id,
        lawyer_id,
        category,
        description,
        consultation_type,
        requested_duration,
        requested_time: requested_time || null,
        status: 'pending' // Explicitly set status
      })
      .select(`
        id,
        client_id,
        lawyer_id,
        category,
        description,
        consultation_type,
        requested_duration,
        requested_time,
        status,
        created_at
      `)
      .single()

    if (error) {
      console.error('Error creating consultation:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Consultation created successfully:', { id: consultation.id, lawyer_id, client_id: user.id })

    return NextResponse.json({ 
      success: true,
      consultation 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating consultation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
