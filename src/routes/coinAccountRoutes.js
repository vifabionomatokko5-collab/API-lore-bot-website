const express = require("express");
const crypto = require("crypto");

const supabase = require("../database/supabase");

const router = express.Router();

/*
 * ========================================
 * COIN ACCOUNT ROUTES
 * ========================================
 *
 * Responsável somente pelo vínculo:
 *
 * Discord ID <-> Coin API User ID
 *
 * A economia principal da Lore NÃO é utilizada.
 *
 * O sessionId da Coin API nunca é armazenado
 * em texto puro.
 */

/*
 * ========================================
 * CRIPTOGRAFIA DA SESSÃO
 * ========================================
 */

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey() {
    const value = process.env.COIN_SESSION_ENCRYPTION_KEY;

    if (!value) {
        throw new Error(
            "COIN_SESSION_ENCRYPTION_KEY não configurada."
        );
    }

    const key = Buffer.from(value, "hex");

    if (key.length !== 32) {
        throw new Error(
            "COIN_SESSION_ENCRYPTION_KEY precisa conter 32 bytes em hexadecimal."
        );
    }

    return key;
}

function encryptSession(session) {
    if (!session) {
        throw new Error("Session ID não informado.");
    }

    const key = getEncryptionKey();

    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(
        ENCRYPTION_ALGORITHM,
        key,
        iv
    );

    const encrypted = Buffer.concat([
        cipher.update(String(session), "utf8"),
        cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    /*
     * Formato:
     *
     * v1:iv:authTag:ciphertext
     */

    return [
        "v1",
        iv.toString("hex"),
        authTag.toString("hex"),
        encrypted.toString("hex")
    ].join(":");
}

function decryptSession(value) {
    if (!value) {
        throw new Error("Sessão criptografada não encontrada.");
    }

    const parts = String(value).split(":");

    if (parts.length !== 4 || parts[0] !== "v1") {
        throw new Error(
            "Formato de sessão criptografada inválido."
        );
    }

    const [, ivHex, authTagHex, encryptedHex] = parts;

    const key = getEncryptionKey();

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");

    if (
        iv.length !== IV_LENGTH ||
        authTag.length !== AUTH_TAG_LENGTH
    ) {
        throw new Error(
            "Dados de criptografia da sessão inválidos."
        );
    }

    const decipher = crypto.createDecipheriv(
        ENCRYPTION_ALGORITHM,
        key,
        iv
    );

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
    ]);

    return decrypted.toString("utf8");
}

/*
 * ========================================
 * POST /link
 * ========================================
 *
 * Cria ou atualiza o vínculo.
 *
 * A sessão recebida é criptografada
 * antes de ser salva.
 */

router.post("/link", async (req, res) => {
    try {
        const {
            discord_id,
            coin_user_id,
            coin_username,
            session
        } = req.body;

        if (!discord_id) {
            return res.status(400).json({
                success: false,
                message: "discord_id é obrigatório."
            });
        }

        if (!coin_user_id) {
            return res.status(400).json({
                success: false,
                message: "coin_user_id é obrigatório."
            });
        }

        if (!session) {
            return res.status(400).json({
                success: false,
                message: "session é obrigatório."
            });
        }

        const discordId = String(discord_id);
        const coinUserId = String(coin_user_id);

        const sessionEncrypted =
            encryptSession(session);

        const { data, error } =
            await supabase
                .from("coin_accounts")
                .upsert(
                    {
                        discord_id: discordId,
                        coin_user_id: coinUserId,

                        coin_username:
                            coin_username
                                ? String(coin_username)
                                : null,

                        session_encrypted:
                            sessionEncrypted,

                        updated_at:
                            new Date().toISOString()
                    },
                    {
                        onConflict: "discord_id"
                    }
                )
                .select()
                .single();

        if (error) {
            console.error(
                "[COIN ACCOUNT] Erro ao salvar vínculo:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Não foi possível salvar o vínculo."
            });
        }

        /*
         * NUNCA retornamos session_encrypted
         * para o bot/site.
         */

        return res.json({
            success: true,
            linked: true,

            account: {
                discord_id:
                    data.discord_id,

                coin_user_id:
                    data.coin_user_id,

                coin_username:
                    data.coin_username
            }
        });

    } catch (error) {
        console.error(
            "[COIN ACCOUNT] Erro interno:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Erro interno ao vincular conta."
        });
    }
});

/*
 * ========================================
 * GET /:discordId
 * ========================================
 *
 * Retorna somente informações públicas
 * do vínculo.
 *
 * A sessão nunca é retornada.
 */

router.get("/:discordId", async (req, res) => {
    try {
        const discordId =
            String(req.params.discordId);

        const { data, error } =
            await supabase
                .from("coin_accounts")
                .select(
                    "discord_id, coin_user_id, coin_username, created_at, updated_at"
                )
                .eq("discord_id", discordId)
                .maybeSingle();

        if (error) {
            console.error(
                "[COIN ACCOUNT] Erro ao consultar:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Erro ao consultar vínculo."
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                linked: false,
                message:
                    "Conta Coin não vinculada."
            });
        }

        return res.json({
            success: true,
            linked: true,
            account: data
        });

    } catch (error) {
        console.error(
            "[COIN ACCOUNT] Erro interno:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Erro interno."
        });
    }
});

/*
 * ========================================
 * DELETE /:discordId
 * ========================================
 *
 * Remove somente o vínculo local.
 *
 * NÃO remove a conta da Coin API.
 * NÃO altera o saldo.
 */

router.delete("/:discordId", async (req, res) => {
    try {
        const discordId =
            String(req.params.discordId);

        const { data, error } =
            await supabase
                .from("coin_accounts")
                .delete()
                .eq("discord_id", discordId)
                .select()
                .maybeSingle();

        if (error) {
            console.error(
                "[COIN ACCOUNT] Erro ao remover vínculo:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Não foi possível remover o vínculo."
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                linked: false,
                message:
                    "Nenhum vínculo encontrado."
            });
        }

        return res.json({
            success: true,
            linked: false,
            message:
                "Vínculo removido com sucesso."
        });

    } catch (error) {
        console.error(
            "[COIN ACCOUNT] Erro interno:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Erro interno ao remover vínculo."
        });
    }
});

/*
 * ========================================
 * EXPORT
 * ========================================
 */

module.exports = router;
