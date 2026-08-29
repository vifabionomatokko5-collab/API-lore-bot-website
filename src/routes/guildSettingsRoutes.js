const express = require("express");
const router = express.Router();

const {
    getGuildSettings,
    updateWelcome
} = require("../services/guildSettingsService");

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

// GET configurações gerais
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

// GET configuração de boas-vindas
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
                    enabled: settings.welcome_enabled,
                    channelId: settings.welcome_channel_id,
                    message: settings.welcome_message
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// PUT configuração de boas-vindas
router.put(
    "/:guildId/settings/welcome",
    validateGuildId,
    async (req, res, next) => {
        try {
            const {
                enabled,
                channelId,
                message
            } = req.body;

            if (
                message !== undefined &&
                typeof message !== "string"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "A mensagem deve ser um texto."
                });
            }

            if (
                message !== undefined &&
                message.length > 1000
            ) {
                return res.status(400).json({
                    success: false,
                    message: "A mensagem não pode ter mais de 1000 caracteres."
                });
            }

            const settings = await updateWelcome(
                req.params.guildId,
                {
                    enabled,
                    channelId,
                    message
                }
            );

            res.json({
                success: true,
                message: "Configuração de boas-vindas salva.",
                welcome: {
                    enabled: settings.welcome_enabled,
                    channelId: settings.welcome_channel_id,
                    message: settings.welcome_message
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
