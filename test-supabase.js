require("dotenv").config();

const supabase = require("./src/database/supabase");

async function test() {
    if (!supabase) {
        console.error("[TESTE] Supabase não foi inicializado.");
        process.exit(1);
    }

    const { data, error } = await supabase
        .from("guild_settings")
        .select("guild_id")
        .limit(1);

    if (error) {
        console.error("[TESTE] ERRO:", error.message);
        process.exit(1);
    }

    console.log("[TESTE] SUPABASE CONECTADO!");
    console.log("[TESTE] Registros encontrados:", data.length);
}

test();
