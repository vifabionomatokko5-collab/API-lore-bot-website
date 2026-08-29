let botStatus = {
    online: false,
    name: "Lore",
    id: null,
    servers: 0,
    commands: 0,
    lastUpdate: null
};

function updateBotStatus(data = {}) {
    botStatus = {
        ...botStatus,
        ...data,
        lastUpdate: new Date().toISOString()
    };

    return botStatus;
}

function getBotStatus() {
    return botStatus;
}

module.exports = {
    updateBotStatus,
    getBotStatus
};
