'use server'

import { createAdminClient } from '@/lib/supabase/server'

const PHONE_REGEX = /^[0-9+\-\s]{8,15}$/

interface RegisterInput {
    event_code: string
    name: string
    phone: string
    email: string
    niche: string
    state: string
    ticket_type: string
}

export async function registerParticipant(input: RegisterInput) {
    const event_code = input.event_code?.trim()
    const name = input.name?.trim()
    const phone = input.phone?.trim()
    const email = input.email?.trim()
    const niche = input.niche?.trim()
    const state = input.state?.trim()
    const ticket_type = input.ticket_type?.trim()

    if (!event_code) {
        return { error: 'Event code tidak sah.' }
    }
    if (!name || name.length < 2 || name.length > 200) {
        return { error: 'Sila masukkan nama yang sah.' }
    }
    if (!phone || !PHONE_REGEX.test(phone)) {
        return { error: 'Sila masukkan nombor telefon yang sah.' }
    }
    if (!email || !email.includes('@') || email.length > 254) {
        return { error: 'Sila masukkan e-mel yang sah.' }
    }
    if (!ticket_type || !['General', 'VIP'].includes(ticket_type)) {
        return { error: 'Sila pilih jenis tiket.' }
    }

    const supabase = createAdminClient()

    const { data: existing } = await supabase
        .from('participants')
        .select('id')
        .ilike('event_code', event_code)
        .eq('phone', phone)
        .maybeSingle()

    if (existing) {
        return { error: 'Nombor telefon ini sudah didaftarkan untuk event ini.' }
    }

    const { error } = await supabase.from('participants').insert({
        event_code,
        name,
        phone,
        email,
        niche: niche || null,
        state: state || null,
        ticket_type,
        registration_date: new Date().toISOString().split('T')[0],
        payment_status: 'Pending',
        status_hadir: 'Belum Hadir',
    })

    if (error) {
        return { error: 'Pendaftaran gagal. Sila cuba semula.' }
    }

    return { success: true }
}
