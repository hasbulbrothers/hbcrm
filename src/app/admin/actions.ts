/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function getDashboardStats() {
    const supabase = await createClient()

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

// Get list of all events/seminars
export async function getSeminars() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('participants')
        .select('event_code')
        .not('event_code', 'is', null)
        .not('event_code', 'eq', '')

    if (error) {
        return { success: false, error: error.message }
    }

    // Get unique event codes, filter out any nulls/empty, and sort
    const uniqueEvents = [...new Set(data?.map(p => p.event_code).filter(Boolean))].sort() as string[]

    return { success: true, events: uniqueEvents }
}

// Get analytics for a specific seminar
export async function getSeminarAnalytics(eventCode: string) {
    const supabase = await createClient()

    // Total participants for this event
    const { count: totalParticipants } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('event_code', eventCode)

    // Get all check-ins with attend_count for day totals
    const { data: allCheckins } = await supabase
        .from('checkins')
        .select('day, attend_count, participant_id')
        .eq('event_code', eventCode)

    // Calculate day totals from attend_count
    let day1Total = 0
    let day2Total = 0
    allCheckins?.forEach((c: { day: number; attend_count: number }) => {
        if (c.day === 1) day1Total += c.attend_count || 1
        if (c.day === 2) day2Total += c.attend_count || 1
    })

    // Get all participants with checkins for this event
    const { data: participants } = await supabase
        .from('participants')
        .select(`
            id,
            name,
            phone,
            ticket_type,
            niche,
            state,
            total_sales,
            package,
            payment_status,
            bds_status,
            checkins (day, attend_count)
        `)
        .eq('event_code', eventCode)

    // Calculate statistics
    const nicheStats: Record<string, number> = {}
    const stateStats: Record<string, number> = {}
    const ticketTypeStats: Record<string, number> = {}
    const packageStats: Record<string, number> = {}
    const paymentStats: Record<string, number> = {}
    const bdsStats: Record<string, number> = {}

    let totalSales = 0
    let attendedCount = 0

    // Attendance breakdown counters (now sum of attend_count)
    let day1Paid = 0
    let day1Sponsor = 0
    let day2Paid = 0
    let day2Sponsor = 0

    participants?.forEach((p: any) => {
        const hasCheckin = p.checkins && p.checkins.length > 0
        const tType = p.ticket_type?.toLowerCase() || ''
        const isSponsor = tType.includes('sponsor')
        const isPaid = !isSponsor // All non-sponsor tickets are considered "paid"

        // Check for specific day checkins and sum attend_count
        const day1Checkin = p.checkins?.find((c: { day: number; attend_count: number }) => c.day === 1)
        const day2Checkin = p.checkins?.find((c: { day: number; attend_count: number }) => c.day === 2)

        if (day1Checkin) {
            const count = day1Checkin.attend_count || 1
            if (isSponsor) day1Sponsor += count
            else if (isPaid) day1Paid += count
        }

        if (day2Checkin) {
            const count = day2Checkin.attend_count || 1
            if (isSponsor) day2Sponsor += count
            else if (isPaid) day2Paid += count
        }

        if (hasCheckin) {
            attendedCount++
            if (p.total_sales) {
                totalSales += Number(p.total_sales) || 0
            }
        }

        // Aggregate by categories
        if (p.niche) nicheStats[p.niche] = (nicheStats[p.niche] || 0) + 1
        if (p.state) stateStats[p.state] = (stateStats[p.state] || 0) + 1
        if (p.ticket_type) ticketTypeStats[p.ticket_type] = (ticketTypeStats[p.ticket_type] || 0) + 1
        if (p.package) packageStats[p.package] = (packageStats[p.package] || 0) + 1
        if (p.payment_status) paymentStats[p.payment_status] = (paymentStats[p.payment_status] || 0) + 1
        if (p.bds_status) bdsStats[p.bds_status] = (bdsStats[p.bds_status] || 0) + 1
    })

    // Calculate attendance rate
    const attendanceRate = totalParticipants ? Math.round((attendedCount / totalParticipants) * 100) : 0

    return {
        success: true,
        stats: {
            totalParticipants: totalParticipants || 0,
            day1Attendance: day1Total, // Now uses sum of attend_count
            day2Attendance: day2Total, // Now uses sum of attend_count
            attendedCount,
            attendanceRate,
            totalSales,
            byNiche: nicheStats,
            byState: stateStats,
            byTicketType: ticketTypeStats,
            byPackage: packageStats,
            byPayment: paymentStats,
            byBdsStatus: bdsStats,
            day1Paid,
            day1Sponsor,
            day2Paid,
            day2Sponsor
        }
    }
}

