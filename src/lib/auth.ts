import { createClient } from '@/lib/supabase/server'

export async function requireAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' as const, user: null, supabase }
    }

    const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (userRole?.role !== 'admin' && userRole?.role !== 'staff') {
        return { error: 'Forbidden' as const, user: null, supabase }
    }

    return { error: null, user, supabase }
}
