'use server'

import { requireAdmin } from '@/lib/auth'

const ALLOWED_FIELDS = new Set([
    'event_code', 'name', 'phone', 'email', 'niche',
    'registration_date', 'state', 'ticket_type', 'total_sales',
    'status_hadir', 'package', 'payment_status', 'pic',
    'bds_invited', 'bds_status', 'close_by', 'close_day',
])

export async function importParticipants(rows: Record<string, unknown>[]) {
    const { error: authError, supabase } = await requireAdmin()
    if (authError || !supabase) {
        return { success: false, error: 'Unauthorized' }
    }

    if (!Array.isArray(rows) || rows.length === 0) {
        return { success: false, error: 'No data to import' }
    }

    if (rows.length > 5000) {
        return { success: false, error: 'Maximum 5000 rows per import' }
    }

    const sanitizedRows = rows.map(row => {
        const clean: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(row)) {
            if (ALLOWED_FIELDS.has(key) && typeof value === 'string') {
                clean[key] = value
            }
        }
        return clean
    }).filter(row => row.name || row.phone)

    if (sanitizedRows.length === 0) {
        return { success: false, error: 'No valid rows found' }
    }

    const { error } = await supabase.from('participants').insert(sanitizedRows)

    if (error) {
        return { success: false, error: 'Failed to import participants' }
    }

    return { success: true, count: sanitizedRows.length }
}
