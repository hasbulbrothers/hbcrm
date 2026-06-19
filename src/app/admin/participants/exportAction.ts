'use server'

import { requireAdmin } from '@/lib/auth'

export async function exportParticipants(
    query: string = '',
    eventCode: string = '',
    startDate: string = '',
    endDate: string = '',
    niche: string = '',
    closeBy: string = '',
    state: string = ''
) {
    const { error: authError, supabase } = await requireAdmin()
    if (authError || !supabase) {
        return { data: [], error: 'Unauthorized' }
    }

    let dbQuery = supabase
        .from('participants')
        .select('*, checkins(day, attend_count)')
        .order('created_at', { ascending: false })
        .limit(10000)

    if (query) {
        const safe = query.replace(/[,()%"*\\]/g, '').trim()
        if (safe) {
            dbQuery = dbQuery.or(`name.ilike.%${safe}%,phone.ilike.%${safe}%`)
        }
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
        return { data: [], error: 'Failed to export participants' }
    }

    return { data, error: null }
}
