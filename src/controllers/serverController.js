const { success } = require("../utils/response");

function getServer(req, res) {

    return success(res, {
        server: {
            name: "Lore",
            status: "online",
            online: true
        }
    });

}

module.exports = {
    getServer
};
