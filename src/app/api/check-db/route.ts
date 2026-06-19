import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (userRole?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('participants')
        .select('event_code, name, phone, ticket_type')
        .limit(10)

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    const { data: allData } = await adminClient
        .from('participants')
        .select('event_code')

    const uniqueCodes = [...new Set(allData?.map(p => p.event_code))]

    return NextResponse.json({
        sampleData: data,
        uniqueEventCodes: uniqueCodes
    })
}
