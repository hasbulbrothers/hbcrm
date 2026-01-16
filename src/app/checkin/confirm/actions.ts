'use server'

import { supabase } from '@/lib/supabaseClient'

export async function getParticipantById(id: string) {
    const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching participant:', error)
        return { error: error.message }
    }

    return { data }
}
