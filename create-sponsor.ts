
import { createClient } from '@supabase/supabase-js'
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createSponsor() {
    console.log("Creating dummy Sponsor...");

    const { data, error } = await supabase
        .from('participants')
        .insert({
            name: "Sponsor Test User",
            phone: "0199999999",
            email: "sponsor@test.com",
            event_code: "9xgrowth January",
            ticket_type: "Sponsor",
            state: "KL"
        })
        .select()

    if (error) {
        console.error("Error creating sponsor:", error);
    } else {
        console.log("Created Sponsor:", data);
        console.log("Use this ID to test:", data[0].id);
    }
}

createSponsor();
