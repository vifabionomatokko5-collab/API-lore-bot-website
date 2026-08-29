let botStatus = {
    online: false,
    name: "Lore",
    id: null,
    servers: 0,
    commands: 0,
    guilds: [],
    lastUpdate: null
};

function updateBotStatus(data = {}) {
    botStatus = {
        ...botStatus,
        ...data,
        guilds: Array.isArray(data.guilds)
            ? data.guilds
            : botStatus.guilds,
        lastUpdate: new Date().toISOString()
    };

    return botStatus;
}

function getBotStatus() {
    return botStatus;
}

function getGuilds() {
    return botStatus.guilds;
}

module.exports = {
    updateBotStatus,
    getBotStatus,
    getGuilds
};