const express = require("express");

const router = express.Router();

// ========================================
// HEALTH
// ========================================

router.get("/health", (req, res) => {

    res.json({
        success: true,
        status: "online",
        service: "Lore API",
        version: "2.3.0",
        timestamp: new Date().toISOString()
    });

});

// ========================================
// API INFO
// ========================================

router.get("/", (req, res) => {

    res.json({
        success: true,
        service: "Lore API",
        version: "2.3.0",
        status: "online"
    });

});

// ========================================
// BOT
// ========================================

router.get("/bot", (req, res) => {

    const bot = req.app.locals.botStatus;

    res.json({
        success: true,

        bot: bot || {
            online: false,
            name: "Lore",
            id: null,
            servers: 0,
            commands: 0,
            guilds: [],
            updatedAt: null
        }
    });

});

// ========================================
// SERVIDORES
// ========================================

router.get("/servers", (req, res) => {

    const bot = req.app.locals.botStatus;

    const guilds =
        Array.isArray(bot?.guilds)
            ? bot.guilds
            : [];

    res.json({
        success: true,
        count: guilds.length,
        servers: guilds
    });

});

// ========================================
// COMANDOS
// ========================================

router.get("/commands", (req, res) => {

    res.json({
        success: true,

        count: 3,

        commands: [
            {
                name: "help",
                description:
                    "Mostra os comandos disponíveis.",
                category: "utilidade"
            },

            {
                name: "ping",
                description:
                    "Verifica a latência da Lore.",
                category: "utilidade"
            },

            {
                name: "perfil",
                description:
                    "Mostra informações do usuário.",
                category: "utilidade"
            }
        ]
    });

});

// ========================================
// AUTENTICAÇÃO INTERNA
// ========================================

function validateInternalToken(req, res) {

    const authHeader =
        req.headers.authorization;

    const expectedToken =
        process.env.API_TOKEN;

    if (!expectedToken) {

        res.status(500).json({
            success: false,
            message:
                "API_TOKEN não configurado na API."
        });

        return false;
    }

    if (!authHeader) {

        res.status(401).json({
            success: false,
            message:
                "Token de autenticação ausente."
        });

        return false;
    }

    const token =
        authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : authHeader;

    if (token !== expectedToken) {

        res.status(403).json({
            success: false,
            message:
                "Token de autenticação inválido."
        });

        return false;
    }

    return true;
}

// ========================================
// STATUS INTERNO DO BOT
// ========================================

router.post(
    "/internal/bot/status",
    (req, res) => {

        if (!validateInternalToken(req, res)) {
            return;
        }

        const {
            online,
            name,
            id,
            servers,
            commands,
            guilds
        } = req.body;

        const normalizedGuilds =
            Array.isArray(guilds)
                ? guilds
                : [];

        req.app.locals.botStatus = {

            online:
                Boolean(online),

            name:
                name || "Lore",

            id:
                id || null,

            servers:
                Number(servers) ||
                normalizedGuilds.length,

            commands:
                Number(commands) || 0,

            guilds:
                normalizedGuilds,

            updatedAt:
                new Date().toISOString()
        };

        console.log(
            `[BOT] Status atualizado: ${
                online
                    ? "ONLINE"
                    : "OFFLINE"
            } | Servidores: ${
                normalizedGuilds.length
            }`
        );

        res.json({

            success: true,

            message:
                "Status da Lore atualizado.",

            bot:
                req.app.locals.botStatus
        });

    }
);

// ========================================
// RECURSOS DOS SERVIDORES
// ========================================

router.post(
    "/internal/bot/resources",
    (req, res) => {

        if (!validateInternalToken(req, res)) {
            return;
        }

        const {
            guilds
        } = req.body;

        if (!Array.isArray(guilds)) {

            return res.status(400).json({

                success: false,

                message:
                    "O campo guilds precisa ser um array."
            });
        }

        const resources = {};

        for (const guild of guilds) {

            if (!guild?.guild?.id) {
                continue;
            }

            const guildId =
                String(guild.guild.id);

            resources[guildId] = {

                guild: {
                    id: guildId,

                    name:
                        guild.guild.name ||
                        "Servidor sem nome",

                    icon:
                        guild.guild.icon ||
                        null,

                    memberCount:
                        Number(
                            guild.guild.memberCount
                        ) || 0
                },

                channels:
                    Array.isArray(guild.channels)
                        ? guild.channels
                        : [],

                roles:
                    Array.isArray(guild.roles)
                        ? guild.roles
                        : [],

                updatedAt:
                    new Date().toISOString()
            };
        }

        req.app.locals.guildResources =
            resources;

        console.log(
            `[BOT] Recursos atualizados: ${
                Object.keys(resources).length
            } servidor(es).`
        );

        res.json({

            success: true,

            message:
                "Recursos dos servidores atualizados.",

            count:
                Object.keys(resources).length
        });

    }
);

// ========================================
// CONSULTAR RECURSOS DE UM SERVIDOR
// ========================================

router.get(
    "/guilds/:guildId/resources",
    (req, res) => {

        const guildId =
            String(req.params.guildId);

        const resources =
            req.app.locals.guildResources || {};

        const guild =
            resources[guildId];

        if (!guild) {

            return res.status(404).json({

                success: false,

                message:
                    "Recursos deste servidor ainda não foram sincronizados."
            });
        }

        res.json({

            success: true,

            resources: guild
        });

    }
);

// ========================================
// CANAIS DE UM SERVIDOR
// ========================================

router.get(
    "/guilds/:guildId/channels",
    (req, res) => {

        const guildId =
            String(req.params.guildId);

        const resources =
            req.app.locals.guildResources || {};

        const guild =
            resources[guildId];

        if (!guild) {

            return res.status(404).json({

                success: false,

                message:
                    "Servidor não encontrado ou ainda não sincronizado."
            });
        }

        res.json({

            success: true,

            count:
                guild.channels.length,

            channels:
                guild.channels
        });

    }
);

// ========================================
// CARGOS DE UM SERVIDOR
// ========================================

router.get(
    "/guilds/:guildId/roles",
    (req, res) => {

        const guildId =
            String(req.params.guildId);

        const resources =
            req.app.locals.guildResources || {};

        const guild =
            resources[guildId];

        if (!guild) {

            return res.status(404).json({

                success: false,

                message:
                    "Servidor não encontrado ou ainda não sincronizado."
            });
        }

        res.json({

            success: true,

            count:
                guild.roles.length,

            roles:
                guild.roles
        });

    }
);

// ========================================
// CONFIGURAÇÕES DOS SERVIDORES
// ========================================

const guildSettingsRoutes =
    require("./guildSettingsRoutes");

router.use(
    "/guilds",
    guildSettingsRoutes
);


/*
 * ========================================
 * SISTEMA DE LURAS
 * ========================================
 */

const lurasRoutes = require("./lurasRoutes");

router.use(
    "/luras",
    lurasRoutes
);

// ========================================
// EXPORT
// ========================================

module.exports = router;
