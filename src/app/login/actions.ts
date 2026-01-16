'use server'

import { cookies } from 'next/headers'

import { supabase } from '@/lib/supabaseClient'

export async function loginAdmin(email: string, phone: string) {
    if (!email || !phone) {
        return { success: false, error: 'Sila masukkan email dan no telefon.' }
    }

    // Normalized phone check (optional: strip non-digits)
    // For now, exact match
    const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('phone', phone)
        .single()

    if (data) {
        // Set cookie
        const cookieStore = await cookies()
        cookieStore.set('admin_session', 'true', {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 // 1 day
        })
        return { success: true }
    } else {
        return { success: false, error: 'Maklumat tidak sah atau anda bukan admin.' }
    }
}
