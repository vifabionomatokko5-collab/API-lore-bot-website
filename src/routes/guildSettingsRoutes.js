const express = require("express");
const router = express.Router();

const {
    getGuildSettings,
    updateWelcome,
    updateAutorole
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
            const settings =
                await getGuildSettings(
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

// GET configurações de boas-vindas
router.get(
    "/:guildId/settings/welcome",
    validateGuildId,
    async (req, res, next) => {
        try {
            const settings =
                await getGuildSettings(
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
                        settings.welcome_message
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// PUT configurações de boas-vindas
router.put(
    "/:guildId/settings/welcome",
    validateGuildId,
    async (req, res, next) => {
        try {
            const settings =
                await updateWelcome(
                    req.params.guildId,
                    req.body || {}
                );

            res.json({
                success: true,
                message:
                    "Configuração de boas-vindas salva.",
                settings
            });
        } catch (error) {
            next(error);
        }
    }
);

// GET AutoRole
router.get(
    "/:guildId/settings/autorole",
    validateGuildId,
    async (req, res, next) => {
        try {
            const settings =
                await getGuildSettings(
                    req.params.guildId
                );

            res.json({
                success: true,
                autorole: {
                    enabled:
                        settings.autorole_enabled,

                    roleId:
                        settings.autorole_role_id
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// PUT AutoRole
router.put(
    "/:guildId/settings/autorole",
    validateGuildId,
    async (req, res, next) => {
        try {
            const settings =
                await updateAutorole(
                    req.params.guildId,
                    req.body || {}
                );

            res.json({
                success: true,
                message:
                    "Configuração de AutoRole salva.",
                settings
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
