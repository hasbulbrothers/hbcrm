
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000

function checkRateLimit(key: string): boolean {
    const now = Date.now()
    const entry = loginAttempts.get(key)

    if (!entry || now > entry.resetAt) {
        loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
        return true
    }

    if (entry.count >= MAX_ATTEMPTS) {
        return false
    }

    entry.count++
    return true
}

export async function login(formData: FormData) {
    const headerStore = await headers()
    const ip = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    if (!checkRateLimit(ip)) {
        return { error: 'Terlalu banyak percubaan. Sila cuba lagi dalam 15 minit.' }
    }

    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email dan password diperlukan' }
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'Invalid email or password' }
    }

    revalidatePath('/', 'layout')
    redirect('/admin/dashboard')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
