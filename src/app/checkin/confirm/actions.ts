'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function getParticipantById(id: string) {
    if (!UUID_REGEX.test(id)) {
        return { error: 'ID peserta tidak sah' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('participants')
        .select('id, name, phone, email, ticket_type, niche, state, total_sales, checkins(day, attend_count, status)')
        .eq('id', id)
        .single()

    if (error) {
        return { error: 'Peserta tidak dijumpai' }
    }

    return { data }
}

interface BoardroomFormInput {
    participantId: string
    eventCode: string
    brandName: string
    staffCount: string
    question: string
}

export async function submitBoardroomForm(input: BoardroomFormInput) {
    if (!UUID_REGEX.test(input.participantId)) {
        return { error: 'ID peserta tidak sah' }
    }
    if (!rateLimit(`boardroom:${input.participantId}`, 5, 60000)) {
        return { error: 'Terlalu banyak percubaan. Sila tunggu sebentar.' }
    }

    const brandName = (input.brandName || '').trim().slice(0, 200)
    const staffCount = (input.staffCount || '').trim().slice(0, 50)
    const question = (input.question || '').trim().slice(0, 1000)

    if (!brandName || !staffCount || !question) {
        return { error: 'Sila isi semua medan.' }
    }

    // Service-role insert (bypasses RLS; the check-in flow is public/anon).
    const supabase = createAdminClient()
    const { error } = await supabase.from('boardroom_submissions').insert({
        participant_id: input.participantId,
        event_code: input.eventCode,
        brand_name: brandName,
        staff_count: staffCount,
        question,
    })

    if (error) {
        return { error: 'Gagal menghantar borang. Sila cuba semula.' }
    }

    return { success: true }
}
