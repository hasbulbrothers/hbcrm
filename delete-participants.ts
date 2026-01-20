import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wvnmfjgkptxcnrbbghty.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2bm1mamdrcHR4Y25yYmJnaHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyMzQ2NzAsImV4cCI6MjA1MTgxMDY3MH0.UNxPNnolHQpc_Bjssub_huxB0YlmIRHxoP2DxH6UeNk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function deleteAllParticipants() {
    console.log('Deleting all participants...')

    const { error } = await supabase
        .from('participants')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) {
        console.error('Error:', error.message)
    } else {
        console.log('✅ All participants deleted successfully!')
    }
}

deleteAllParticipants()
