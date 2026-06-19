'use server'

import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'

const ALLOWED_FIELDS = new Set([
    'event_code', 'name', 'phone', 'email', 'niche',
    'registration_date', 'state', 'ticket_type', 'total_sales',
    'status_hadir', 'package', 'payment_status', 'pic',
    'bds_invited', 'bds_status', 'close_by', 'close_day',
])

// Convert assorted date strings to ISO YYYY-MM-DD (Postgres DATE).
// Handles "DD-MM-YYYY", "DD/MM/YYYY" (with optional trailing time) and ISO; else null.
function toISODate(input: string): string | null {
    const s = input.trim()
    if (!s) return null
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
    const dmy = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
    if (dmy) {
        const [, d, m, y] = dmy
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }
    return null
}

export async function importParticipants(rows: Record<string, unknown>[]) {
    const { error: authError } = await requireAdmin()
    if (authError) {
        return { success: false, error: 'Unauthorized' }
    }

    // Authorized as admin/staff above; use service-role for the privileged insert
    // (mirrors register flow — bypasses RLS which blocks the cookie client).
    const supabase = createAdminClient()

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
        // registration_date is a DATE column; CSV often holds DD-MM-YYYY (+ time).
        // Normalize to ISO YYYY-MM-DD, or null if blank/unparseable, so insert won't fail.
        if (typeof clean.registration_date === 'string') {
            clean.registration_date = toISODate(clean.registration_date)
        }
        return clean
    }).filter(row => row.name || row.phone)

    if (sanitizedRows.length === 0) {
        return { success: false, error: 'No valid rows found' }
    }

    const { error } = await supabase.from('participants').insert(sanitizedRows)

    if (error) {
        console.error('Import insert failed:', error)
        return {
            success: false,
            error: `Import gagal: ${error.message}${error.details ? ` — ${error.details}` : ''}${error.hint ? ` (${error.hint})` : ''}`,
        }
    }

    return { success: true, count: sanitizedRows.length }
}
