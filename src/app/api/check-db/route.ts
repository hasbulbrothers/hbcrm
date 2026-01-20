import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET() {
    const { data, error } = await supabase
        .from('participants')
        .select('event_code, name, phone, ticket_type')
        .limit(10)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get unique event codes
    const { data: allData } = await supabase
        .from('participants')
        .select('event_code')

    const uniqueCodes = [...new Set(allData?.map(p => p.event_code))]

    return NextResponse.json({
        sampleData: data,
        uniqueEventCodes: uniqueCodes
    })
}
