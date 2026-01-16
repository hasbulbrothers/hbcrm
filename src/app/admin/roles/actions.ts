'use server'

import { createClient } from '@/lib/supabase/server'

// Get all users with roles
export async function getAllUsers() {
    const supabase = await createClient()

    // Check if current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    const { data: currentUserRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (currentUserRole?.role !== 'admin') {
        return { success: false, error: 'Hanya admin boleh akses halaman ini' }
    }

    // Fetch all users from user_roles
    const { data: users, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true, users, currentUserId: user.id }
}

// Update user role
export async function changeUserRole(targetUserId: string, newRole: 'admin' | 'general') {
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
        return { success: false, error: 'Hanya admin boleh tukar role' }
    }

    // Cannot change own role
    if (targetUserId === user.id) {
        return { success: false, error: 'Anda tidak boleh tukar role sendiri' }
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

// Add new user with role
export async function addUserWithRole(email: string, role: 'admin' | 'general') {
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
        return { success: false, error: 'Hanya admin boleh tambah pengguna' }
    }

    // Check if email already exists in pending_invites
    const { data: existingInvite } = await supabase
        .from('pending_invites')
        .select('*')
        .eq('email', email)
        .single()

    if (existingInvite) {
        return { success: false, error: 'Email sudah dijemput sebelum ini' }
    }

    // Send invite email
    const { error: inviteError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`,
    })

    if (inviteError) {
        return { success: false, error: inviteError.message }
    }

    // Add to pending_invites
    const { error: roleError } = await supabase
        .from('pending_invites')
        .insert({ email, role })

    if (roleError) {
        console.error('Failed to create pending invite:', roleError)
    }

    return { success: true, message: 'Jemputan telah dihantar ke email' }
}

// Delete user role (remove access)
export async function deleteUserRole(targetUserId: string) {
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
        return { success: false, error: 'Hanya admin boleh padam pengguna' }
    }

    // Cannot delete own role
    if (targetUserId === user.id) {
        return { success: false, error: 'Anda tidak boleh padam diri sendiri' }
    }

    // Delete user role
    const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', targetUserId)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}
