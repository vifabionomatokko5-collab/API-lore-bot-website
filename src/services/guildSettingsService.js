const supabase = require("../database/supabase");

function getSupabase() {
    if (!supabase) {
        throw new Error(
            "Supabase não configurado no ambiente da API."
        );
    }

    return supabase;
}

// ========================================
// BUSCAR CONFIGURAÇÕES
// ========================================

async function getGuildSettings(guildId) {
    const db = getSupabase();

    const { data, error } = await db
        .from("guild_settings")
        .select("*")
        .eq("guild_id", String(guildId))
        .maybeSingle();

    if (error) {
        throw new Error(
            `Erro ao buscar configurações: ${error.message}`
        );
    }

    if (data) {
        return data;
    }

    const { data: created, error: createError } =
        await db
            .from("guild_settings")
            .insert({
                guild_id: String(guildId),
                welcome_enabled: false,
                welcome_channel_id: null,
                welcome_message:
                    "Bem-vindo(a), {user}, ao {server}!",
                welcome_mode: "normal"
            })
            .select("*")
            .single();

    if (createError) {
        throw new Error(
            `Erro ao criar configurações: ${createError.message}`
        );
    }

    return created;
}

// ========================================
// ATUALIZAR BOAS-VINDAS
// ========================================

async function updateWelcome(guildId, settings) {
    const db = getSupabase();

    const mode =
        settings.mode === "advanced"
            ? "advanced"
            : "normal";

    const update = {
        guild_id: String(guildId),

        welcome_enabled:
            Boolean(settings.enabled),

        welcome_channel_id:
            settings.channelId
                ? String(settings.channelId)
                : null,

        welcome_message:
            settings.message ??
            "Bem-vindo(a), {user}, ao {server}!",

        welcome_mode: mode,

        updated_at:
            new Date().toISOString()
    };

    const { data, error } = await db
        .from("guild_settings")
        .upsert(update, {
            onConflict: "guild_id"
        })
        .select("*")
        .single();

    if (error) {
        throw new Error(
            `Erro ao salvar boas-vindas: ${error.message}`
        );
    }

    return data;
}

module.exports = {
    getGuildSettings,
    updateWelcome
};