const supabase = require("../database/supabase");

/*
 * ========================================
 * BUSCAR CONTA VINCULADA
 * ========================================
 */

async function getCoinAccount(discordId) {
    const { data, error } = await supabase
        .from("coin_accounts")
        .select(
            "discord_id, coin_user_id, coin_username, encrypted_session, created_at, updated_at"
        )
        .eq("discord_id", String(discordId))
        .maybeSingle();

    if (error) {
        console.error(
            "[COIN ACCOUNT] Erro ao buscar conta:",
            error
        );

        throw new Error(
            "Não foi possível consultar a conta Coin."
        );
    }

    return data || null;
}

/*
 * ========================================
 * VERIFICAR VÍNCULO
 * ========================================
 */

async function isCoinLinked(discordId) {
    const account =
        await getCoinAccount(discordId);

    return Boolean(account);
}

/*
 * ========================================
 * CRIAR / ATUALIZAR VÍNCULO
 * ========================================
 */

async function linkCoinAccount({
    discordId,
    coinUserId,
    coinUsername,
    encryptedSession
}) {
    if (!discordId) {
        throw new Error(
            "Discord ID não informado."
        );
    }

    if (!coinUserId) {
        throw new Error(
            "Coin User ID não informado."
        );
    }

    if (!encryptedSession) {
        throw new Error(
            "Sessão Coin não informada."
        );
    }

    const now =
        new Date().toISOString();

    const { data, error } =
        await supabase
            .from("coin_accounts")
            .upsert(
                {
                    discord_id:
                        String(discordId),

                    coin_user_id:
                        String(coinUserId),

                    coin_username:
                        coinUsername
                            ? String(coinUsername)
                            : null,

                    encrypted_session:
                        String(encryptedSession),

                    updated_at:
                        now
                },
                {
                    onConflict:
                        "discord_id"
                }
            )
            .select(
                "discord_id, coin_user_id, coin_username, created_at, updated_at"
            )
            .single();

    if (error) {
        console.error(
            "[COIN ACCOUNT] Erro ao vincular conta:",
            error
        );

        throw new Error(
            "Não foi possível vincular a conta Coin."
        );
    }

    return data;
}

/*
 * ========================================
 * ATUALIZAR SESSÃO
 * ========================================
 */

async function updateCoinSession(
    discordId,
    encryptedSession
) {
    if (!discordId) {
        throw new Error(
            "Discord ID não informado."
        );
    }

    if (!encryptedSession) {
        throw new Error(
            "Sessão Coin não informada."
        );
    }

    const { data, error } =
        await supabase
            .from("coin_accounts")
            .update({
                encrypted_session:
                    String(encryptedSession),

                updated_at:
                    new Date().toISOString()
            })
            .eq(
                "discord_id",
                String(discordId)
            )
            .select(
                "discord_id, coin_user_id, coin_username, created_at, updated_at"
            )
            .single();

    if (error) {
        console.error(
            "[COIN ACCOUNT] Erro ao atualizar sessão:",
            error
        );

        throw new Error(
            "Não foi possível atualizar a sessão Coin."
        );
    }

    return data;
}

/*
 * ========================================
 * ATUALIZAR NOME DA CONTA
 * ========================================
 */

async function updateCoinUsername(
    discordId,
    coinUsername
) {
    const { data, error } =
        await supabase
            .from("coin_accounts")
            .update({
                coin_username:
                    coinUsername
                        ? String(coinUsername)
                        : null,

                updated_at:
                    new Date().toISOString()
            })
            .eq(
                "discord_id",
                String(discordId)
            )
            .select(
                "discord_id, coin_user_id, coin_username, created_at, updated_at"
            )
            .single();

    if (error) {
        console.error(
            "[COIN ACCOUNT] Erro ao atualizar usuário Coin:",
            error
        );

        throw new Error(
            "Não foi possível atualizar os dados da conta Coin."
        );
    }

    return data;
}

/*
 * ========================================
 * DESVINCULAR
 * ========================================
 */

async function unlinkCoinAccount(
    discordId
) {
    const { error } =
        await supabase
            .from("coin_accounts")
            .delete()
            .eq(
                "discord_id",
                String(discordId)
            );

    if (error) {
        console.error(
            "[COIN ACCOUNT] Erro ao desvincular:",
            error
        );

        throw new Error(
            "Não foi possível desvincular a conta Coin."
        );
    }

    return true;
}

/*
 * ========================================
 * SESSÃO
 * ========================================
 */

async function getCoinSession(
    discordId,
    decryptSession
) {
    const account =
        await getCoinAccount(discordId);

    if (!account) {
        return null;
    }

    if (
        typeof decryptSession !==
        "function"
    ) {
        throw new Error(
            "Função de descriptografia não fornecida."
        );
    }

    return decryptSession(
        account.encrypted_session
    );
}

/*
 * ========================================
 * EXPORTS
 * ========================================
 */

module.exports = {
    getCoinAccount,
    isCoinLinked,

    linkCoinAccount,
    updateCoinSession,
    updateCoinUsername,

    unlinkCoinAccount,

    getCoinSession
};
