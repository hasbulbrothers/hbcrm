'use server'

import { createAdminClient } from '@/lib/supabase/server'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function getParticipantById(id: string) {
    if (!UUID_REGEX.test(id)) {
        return { error: 'Invalid participant ID' }
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('participants')
        .select('*, checkins(day, attend_count, status)')
        .eq('id', id)
        .single()

    if (error) {
        return { error: 'Participant not found' }
    }

    return { data }
}
