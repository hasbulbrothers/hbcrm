'use server'

import { supabase } from '@/lib/supabaseClient'

export async function getDashboardStats() {
    // Total Checkins Day 1
    const { count: day1Count } = await supabase
        .from('checkins')
        .select('*', { count: 'exact', head: true })
        .eq('day', 1)

    // Total Checkins Day 2
    const { count: day2Count } = await supabase
        .from('checkins')
        .select('*', { count: 'exact', head: true })
        .eq('day', 2)

    // By Niche (Join needed or just raw aggregation if possible. Supabase JS doesn't do complex grouping easily without RPC, 
    // but we can fetch participants who checked in and aggregate in JS for MVP if dataset small (< 10k), 
    // or use RPC. For MVP let's fetch checkins with participant data.

    // Fetching all checkins with participant info for aggregation
    const { data: checkins } = await supabase
        .from('checkins')
        .select('participant_id, participants (niche, state, total_sales, ticket_type)')

    const nicheStats: Record<string, number> = {}
    const stateStats: Record<string, number> = {}
    const ticketTypeStats: Record<string, number> = {}
    const salesValueStats: Record<string, number> = {}

    const uniqueParticipants = new Set<string>()
    let totalSales = 0

    checkins?.forEach((c: any) => {
        const p = c.participants
        // Track unique participants for sales calculation (avoid double counting for Day 1 & 2)
        if (c.participant_id && !uniqueParticipants.has(c.participant_id)) {
            uniqueParticipants.add(c.participant_id)
            if (p?.total_sales) {
                // Ensure total_sales is treated as number
                const saleAmount = Number(p.total_sales) || 0
                totalSales += saleAmount

                // Group by Sales Value (e.g. 100, 50, 0)
                const saleKey = `RM ${saleAmount}`
                salesValueStats[saleKey] = (salesValueStats[saleKey] || 0) + 1
            } else {
                // Handle 0 / null sales
                salesValueStats['RM 0'] = (salesValueStats['RM 0'] || 0) + 1
            }

            if (p?.ticket_type) {
                ticketTypeStats[p.ticket_type] = (ticketTypeStats[p.ticket_type] || 0) + 1
            }
        }

        if (p) {
            if (p.niche) nicheStats[p.niche] = (nicheStats[p.niche] || 0) + 1
            if (p.state) stateStats[p.state] = (stateStats[p.state] || 0) + 1
        }
    })

    return {
        day1: day1Count || 0,
        day2: day2Count || 0,
        totalSales: totalSales,
        niche: nicheStats,
        state: stateStats,
        ticketType: ticketTypeStats,
        salesValue: salesValueStats
    }
}
