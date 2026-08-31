const express = require("express");
const supabase = require("../database/supabase");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { guildId, userId } = req.body;

        if (!guildId) {
            return res.status(400).json({
                success: false,
                message: "guildId é obrigatório."
            });
        }

        const { data, error } = await supabase
            .from("lore_premium")
            .upsert({
                guild_id: String(guildId),
                user_id: userId ? String(userId) : null,
                active: true
            }, {
                onConflict: "guild_id,user_id"
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            premium: data
        });
    } catch (error) {
        console.error("[PREMIUM] Erro:", error.message);
        res.status(500).json({
            success: false,
            message: "Erro ao salvar Premium."
        });
    }
});

router.get("/check", async (req, res) => {
    try {
        const { guildId, userId } = req.query;

        if (!guildId || !userId) {
            return res.status(400).json({
                success: false,
                premium: false
            });
        }

        const { data, error } = await supabase
            .from("lore_premium")
            .select("id")
            .eq("guild_id", String(guildId))
            .eq("active", true)
            .or(`user_id.eq.${userId},user_id.is.null`)
            .limit(1);

        if (error) throw error;

        res.json({
            success: true,
            premium: data.length > 0
        });
    } catch (error) {
        console.error("[PREMIUM] Erro:", error.message);
        res.status(500).json({
            success: false,
            premium: false
        });
    }
});

module.exports = router;
