const express = require("express");
const supabase = require("../database/supabase");

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

router.get("/servers", async (req, res) => {

    try {

        const bot = req.app.locals.botStatus;

        // Primeiro tenta usar os dados atuais do bot.
        let guilds =
            Array.isArray(bot?.guilds)
                ? bot.guilds
                : [];

        // Se a API reiniciou e o cache estiver vazio,
        // recupera os servidores salvos no Supabase.
        if (guilds.length === 0) {

            const { data, error } = await supabase
                .from("guild_resources")
                .select(
                    "guild_id, guild_name, guild_icon, member_count"
                );

            if (error) {
                console.error(
                    "[SUPABASE] Erro ao consultar servidores:",
                    error.message
                );

                return res.status(500).json({
                    success: false,
                    count: 0,
                    servers: [],
                    message:
                        "Não foi possível consultar os servidores."
                });
            }

            guilds = (data || []).map(server => ({
                id: String(server.guild_id),
                name: server.guild_name || "Servidor sem nome",
                icon: server.guild_icon || null,
                memberCount:
                    Number(server.member_count) || 0
            }));
        }

        res.json({
            success: true,
            count: guilds.length,
            servers: guilds
        });

    } catch (error) {

        console.error(
            "[SERVERS] Erro ao consultar servidores:",
            error.message
        );

        res.status(500).json({
            success: false,
            count: 0,
            servers: [],
            message:
                "Não foi possível carregar os servidores."
        });
    }

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
    async (req, res) => {

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

            const resource = {
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

            resources[guildId] = resource;

            const { error } = await supabase
                .from("guild_resources")
                .upsert({
                    guild_id: guildId,
                    guild_name: resource.guild.name,
                    guild_icon: resource.guild.icon,
                    member_count: resource.guild.memberCount,
                    channels: resource.channels,
                    roles: resource.roles,
                    updated_at: resource.updatedAt
                }, {
                    onConflict: "guild_id"
                });

            if (error) {
                console.error(
                    `[SUPABASE] Erro ao salvar recursos da guild ${guildId}:`,
                    error.message
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Erro ao salvar recursos no banco de dados."
                });
            }
        }

        // Mantém o cache em memória para compatibilidade
        // com as rotas antigas.
        req.app.locals.guildResources =
            resources;

        console.log(
            `[BOT] Recursos atualizados no Supabase: ${
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
    async (req, res) => {

        const guildId =
            String(req.params.guildId);

        try {

            const { data, error } = await supabase
                .from("guild_resources")
                .select("roles")
                .eq("guild_id", guildId)
                .maybeSingle();

            if (error) {

                console.error(
                    `[SUPABASE] Erro ao consultar cargos da guild ${guildId}:`,
                    error.message
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Erro ao consultar os cargos do servidor."
                });
            }

            if (!data) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Servidor não encontrado ou ainda não sincronizado."
                });
            }

            const roles =
                Array.isArray(data.roles)
                    ? data.roles
                    : [];

            res.json({
                success: true,

                count:
                    roles.length,

                roles
            });

        } catch (error) {

            console.error(
                `[ROLES] Erro inesperado para a guild ${guildId}:`,
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Erro interno ao consultar os cargos."
            });
        }
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
