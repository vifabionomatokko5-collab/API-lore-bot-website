const DISCORD_API = "https://discord.com/api/v10";

async function getDiscordUser(accessToken) {
    const response = await fetch(`${DISCORD_API}/users/@me`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error("Não foi possível obter o usuário do Discord.");
    }

    return response.json();
}

async function getUserGuilds(accessToken) {
    const response = await fetch(`${DISCORD_API}/users/@me/guilds`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error("Não foi possível obter os servidores do Discord.");
    }

    return response.json();
}

module.exports = {
    getDiscordUser,
    getUserGuilds
};