// Get Day 1 attendance breakdown by sales, niche, state
export async function getDay1AttendanceBreakdown(eventCode: string) {
    const supabase = await createClient()

    // Get Day 1 check-ins with participant data
    const { data: checkins } = await supabase
        .from('checkins')
        .select(`
            attend_count,
            participant_id,
            participants (
                total_sales,
                niche,
                state
            )
        `)
        .eq('event_code', eventCode)
        .eq('day', 1)

    // Aggregate by categories
    const bySales: Record<string, number> = {}
    const byNiche: Record<string, number> = {}
    const byState: Record<string, number> = {}
    let totalAttendance = 0

    checkins?.forEach((c: any) => {
        const attendCount = c.attend_count || 1
        totalAttendance += attendCount
        const p = c.participants

        if (p) {
            // By Sales (total_sales)
            const salesKey = p.total_sales || 'Unknown'
            bySales[salesKey] = (bySales[salesKey] || 0) + attendCount

            // By Niche
            if (p.niche) {
                byNiche[p.niche] = (byNiche[p.niche] || 0) + attendCount
            }

            // By State
            if (p.state) {
                byState[p.state] = (byState[p.state] || 0) + attendCount
            }
        }
    })

    return {
        success: true,
        data: {
            bySales,
            byNiche,
            byState,
            totalAttendance
        }
    }
}

// Get participant counts for a specific seminar
export async function getSeminarStats(eventCode: string) {
    const supabase = await createClient()

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

// Update participant counts for a specific seminar
export async function updateSeminarStats(eventCode: string, paidCount: number, sponsorCount: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('seminar_stats')
        .upsert({
            event_code: eventCode,
            paid_participants: paidCount,
            sponsor_participants: sponsorCount,
            total_participants: paidCount + sponsorCount
        }, { onConflict: 'event_code' })

    if (error) {
        console.error('Error updating stats:', error)
        return { success: false, error: 'Failed to update stats' }
    }

    return { success: true }
}

// ============ USER MANAGEMENT (uses user_roles table) ============

// Get all users with their roles
export async function getUsers() {
    const supabaseAdmin = createAdminClient()

    const { data, error } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching users:', error)
        return { success: false, users: [] }
    }

    return { success: true, users: data }
}

// Get current user's role
export async function getCurrentUserPermissions() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, permissions: null }
    }

    const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (error) {
        return { success: false, permissions: null }
    }

    return { success: true, permissions: data }
}

// Update user role
export async function updateUserPermissions(userId: string, permissions: {
    role?: string
}) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('user_roles')
        .update({ role: permissions.role })
        .eq('user_id', userId)

    if (error) {
        console.error('Error updating role:', error)
        return { success: false, error: 'Failed to update role' }
    }

    return { success: true }
}

// Create new user (requires admin service role key)
export async function createUser(email: string, password: string, permissions: {
    role: string
}) {
    const supabaseAdmin = createAdminClient()

    // Create auth user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    })

    if (error) {
        console.error('Error creating user:', error)
        return { success: false, error: error.message }
    }

    // Create user_roles entry
    if (data.user) {
        const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .insert({
                user_id: data.user.id,
                email: data.user.email,
                role: permissions.role || 'general'
            })

        if (roleError) {
            console.error('Error creating user role:', roleError)
        }
    }

    return { success: true, user: data.user }
}

// Delete user
export async function deleteUser(userId: string) {
    const supabaseAdmin = createAdminClient()

    // Delete from user_roles first
    await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

    // Delete auth user
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
        console.error('Error deleting user:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}
