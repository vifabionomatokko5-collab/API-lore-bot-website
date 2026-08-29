const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { updateBotStatus } = require("../services/botService");

router.post("/status", auth, (req, res) => {
    const status = updateBotStatus(req.body);

    res.json({
        success: true,
        message: "Status da Lore atualizado.",
        bot: status
    });
});

module.exports = router;
