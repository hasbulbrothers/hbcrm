/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { supabase } from '@/lib/supabaseClient'

export async function updateParticipant(id: string, field: string, value: string) {
    try {
        const { error } = await supabase
            .from('participants')
            .update({ [field]: value })
            .eq('id', id)

        if (error) {
            console.error('Error updating participant:', error)
            return { success: false, error: error.message }
        }

        return { success: true, error: null }
    } catch (err: any) {
        console.error('Unexpected error updating participant:', err)
        return { success: false, error: err.message }
    }
}
