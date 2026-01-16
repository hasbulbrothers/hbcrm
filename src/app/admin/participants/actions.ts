'use server'

import { supabase } from '@/lib/supabaseClient'

export async function getParticipants(page: number = 1, pageSize: number = 50, query: string = '') {
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

    const { data, count, error } = await dbQuery

    if (error) {
        console.error('Error fetching participants:', error)
        return { data: [], count: 0, error: error.message }
    }

    return { data, count, error: null }
}
