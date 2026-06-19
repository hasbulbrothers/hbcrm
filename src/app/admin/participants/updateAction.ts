/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { requireAdmin } from '@/lib/auth'

const ALLOWED_FIELDS = [
    'bds_invited',
    'bds_status',
    'close_by',
    'package',
    'payment_status',
    'close_day',
    'pic',
]

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function updateParticipant(id: string, field: string, value: string) {
    const { error: authError, supabase } = await requireAdmin()
    if (authError || !supabase) {
        return { success: false, error: 'Unauthorized' }
    }

    if (!UUID_REGEX.test(id)) {
        return { success: false, error: 'Invalid participant ID' }
    }

    if (!ALLOWED_FIELDS.includes(field)) {
        return { success: false, error: `Field '${field}' is not allowed to be updated` }
    }

    const { error } = await supabase
        .from('participants')
        .update({ [field]: value })
        .eq('id', id)

    if (error) {
        return { success: false, error: 'Failed to update participant' }
    }

    return { success: true, error: null }
}
