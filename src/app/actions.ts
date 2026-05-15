'use server'

import { createAdminClient } from '@/lib/supabase/server'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function searchParticipant(query: string, eventCode: string, day?: number) {
    const supabase = createAdminClient()

    const safe = query.replace(/[,()%"*\\';.]/g, '').trim()
    if (!safe || !eventCode) {
        return { data: [] }
    }

    const isPhone = /^\d+$/.test(safe.replace(/\D/g, ''))

    let dbQuery = supabase
        .from('participants')
        .select('*, checkins(day, attend_count, status)')
        .ilike('event_code', eventCode)

    if (isPhone) {
        const cleanPhone = safe.replace(/\D/g, '')
        dbQuery = dbQuery.ilike('phone', `%${cleanPhone}%`)
    } else {
        dbQuery = dbQuery.ilike('name', `%${safe}%`)
    }

    const { data, error } = await dbQuery

    if (error) {
        return { error: 'Search failed' }
    }

    return { data }
}

export async function submitCheckIn(participantId: string, ignoredEventCode: string, day: number, attendCount: number) {
    if (!UUID_REGEX.test(participantId)) {
        return { error: 'Invalid participant ID' }
    }
    if (day !== 1 && day !== 2) {
        return { error: 'Invalid day' }
    }
    if (!Number.isInteger(attendCount) || attendCount < 1 || attendCount > 100) {
        return { error: 'Invalid attend count' }
    }

    const supabaseAdmin = createAdminClient()

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
            event_code: participant.event_code,
            day: day,
            participant_id: participantId,
            attend_count: attendCount,
            status: 'CONFIRMED'
        })
        .select()
        .single()

    if (error) {
        if (error.code === '23505') {
            return { error: 'Already checked in for today.' }
        }
        return { error: 'Check-in failed' }
    }

    return { success: true, data }
}

export async function updateCheckIn(participantId: string, day: number, attendCount: number) {
    if (!UUID_REGEX.test(participantId)) {
        return { error: 'Invalid participant ID' }
    }
    if (day !== 1 && day !== 2) {
        return { error: 'Invalid day' }
    }
    if (!Number.isInteger(attendCount) || attendCount < 1 || attendCount > 100) {
        return { error: 'Invalid attend count' }
    }

    const supabaseAdmin = createAdminClient()

    const { data, error } = await supabaseAdmin
        .from('checkins')
        .update({ attend_count: attendCount })
        .eq('participant_id', participantId)
        .eq('day', day)
        .select()
        .single()

    if (error) {
        return { error: 'Update failed' }
    }

    return { success: true, data }
}
