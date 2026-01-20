
import { createClient } from '@supabase/supabase-js'
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyAdminData() {
    console.log("Verifying Admin Data Fetch...");

    const { data: participants, error } = await supabase
        .from('participants')
        .select('name, checkins(day, attend_count)')
        .limit(5);

    if (error) {
        console.error("Query failed:", error);
    } else {
        console.log("Query Successful. Sample Data:");
        participants?.forEach(p => {
            console.log(`- ${p.name}:`, p.checkins);
        });
    }
}

verifyAdminData();
