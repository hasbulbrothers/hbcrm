import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE() {
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
    const { error } = await adminClient
        .from('participants')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) {
        return NextResponse.json({ error: 'Failed to delete participants' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'All participants deleted' })
}
