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
        version: "2.1.0",
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
        version: "2.1.0",
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
            commands: 0
        }
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
                description: "Mostra os comandos disponíveis.",
                category: "utilidade"
            },
            {
                name: "ping",
                description: "Verifica a latência da Lore.",
                category: "utilidade"
            },
            {
                name: "perfil",
                description: "Mostra informações do usuário.",
                category: "utilidade"
            }
        ]
    });

});

// ========================================
// STATUS INTERNO DA BOT
// ========================================

router.post("/internal/bot/status", (req, res) => {

    const authHeader = req.headers.authorization;

    const expectedToken = process.env.API_TOKEN;

    if (!expectedToken) {

        return res.status(500).json({
            success: false,
            message: "API_TOKEN não configurado na API."
        });

    }

    if (!authHeader) {

        return res.status(401).json({
            success: false,
            message: "Token de autenticação ausente."
        });

    }

    const token = authHeader.replace("Bearer ", "");

    if (token !== expectedToken) {

        return res.status(403).json({
            success: false,
            message: "Token de autenticação inválido."
        });

    }

    const {
        online,
        name,
        id,
        servers,
        commands
    } = req.body;

    req.app.locals.botStatus = {

        online: Boolean(online),

        name: name || "Lore",

        id: id || null,

        servers: Number(servers) || 0,

        commands: Number(commands) || 0,

        updatedAt: new Date().toISOString()

    };

    console.log(
        `[BOT] Status atualizado: ${online ? "ONLINE" : "OFFLINE"}`
    );

    res.json({
        success: true,
        message: "Status da Lore atualizado.",
        bot: req.app.locals.botStatus
    });

});

module.exports = router;