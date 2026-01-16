'use server'

import { supabase } from '@/lib/supabaseClient'

export async function searchParticipant(query: string, eventCode: string) {
    // Normalize query (remove non-digits for phone, trim for name)
    const isPhone = /^\d+$/.test(query.replace(/\D/g, ''))

    let dbQuery = supabase
        .from('participants')
        .select('*')
        .eq('event_code', eventCode)

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

export async function submitCheckIn(participantId: string, eventCode: string, day: number, attendCount: number) {
    const { data, error } = await supabase
        .from('checkins')
        .insert({
            event_code: eventCode,
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
