/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient } from '@/lib/supabase/server'

// Whitelist of fields that can be updated via the UI
const ALLOWED_FIELDS = [
    'bds_invited',
    'bds_status',
    'close_by',
    'package',
    'payment_status',
    'close_day',
    'pic',
]

export async function updateParticipant(id: string, field: string, value: string) {
    // Validate field is in whitelist
    if (!ALLOWED_FIELDS.includes(field)) {
        return { success: false, error: `Field '${field}' is not allowed to be updated` }
    }

    try {
        const supabase = await createClient()

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
