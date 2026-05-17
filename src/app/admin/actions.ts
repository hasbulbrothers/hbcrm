/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { requireAdmin } from '@/lib/auth'

export async function getSeminars() {
    const { error: authError, supabase } = await requireAdmin()
    if (authError || !supabase) {
        return { success: false, error: 'Unauthorized' }
    }

    const { data, error } = await supabase
        .from('seminar_stats')
        .select('event_code')
        .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
        const { data: fallback } = await supabase
            .from('participants')
            .select('event_code')
            .not('event_code', 'is', null)
            .not('event_code', 'eq', '')

        const uniqueEvents = [...new Set(fallback?.map(p => p.event_code).filter(Boolean))].sort() as string[]
        return { success: true, events: uniqueEvents }
    }

    return { success: true, events: data.map(d => d.event_code) }
}

export async function getSeminarStats(eventCode: string) {
    const { error: authError, supabase } = await requireAdmin()
    if (authError || !supabase) {
        return { success: false, paidCount: 0, sponsorCount: 0 }
    }

    const { data, error } = await supabase
        .from('seminar_stats')
        .select('paid_participants, sponsor_participants')
        .eq('event_code', eventCode)
        .single()

    if (error) {
        return { success: false, paidCount: 0, sponsorCount: 0 }
    }

    return {
        success: true,
        paidCount: data?.paid_participants || 0,
        sponsorCount: data?.sponsor_participants || 0
    }
}

export async function updateSeminarStats(eventCode: string, paidCount: number, sponsorCount: number) {
    const { error: authError, supabase } = await requireAdmin()
    if (authError || !supabase) {
        return { success: false, error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('seminar_stats')
        .upsert({
            event_code: eventCode,
            paid_participants: paidCount,
            sponsor_participants: sponsorCount,
            total_participants: paidCount + sponsorCount
        }, { onConflict: 'event_code' })

    if (error) {
        return { success: false, error: 'Failed to update stats' }
    }

    return { success: true }
}

export async function getSeminarAnalytics(eventCode: string) {
    const { getDashboardData } = await import('./dashboard/actions')
    return getDashboardData(eventCode)
}

export async function getDay1AttendanceBreakdown(eventCode: string) {
    const { error: authError, supabase } = await requireAdmin()
    if (authError || !supabase) {
        return { success: false, data: null }
    }

    const { data: checkins } = await supabase
        .from('checkins')
        .select('attend_count, participant_id, participants (total_sales, niche, state)')
        .eq('event_code', eventCode)
        .eq('day', 1)

    const bySales: Record<string, number> = {}
    const byNiche: Record<string, number> = {}
    const byState: Record<string, number> = {}
    let totalAttendance = 0

    checkins?.forEach((c: any) => {
        const attendCount = c.attend_count || 1
        totalAttendance += attendCount
        const p = c.participants
        if (p) {
            const salesKey = p.total_sales || 'Unknown'
            bySales[salesKey] = (bySales[salesKey] || 0) + attendCount
            if (p.niche) byNiche[p.niche] = (byNiche[p.niche] || 0) + attendCount
            if (p.state) byState[p.state] = (byState[p.state] || 0) + attendCount
        }
    })

    return { success: true, data: { bySales, byNiche, byState, totalAttendance } }
}
