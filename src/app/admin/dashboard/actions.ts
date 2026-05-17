/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { requireAdmin } from '@/lib/auth'

export async function getDashboardData(eventCode: string) {
    const { error: authError, supabase } = await requireAdmin()
    if (authError || !supabase) {
        return { success: false }
    }

    const [participantsRes, checkinsRes, seminarStatsRes] = await Promise.all([
        supabase
            .from('participants')
            .select('ticket_type, niche, state, total_sales, package, payment_status, bds_status')
            .eq('event_code', eventCode),
        supabase
            .from('checkins')
            .select('day, attend_count, participant_id')
            .eq('event_code', eventCode),
        supabase
            .from('seminar_stats')
            .select('paid_participants, sponsor_participants')
            .eq('event_code', eventCode)
            .single(),
    ])

    const participants = participantsRes.data || []
    const checkins = checkinsRes.data || []

    const nicheStats: Record<string, number> = {}
    const stateStats: Record<string, number> = {}
    const ticketTypeStats: Record<string, number> = {}
    const packageStats: Record<string, number> = {}
    const paymentStats: Record<string, number> = {}
    const bdsStats: Record<string, number> = {}

    participants.forEach((p: any) => {
        if (p.niche) nicheStats[p.niche] = (nicheStats[p.niche] || 0) + 1
        if (p.state) stateStats[p.state] = (stateStats[p.state] || 0) + 1
        if (p.ticket_type) ticketTypeStats[p.ticket_type] = (ticketTypeStats[p.ticket_type] || 0) + 1
        if (p.package) packageStats[p.package] = (packageStats[p.package] || 0) + 1
        if (p.payment_status) paymentStats[p.payment_status] = (paymentStats[p.payment_status] || 0) + 1
        if (p.bds_status) bdsStats[p.bds_status] = (bdsStats[p.bds_status] || 0) + 1
    })

    let day1Attendance = 0, day2Attendance = 0
    let day1Paid = 0, day1Sponsor = 0, day2Paid = 0, day2Sponsor = 0
    const attendedIds = new Set<string>()
    const participantTicketMap = new Map<string, string>()

    const participantIds = [...new Set(checkins.map((c: any) => c.participant_id))]
    if (participantIds.length > 0) {
        const { data: checkedIn } = await supabase
            .from('participants')
            .select('id, ticket_type')
            .in('id', participantIds)
        checkedIn?.forEach((p: any) => participantTicketMap.set(p.id, p.ticket_type || ''))
    }

    checkins.forEach((c: any) => {
        const count = c.attend_count || 1
        const ticket = participantTicketMap.get(c.participant_id) || ''
        const isSponsor = ticket.toLowerCase().includes('sponsor')
        attendedIds.add(c.participant_id)

        if (c.day === 1) {
            day1Attendance += count
            if (isSponsor) day1Sponsor += count; else day1Paid += count
        }
        if (c.day === 2) {
            day2Attendance += count
            if (isSponsor) day2Sponsor += count; else day2Paid += count
        }
    })

    const paidCount = seminarStatsRes.data?.paid_participants || 0
    const sponsorCount = seminarStatsRes.data?.sponsor_participants || 0
    const totalRegistered = paidCount + sponsorCount
    const attendanceRate = totalRegistered ? Math.round((attendedIds.size / totalRegistered) * 100) : 0

    return {
        success: true,
        stats: {
            totalParticipants: participants.length,
            day1Attendance, day2Attendance,
            day1Paid, day1Sponsor, day2Paid, day2Sponsor,
            attendedCount: attendedIds.size, attendanceRate,
            byNiche: nicheStats, byState: stateStats,
            byTicketType: ticketTypeStats, byPackage: packageStats,
            byPayment: paymentStats, byBdsStatus: bdsStats,
        },
        paidCount,
        sponsorCount,
    }
}
