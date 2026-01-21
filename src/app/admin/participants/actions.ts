'use server'

import { supabase } from '@/lib/supabaseClient'

export async function getParticipants(
    page: number = 1,
    pageSize: number = 50,
    query: string = '',
    eventCode: string = '',
    startDate: string = '',
    endDate: string = '',
    niche: string = '',
    closeBy: string = '',
    state: string = ''
) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let dbQuery = supabase
        .from('participants')
        .select('*, checkins(day, attend_count)', { count: 'exact' })
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

    if (niche) {
        dbQuery = dbQuery.eq('niche', niche)
    }

    if (closeBy) {
        dbQuery = dbQuery.eq('total_sales', closeBy)
    }

    if (state) {
        dbQuery = dbQuery.eq('state', state)
    }

    const { data, count, error } = await dbQuery

    if (error) {
        console.error('Error fetching participants:', error)
        return { data: [], count: 0, error: error.message }
    }

    return { data, count, error: null }
}

// Get unique values for filter dropdowns
export async function getFilterOptions() {
    // Fetch unique niches
    const { data: nicheData } = await supabase
        .from('participants')
        .select('niche')
        .not('niche', 'is', null)
        .not('niche', 'eq', '')

    // Fetch unique total_sales (sales)
    const { data: closeByData } = await supabase
        .from('participants')
        .select('total_sales')
        .not('total_sales', 'is', null)
        .not('total_sales', 'eq', '')

    // Fetch unique states
    const { data: stateData } = await supabase
        .from('participants')
        .select('state')
        .not('state', 'is', null)
        .not('state', 'eq', '')

    // Extract unique values
    const niches = [...new Set(nicheData?.map(d => d.niche).filter(Boolean))] as string[]
    const closeByOptions = [...new Set(closeByData?.map(d => d.total_sales).filter(Boolean))] as string[]
    const states = [...new Set(stateData?.map(d => d.state).filter(Boolean))] as string[]

    return {
        niches: niches.sort(),
        closeByOptions: closeByOptions.sort(),
        states: states.sort()
    }
}
