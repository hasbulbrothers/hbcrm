import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wvnmfjgkptxcnrbbghty.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2bm1mamdrcHR4Y25yYmJnaHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyMzQ2NzAsImV4cCI6MjA1MTgxMDY3MH0.UNxPNnolHQpc_Bjssub_huxB0YlmIRHxoP2DxH6UeNk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkData() {
    console.log('Checking participants data...\n')

    // Get first 5 participants
    const { data, error } = await supabase
        .from('participants')
        .select('event_code, name, phone, ticket_type')
        .limit(5)

    if (error) {
        console.error('Error:', error.message)
        return
    }

    console.log('Sample participants data:')
    console.log('=========================')
    data?.forEach((p, i) => {
        console.log(`\n--- Record ${i + 1} ---`)
        console.log('event_code:', p.event_code)
        console.log('name:', p.name)
        console.log('phone:', p.phone)
        console.log('ticket_type:', p.ticket_type)
    })

    // Get unique event codes
    const { data: allData } = await supabase
        .from('participants')
        .select('event_code')

    const uniqueCodes = [...new Set(allData?.map(p => p.event_code))]
    console.log('\n\nUnique event_code values found:')
    console.log('================================')
    uniqueCodes.forEach(code => console.log(`- "${code}"`))
}

checkData()
