const supabase = require("../database/supabase");

function getSupabase() {
    if (!supabase) {
        throw new Error(
            "Supabase não configurado no ambiente da API."
        );
    }

    return supabase;
}

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
                guild_id: String(guildId)
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

async function updateWelcome(guildId, settings) {
    const db = getSupabase();

    const update = {
        guild_id: String(guildId),
        welcome_enabled: Boolean(settings.enabled),
        welcome_channel_id:
            settings.channelId
                ? String(settings.channelId)
                : null,
        welcome_message:
            settings.message ??
            "Bem-vindo(a), {user}, ao {server}!",
        updated_at: new Date().toISOString()
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

async function updateAutorole(guildId, settings) {
    const db = getSupabase();

    const update = {
        guild_id: String(guildId),
        autorole_enabled: Boolean(settings.enabled),
        autorole_role_id:
            settings.roleId
                ? String(settings.roleId)
                : null,
        updated_at: new Date().toISOString()
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
            `Erro ao salvar AutoRole: ${error.message}`
        );
    }

    return data;
}

module.exports = {
    getGuildSettings,
    updateWelcome,
    updateAutorole
};
