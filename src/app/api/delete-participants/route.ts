import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function DELETE() {
    const { error } = await supabase
        .from('participants')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'All participants deleted' })
}
