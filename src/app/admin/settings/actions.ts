'use server'

import { createClient } from '@/lib/supabase/server'

// Get all users (admin only)
export async function getUsers() {
    const supabase = await createClient()

    // Check if current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // Get user's role from user_roles table
    const { data: currentUserRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (currentUserRole?.role !== 'admin') {
        return { success: false, error: 'Only admins can view users' }
    }

    // Fetch all users from user_roles with their info
    const { data: users, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true, users }
}

// Update user role (admin only)
export async function updateUserRole(targetUserId: string, newRole: 'admin' | 'staff') {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // Check if current user is admin
    const { data: currentUserRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (currentUserRole?.role !== 'admin') {
        return { success: false, error: 'Only admins can change roles' }
    }

    // Update the target user's role
    const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', targetUserId)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/settings/reset-password`,
    })

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Update password (for logged in user)
export async function updatePassword(newPassword: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
        password: newPassword
    })

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Invite new user (admin only)
export async function inviteUser(email: string, role: 'admin' | 'staff') {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // Check if current user is admin
    const { data: currentUserRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (currentUserRole?.role !== 'admin') {
        return { success: false, error: 'Only admins can invite users' }
    }

    // Send invite email (user will set their own password)
    const { error: inviteError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/settings/set-password`,
    })

    if (inviteError) {
        return { success: false, error: inviteError.message }
    }

    // Pre-create user_roles entry (will be linked when user confirms)
    // Note: The actual user_id will be set via a trigger when user confirms signup
    const { error: roleError } = await supabase
        .from('pending_invites')
        .insert({ email, role })

    if (roleError) {
        // It's okay if this fails, the main invite was sent
        console.error('Failed to create pending invite:', roleError)
    }

    return { success: true, message: 'Jemputan telah dihantar ke email' }
}

// Get current user info
export async function getCurrentUser() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Not logged in' }
    }

    const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    return {
        success: true,
        user: {
            id: user.id,
            email: user.email,
            role: userRole?.role || 'staff'
        }
    }
}
