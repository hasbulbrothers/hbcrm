'use server'

import { supabase } from '@/lib/supabaseClient'

export async function getParticipants(
    page: number = 1,
    pageSize: number = 50,
    query: string = '',
    eventCode: string = '',
    startDate: string = '',
    endDate: string = ''
) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let dbQuery = supabase
        .from('participants')
        .select('*, checkins(day)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

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
        // Add one day to include the end date fully
        const endDatePlusOne = new Date(endDate)
        endDatePlusOne.setDate(endDatePlusOne.getDate() + 1)
        dbQuery = dbQuery.lt('created_at', endDatePlusOne.toISOString())
    }

    const { data, count, error } = await dbQuery

    if (error) {
        console.error('Error fetching participants:', error)
        return { data: [], count: 0, error: error.message }
    }

    return { data, count, error: null }
}
