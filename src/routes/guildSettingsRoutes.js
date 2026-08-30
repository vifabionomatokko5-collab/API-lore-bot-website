const express = require("express");

const router = express.Router();

const {
    getGuildSettings,
    updateWelcome,
    updateAutorole,
    updateLeave
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
                mode,
                advancedTitle,
                advancedFooter
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
// GET AUTOROLE
// ========================================

router.get(
    "/:guildId/settings/autorole",
    validateGuildId,
    async (req, res, next) => {
        try {
            const settings = await getGuildSettings(
                req.params.guildId
            );

            res.json({
                success: true,
                autorole: {
                    enabled:
                        Boolean(settings.autorole_enabled),

                    roleIds:
                        Array.isArray(settings.autorole_role_ids)
                            ? settings.autorole_role_ids
                            : []
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// ========================================
// PUT AUTOROLE
// ========================================

router.put(
    "/:guildId/settings/autorole",
    validateGuildId,
    async (req, res, next) => {
        try {
            const {
                enabled,
                roleIds
            } = req.body;

            if (
                enabled !== undefined &&
                typeof enabled !== "boolean"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "O campo enabled deve ser booleano."
                });
            }

            if (
                roleIds !== undefined &&
                !Array.isArray(roleIds)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "roleIds deve ser uma lista de cargos."
                });
            }

            const normalizedRoleIds = Array.isArray(roleIds)
                ? roleIds.map(id => String(id))
                : [];

            if (
                normalizedRoleIds.some(
                    id => !/^\d{17,20}$/.test(id)
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Um ou mais IDs de cargos são inválidos."
                });
            }

            if (normalizedRoleIds.length > 10) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Você pode selecionar no máximo 10 cargos."
                });
            }

            const settings = await updateAutorole(
                req.params.guildId,
                {
                    enabled,
                    roleIds: normalizedRoleIds
                }
            );

            res.json({
                success: true,

                message:
                    "Configuração de AutoRole salva.",

                autorole: {
                    enabled:
                        Boolean(settings.autorole_enabled),

                    roleIds:
                        Array.isArray(settings.autorole_role_ids)
                            ? settings.autorole_role_ids
                            : []
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


// ========================================
// GET MENSAGEM DE SAÍDA
// ========================================

router.get(
    "/:guildId/settings/leave",
    validateGuildId,
    async (req, res, next) => {
        try {
            const settings =
                await getGuildSettings(
                    req.params.guildId
                );

            res.json({
                success: true,

                leave: {
                    enabled:
                        Boolean(
                            settings.leave_enabled
                        ),

                    channelId:
                        settings.leave_channel_id,

                    message:
                        settings.leave_message ||
                        "Até mais, {user}! 👋",

                    mode:
                        settings.leave_mode ||
                        "normal",

                    advancedTitle:
                        settings.leave_advanced_title ||
                        "",

                    advancedFooter:
                        settings.leave_advanced_footer ||
                        ""
                }
            });

        } catch (error) {
            next(error);
        }
    }
);

// ========================================
// PUT MENSAGEM DE SAÍDA
// ========================================

router.put(
    "/:guildId/settings/leave",
    validateGuildId,
    async (req, res, next) => {
        try {

            const {
                enabled,
                channelId,
                message,
                mode
            } = req.body;

            // --------------------------------
            // VALIDAR MODO
            // --------------------------------

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

            // --------------------------------
            // VALIDAR MENSAGEM
            // --------------------------------

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

            // --------------------------------
            // SALVAR
            // --------------------------------

            const settings =
                await updateLeave(
                    req.params.guildId,
                    {
                        enabled,
                        channelId,
                        message,
                        mode,
                        advancedTitle,
                        advancedFooter
                    }
                );

            res.json({
                success: true,

                message:
                    "Configuração de mensagem de saída salva.",

                leave: {
                    enabled:
                        Boolean(
                            settings.leave_enabled
                        ),

                    channelId:
                        settings.leave_channel_id,

                    message:
                        settings.leave_message,

                    mode:
                        settings.leave_mode,

                    advancedTitle:
                        settings.leave_advanced_title ||
                        "",

                    advancedFooter:
                        settings.leave_advanced_footer ||
                        ""
                }
            });

        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;