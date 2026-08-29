const express = require("express");

const router = express.Router();

const {
    getGuildSettings,
    updateWelcome
} = require("../services/guildSettingsService");

// ========================================
// VALIDAR ID DA GUILD
// ========================================

function validateGuildId(req, res, next) {
    const { guildId } = req.params;

    if (!/^\d{17,20}$/.test(String(guildId))) {
        return res.status(400).json({
            success: false,
            message: "ID de servidor inválido."
        });
    }

    next();
}

// ========================================
// GET CONFIGURAÇÕES GERAIS
// ========================================

router.get(
    "/:guildId/settings",
    validateGuildId,
    async (req, res, next) => {
        try {
            const settings = await getGuildSettings(
                req.params.guildId
            );

            res.json({
                success: true,
                settings
            });
        } catch (error) {
            next(error);
        }
    }
);

// ========================================
// GET BOAS-VINDAS
// ========================================

router.get(
    "/:guildId/settings/welcome",
    validateGuildId,
    async (req, res, next) => {
        try {
            const settings = await getGuildSettings(
                req.params.guildId
            );

            res.json({
                success: true,

                welcome: {
                    enabled:
                        settings.welcome_enabled,

                    channelId:
                        settings.welcome_channel_id,

                    message:
                        settings.welcome_message,

                    mode:
                        settings.welcome_mode || "normal"
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// ========================================
// PUT BOAS-VINDAS
// ========================================

router.put(
    "/:guildId/settings/welcome",
    validateGuildId,
    async (req, res, next) => {
        try {
            const {
                enabled,
                channelId,
                message,
                mode
            } = req.body;

            // -------------------------------
            // VALIDAR MODO
            // -------------------------------

            if (
                mode !== undefined &&
                mode !== "normal" &&
                mode !== "advanced"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Modo inválido. Use normal ou advanced."
                });
            }

            // -------------------------------
            // VALIDAR MENSAGEM
            // -------------------------------

            if (
                message !== undefined &&
                typeof message !== "string"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "A mensagem deve ser um texto."
                });
            }

            if (
                message !== undefined &&
                message.length > 4000
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "A mensagem não pode ter mais de 4000 caracteres."
                });
            }

            // -------------------------------
            // ATUALIZAR
            // -------------------------------

            const settings = await updateWelcome(
                req.params.guildId,
                {
                    enabled,
                    channelId,
                    message,
                    mode
                }
            );

            res.json({
                success: true,

                message:
                    "Configuração de boas-vindas salva.",

                welcome: {
                    enabled:
                        settings.welcome_enabled,

                    channelId:
                        settings.welcome_channel_id,

                    message:
                        settings.welcome_message,

                    mode:
                        settings.welcome_mode
                }
            });

        } catch (error) {
            next(error);
        }
    }
);

// ========================================
// TESTAR MENSAGEM DE BOAS-VINDAS
// ========================================

router.post(
    "/:guildId/settings/welcome/test",
    validateGuildId,
    async (req, res, next) => {
        try {
            const {
                channelId,
                message,
                mode
            } = req.body;

            // -------------------------------
            // VALIDAR CANAL
            // -------------------------------

            if (
                !channelId ||
                !/^\d{17,20}$/.test(String(channelId))
            ) {
                return res.status(400).json({
                    success: false,
                    message: "ID de canal inválido."
                });
            }

            // -------------------------------
            // VALIDAR MENSAGEM
            // -------------------------------

            if (
                message !== undefined &&
                typeof message !== "string"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "A mensagem deve ser um texto."
                });
            }

            if (
                message !== undefined &&
                message.length > 4000
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "A mensagem não pode ter mais de 4000 caracteres."
                });
            }

            // -------------------------------
            // VALIDAR MODO
            // -------------------------------

            if (
                mode !== undefined &&
                mode !== "normal" &&
                mode !== "advanced"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Modo inválido. Use normal ou advanced."
                });
            }

            // -------------------------------
            // RESPOSTA
            // -------------------------------

            res.json({
                success: true,

                message:
                    "Solicitação de teste recebida.",

                test: {
                    guildId:
                        req.params.guildId,

                    channelId:
                        String(channelId),

                    mode:
                        mode || "normal",

                    content:
                        message ||
                        "Bem-vindo(a), {user}, ao {server}!"
                }
            });

        } catch (error) {
            next(error);
        }
    }
);

// ========================================
// EXPORT
// ========================================

module.exports = router;