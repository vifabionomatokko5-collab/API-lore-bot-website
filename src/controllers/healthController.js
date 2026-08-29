const { success } = require("../utils/response");

function health(req, res) {

    return success(res, {
        status: "online",
        service: "Lore API",
        version: "2.0.0",
        timestamp: new Date().toISOString()
    });

}

module.exports = {
    health
};
