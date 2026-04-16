'use server'

import { createAdminClient } from '@/lib/supabase/server'

export async function getParticipantById(id: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('participants')
        .select('*, checkins(day, attend_count, status)')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching participant:', error)
        return { error: error.message }
    }

    return { data }
}
