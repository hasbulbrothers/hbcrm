'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function searchParticipant(query: string, eventCode: string, day?: number) {
    if (!rateLimit(`search:${eventCode}`, 30, 60000)) {
        return { error: 'Terlalu banyak carian. Sila tunggu sebentar.' }
    }

    const supabase = await createClient()

    // Keep '.' and '@' so emails stay searchable; still strip ILIKE injection chars.
    const safe = query.replace(/[,()%"*\\';]/g, '').trim()
    if (!safe || !eventCode) {
        return { data: [] }
    }

    // Route to one column: phone (digits only), email (has '@'), otherwise name.
    const isPhone = /^[\d\s()+-]+$/.test(query.trim()) && /\d/.test(query)
    const isEmail = safe.includes('@')

    let dbQuery = supabase
        .from('participants')
        .select('id, name, phone, email, ticket_type, checkins(day, attend_count, status)')
        .ilike('event_code', eventCode)

    if (isPhone) {
        dbQuery = dbQuery.ilike('phone', `%${safe.replace(/\D/g, '')}%`)
    } else if (isEmail) {
        dbQuery = dbQuery.ilike('email', `%${safe}%`)
    } else {
        dbQuery = dbQuery.ilike('name', `%${safe}%`)
    }

    const { data, error } = await dbQuery

    if (error) {
        return { error: 'Carian gagal' }
    }

    return { data }
}

export async function submitCheckIn(participantId: string, ignoredEventCode: string, day: number, attendCount: number) {
    if (!rateLimit(`checkin:${participantId}`, 5, 60000)) {
        return { error: 'Terlalu banyak percubaan. Sila tunggu sebentar.' }
    }

    if (!UUID_REGEX.test(participantId)) {
        return { error: 'ID peserta tidak sah' }
    }
    if (day !== 1 && day !== 2) {
        return { error: 'Hari tidak sah' }
    }
    if (!Number.isInteger(attendCount) || attendCount < 1 || attendCount > 10) {
        return { error: 'Bilangan kehadiran tidak sah (maksimum 10)' }
    }

    const supabase = await createClient()

    const { data: participant, error: pError } = await supabase
        .from('participants')
        .select('event_code')
        .eq('id', participantId)
        .single()

    if (pError || !participant) {
        return { error: 'Peserta tidak dijumpai.' }
    }

    const { error } = await supabase
        .from('checkins')
        .insert({
            event_code: participant.event_code,
            day: day,
            participant_id: participantId,
            attend_count: attendCount,
            status: 'CONFIRMED'
        })

    if (error) {
        if (error.code === '23505') {
            return { error: 'Sudah check-in untuk hari ini.' }
        }
        return { error: 'Check-in gagal' }
    }

    return { success: true }
}

export async function updateCheckIn(participantId: string, day: number, attendCount: number) {
    if (!rateLimit(`update:${participantId}`, 5, 60000)) {
        return { error: 'Terlalu banyak percubaan. Sila tunggu sebentar.' }
    }

    if (!UUID_REGEX.test(participantId)) {
        return { error: 'ID peserta tidak sah' }
    }
    if (day !== 1 && day !== 2) {
        return { error: 'Hari tidak sah' }
    }
    if (!Number.isInteger(attendCount) || attendCount < 1 || attendCount > 10) {
        return { error: 'Bilangan kehadiran tidak sah (maksimum 10)' }
    }

    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin
        .from('checkins')
        .update({ attend_count: attendCount })
        .eq('participant_id', participantId)
        .eq('day', day)

    if (error) {
        return { error: 'Kemaskini gagal' }
    }

    return { success: true }
}
