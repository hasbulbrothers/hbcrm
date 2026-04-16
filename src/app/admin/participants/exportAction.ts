'use server'

import { createClient } from '@/lib/supabase/server'

export async function exportParticipants(
    query: string = '',
    eventCode: string = '',
    startDate: string = '',
    endDate: string = '',
    niche: string = '',
    closeBy: string = '',
    state: string = ''
) {
    const supabase = await createClient()

    let dbQuery = supabase
        .from('participants')
        .select('*, checkins(day, attend_count)')
        .order('created_at', { ascending: false })

    if (query) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
    }

    if (eventCode) {
        dbQuery = dbQuery.eq('event_code', eventCode)
    }

    if (startDate) {
        dbQuery = dbQuery.gte('created_at', startDate)
    }

    if (endDate) {
        const endDatePlusOne = new Date(endDate)
        endDatePlusOne.setDate(endDatePlusOne.getDate() + 1)
        dbQuery = dbQuery.lt('created_at', endDatePlusOne.toISOString())
    }

    if (niche) {
        dbQuery = dbQuery.eq('niche', niche)
    }

    if (closeBy) {
        dbQuery = dbQuery.eq('total_sales', closeBy)
    }

    if (state) {
        dbQuery = dbQuery.eq('state', state)
    }

    const { data, error } = await dbQuery

    if (error) {
        console.error('Error exporting participants:', error)
        return { data: [], error: error.message }
    }

    return { data, error: null }
}
