/* eslint-disable @typescript-eslint/no-explicit-any */
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

// Get list of all events/seminars
export async function getSeminars() {
    const { data, error } = await supabase
        .from('participants')
        .select('event_code')
        .order('event_code')

    if (error) {
        return { success: false, error: error.message }
    }

    // Get unique event codes
    const uniqueEvents = [...new Set(data?.map(p => p.event_code).filter(Boolean))]

    return { success: true, events: uniqueEvents }
}

// Get analytics for a specific seminar
export async function getSeminarAnalytics(eventCode: string) {
    // Total participants for this event
    const { count: totalParticipants } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('event_code', eventCode)

    // Day 1 Check-ins
    const { count: day1Count } = await supabase
        .from('checkins')
        .select('*', { count: 'exact', head: true })
        .eq('event_code', eventCode)
        .eq('day', 1)

    // Day 2 Check-ins
    const { count: day2Count } = await supabase
        .from('checkins')
        .select('*', { count: 'exact', head: true })
        .eq('event_code', eventCode)
        .eq('day', 2)

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
            checkins (day)
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

    // Attendance breakdown counters
    let day1Paid = 0
    let day1Sponsor = 0
    let day2Paid = 0
    let day2Sponsor = 0

    participants?.forEach((p: any) => {
        const hasCheckin = p.checkins && p.checkins.length > 0
        const tType = p.ticket_type?.toLowerCase() || ''
        const isSponsor = tType.includes('sponsor')
        const isPaid = tType.includes('general') || tType.includes('vip')

        // Check for specific day checkins
        const day1Checkin = p.checkins?.some((c: { day: number }) => c.day === 1)
        const day2Checkin = p.checkins?.some((c: { day: number }) => c.day === 2)

        if (day1Checkin) {
            if (isSponsor) day1Sponsor++
            else if (isPaid) day1Paid++
        }

        if (day2Checkin) {
            if (isSponsor) day2Sponsor++
            else if (isPaid) day2Paid++
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
            day1Attendance: day1Count || 0,
            day2Attendance: day2Count || 0,
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

// Get participant counts for a specific seminar
export async function getSeminarStats(eventCode: string) {
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

// ============ USER MANAGEMENT ============

// Get all users with their permissions
export async function getUsers() {
    const { data, error } = await supabase
        .from('user_permissions')
        .select(`
            id,
            user_id,
            role,
            can_view_dashboard,
            can_view_participants,
            can_view_analytics,
            can_import_data,
            can_manage_users,
            created_at
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching users:', error)
        return { success: false, users: [] }
    }

    // Fetch user emails from auth.users
    const { data: authUsers } = await supabase.auth.admin.listUsers()

    const usersWithEmails = data.map(perm => {
        const authUser = authUsers?.users.find(u => u.id === perm.user_id)
        return {
            ...perm,
            email: authUser?.email || 'Unknown'
        }
    })

    return { success: true, users: usersWithEmails }
}

// Get current user's permissions
export async function getCurrentUserPermissions() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, permissions: null }
    }

    const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (error) {
        return { success: false, permissions: null }
    }

    return { success: true, permissions: data }
}

// Update user permissions
export async function updateUserPermissions(userId: string, permissions: {
    role?: string
    can_view_dashboard?: boolean
    can_view_participants?: boolean
    can_view_analytics?: boolean
    can_import_data?: boolean
    can_manage_users?: boolean
}) {
    const { error } = await supabase
        .from('user_permissions')
        .update({
            ...permissions,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

    if (error) {
        console.error('Error updating permissions:', error)
        return { success: false, error: 'Failed to update permissions' }
    }

    return { success: true }
}

// Create new user (requires admin service role key)
export async function createUser(email: string, password: string, permissions: {
    role: string
    can_view_dashboard: boolean
    can_view_participants: boolean
    can_view_analytics: boolean
    can_import_data: boolean
    can_manage_users: boolean
}) {
    // This requires admin privileges
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    })

    if (error) {
        console.error('Error creating user:', error)
        return { success: false, error: error.message }
    }

    // Update permissions (trigger will create default, we override)
    if (data.user) {
        await supabase
            .from('user_permissions')
            .update(permissions)
            .eq('user_id', data.user.id)
    }

    return { success: true, user: data.user }
}

// Delete user
export async function deleteUser(userId: string) {
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
        console.error('Error deleting user:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}
