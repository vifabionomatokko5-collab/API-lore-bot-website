const { success } = require("../utils/response");
const { getBotStatus } = require("../services/botService");

function getBot(req, res) {
    return success(res, {
        bot: getBotStatus()
    });
}

module.exports = {
    getBot
};
