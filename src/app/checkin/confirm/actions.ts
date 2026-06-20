'use server'

import { createClient } from '@/lib/supabase/server'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function getParticipantById(id: string) {
    if (!UUID_REGEX.test(id)) {
        return { error: 'ID peserta tidak sah' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('participants')
        .select('id, name, phone, email, ticket_type, niche, state, total_sales, checkins(day, attend_count, status)')
        .eq('id', id)
        .single()

    if (error) {
        return { error: 'Peserta tidak dijumpai' }
    }

    return { data }
}
