'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAdmin(email: string, password: string) {
    if (!email || !password) {
        return { success: false, error: 'Sila masukkan email dan password.' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { success: false, error: 'Email atau password tidak sah.' }
    }

    return { success: true }
}

export async function logoutAdmin() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
