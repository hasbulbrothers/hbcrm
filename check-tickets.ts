
import { createClient } from '@supabase/supabase-js'
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkTicketTypes() {
    console.log("Checking distinct ticket types...");

    const { data, error } = await supabase
        .from('participants')
        .select('ticket_type')

    if (error) {
        console.error("Error:", error);
        return;
    }

    // Get unique values
    const types = [...new Set(data.map(p => p.ticket_type))];
    console.log("Ticket Types Found:", types);
}

checkTicketTypes();
