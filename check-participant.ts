
import { createClient } from '@supabase/supabase-js'
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkChong() {
    console.log("Searching for 'Chong'...");

    // 1. Find Participant
    const { data: participants, error: pError } = await supabase
        .from('participants')
        .select('*')
        .ilike('name', '%Chong%')
        .limit(5);

    if (pError || !participants || participants.length === 0) {
        console.log("No participant found matching 'Chong'.");
        return;
    }

    console.log(`Found ${participants.length} participant(s).`);

    for (const p of participants) {
        console.log(`\n--- Participant: ${p.name} (ID: ${p.id}) ---`);
        console.log(`Event Code: ${p.event_code}`);
        console.log(`Ticket: ${p.ticket_type}`);

        // 2. Check Check-ins
        const { data: checkins, error: cError } = await supabase
            .from('checkins')
            .select('*')
            .eq('participant_id', p.id);

        if (checkins && checkins.length > 0) {
            console.log(`[STATUS] Checked In: YES (Count: ${checkins.length})`);
            checkins.forEach(c => {
                console.log(`   - Day ${c.day}: ${c.status} (Attendees: ${c.attend_count})`);
            });
        } else {
            console.log(`[STATUS] Checked In: NO`);
        }
    }
}

checkChong();
