'use server'

import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with the Service Role Key to bypass RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function searchParticipant(query: string, eventCode: string, day?: number) {
    // Normalize query (remove non-digits for phone, trim for name)
    const isPhone = /^\d+$/.test(query.replace(/\D/g, ''))

    // Check if Service Role Key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn('SUPABASE_SERVICE_ROLE_KEY is missing. Search may fail due to RLS policies.')
    }

    let dbQuery = supabaseAdmin
        .from('participants')
        .select('*, checkins(day, attend_count, status)')
        .ilike('event_code', eventCode)

    if (isPhone) {
        // Basic normalization: remove non-digits
        const cleanPhone = query.replace(/\D/g, '')
        // Try to match partial? Or exact? PRD says "Padanan peserta berjaya".
        // Usually phone is unique enough.
        dbQuery = dbQuery.ilike('phone', `%${cleanPhone}%`)
    } else {
        dbQuery = dbQuery.ilike('name', `%${query}%`)
    }

    const { data, error } = await dbQuery

    if (error) {
        console.error('Search Error:', error)
        return { error: error.message }
    }

    return { data }
}

export async function submitCheckIn(participantId: string, ignoredEventCode: string, day: number, attendCount: number) {
    // 1. Fetch the correct event_code from the participant to ensure consistency
    const { data: participant, error: pError } = await supabaseAdmin
        .from('participants')
        .select('event_code')
        .eq('id', participantId)
        .single()

    if (pError || !participant) {
        return { error: 'Participant not found.' }
    }

    const { data, error } = await supabaseAdmin
        .from('checkins')
        .insert({
            event_code: participant.event_code, // Use the DB source of truth
            day: day,
            participant_id: participantId,
            attend_count: attendCount,
            status: 'CONFIRMED'
        })
        .select()
        .single()

    if (error) {
        // Check for duplicate constraint
        if (error.code === '23505') { // unique violation
            return { error: 'Already checked in for today.' }
        }
        return { error: error.message }
    }

    return { success: true, data }
}

// Update attendance count for existing check-in
export async function updateCheckIn(participantId: string, day: number, attendCount: number) {
    const { data, error } = await supabaseAdmin
        .from('checkins')
        .update({ attend_count: attendCount })
        .eq('participant_id', participantId)
        .eq('day', day)
        .select()
        .single()

    if (error) {
        console.error('Update Error:', error)
        return { error: error.message }
    }

    return { success: true, data }
}
