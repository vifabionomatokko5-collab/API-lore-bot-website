const { success } = require("../utils/response");

const commands = [
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
        category: "social"
    }
];

function getCommands(req, res) {

    return success(res, {
        count: commands.length,
        commands
    });

}

module.exports = {
    getCommands
};
