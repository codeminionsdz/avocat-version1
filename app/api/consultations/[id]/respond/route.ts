import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// PUT /api/consultations/[id]/respond - Lawyer responds to consultation request
export async function PUT(
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
    const { action, confirmed_time, lawyer_notes } = body

    // Validate action
    if (!['accept', 'decline', 'reschedule'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: accept, decline, or reschedule' },
        { status: 400 }
      )
    }

    // Get consultation and verify lawyer ownership
    const { data: consultation, error: fetchError } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !consultation) {
      return NextResponse.json(
        { error: 'Consultation not found' },
        { status: 404 }
      )
    }

    if (consultation.lawyer_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You are not the assigned lawyer' },
        { status: 403 }
      )
    }

    // Build update object based on action
    const updates: any = {
      lawyer_notes: lawyer_notes || null
    }

    switch (action) {
      case 'accept':
        updates.status = 'accepted'
        updates.confirmed_time = confirmed_time || consultation.requested_time
        break
      
      case 'decline':
        updates.status = 'declined'
        break
      
      case 'reschedule':
        if (!confirmed_time) {
          return NextResponse.json(
            { error: 'confirmed_time is required for rescheduling' },
            { status: 400 }
          )
        }
        updates.status = 'rescheduled'
        updates.confirmed_time = confirmed_time
        break
    }

    // Update consultation
    const { data: updated, error: updateError } = await supabase
      .from('consultations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error responding to consultation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
