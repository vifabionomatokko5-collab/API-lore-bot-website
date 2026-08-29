const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
    console.warn("[SUPABASE] SUPABASE_URL não configurada.");
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
        "[SUPABASE] SUPABASE_SERVICE_ROLE_KEY não configurada."
    );
}

const supabase =
    SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
        ? createClient(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )
        : null;

module.exports = supabase;
