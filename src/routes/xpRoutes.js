const express = require("express");
const supabase = require("../database/supabase");

const router = express.Router();

/*
 * ========================================
 * CONFIGURAÇÃO DO XP
 * ========================================
 */

function xpNecessarioParaNivel(level) {
    return Math.floor(100 * Math.pow(level, 1.5));
}

/*
 * ========================================
 * POST /message
 * ========================================
 */

router.post("/message", async (req, res) => {

    try {

        const {
            user_id,
            xp
        } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "user_id é obrigatório."
            });
        }

        const userId = String(user_id);

        let xpGanho = Number(xp);

        if (!Number.isFinite(xpGanho)) {
            return res.status(400).json({
                success: false,
                message: "XP inválido."
            });
        }

        /*
         * Limite de segurança.
         * O bot normalmente enviará entre 10 e 20 XP.
         */

        xpGanho = Math.floor(xpGanho);

        if (xpGanho < 1 || xpGanho > 50) {
            return res.status(400).json({
                success: false,
                message: "O XP deve estar entre 1 e 50."
            });
        }

        /*
         * Busca o usuário.
         */

        const { data: existing, error: findError } =
            await supabase
                .from("user_xp")
                .select("*")
                .eq("user_id", userId)
                .maybeSingle();

        if (findError) {
            console.error(
                "[XP] Erro ao buscar usuário:",
                findError
            );

            return res.status(500).json({
                success: false,
                message: "Erro ao consultar XP."
            });
        }

        /*
         * Primeiro registro.
         */

        if (!existing) {

            const initialXp = xpGanho;

            let level = 1;
            let currentXp = initialXp;

            while (
                currentXp >= xpNecessarioParaNivel(level)
            ) {
                currentXp -= xpNecessarioParaNivel(level);
                level++;
            }

            const { data, error } =
                await supabase
                    .from("user_xp")
                    .insert({
                        user_id: userId,
                        xp: currentXp,
                        level,
                        total_xp: initialXp,
                        messages_count: 1,
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();

            if (error) {
                console.error(
                    "[XP] Erro ao criar usuário:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message: "Erro ao salvar XP."
                });
            }

            return res.json({
                success: true,
                xp_gained: xpGanho,
                xp: data.xp,
                total_xp: data.total_xp,
                level: data.level,
                level_up: data.level > 1,
                old_level: 1,
                new_level: data.level
            });
        }

        /*
         * Usuário existente.
         */

        const oldLevel = Number(existing.level) || 1;

        let currentXp =
            Number(existing.xp) + xpGanho;

        let level = oldLevel;

        while (
            currentXp >= xpNecessarioParaNivel(level)
        ) {

            currentXp -=
                xpNecessarioParaNivel(level);

            level++;
        }

        const totalXp =
            Number(existing.total_xp || 0) +
            xpGanho;

        const messagesCount =
            Number(existing.messages_count || 0) +
            1;

        const { data, error } =
            await supabase
                .from("user_xp")
                .update({
                    xp: currentXp,
                    level,
                    total_xp: totalXp,
                    messages_count: messagesCount,
                    updated_at: new Date().toISOString()
                })
                .eq("user_id", userId)
                .select()
                .single();

        if (error) {
            console.error(
                "[XP] Erro ao atualizar usuário:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Erro ao atualizar XP."
            });
        }

        const levelUp =
            level > oldLevel;

        console.log(
            `[XP] ${userId} +${xpGanho} XP | ` +
            `Nível ${oldLevel} → ${level}`
        );

        res.json({
            success: true,
            xp_gained: xpGanho,
            xp: data.xp,
            total_xp: data.total_xp,
            level: data.level,
            messages_count: data.messages_count,
            level_up: levelUp,
            old_level: oldLevel,
            new_level: level
        });

    } catch (error) {

        console.error(
            "[XP] Erro interno:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Erro interno do sistema de XP."
        });
    }
});

/*
 * ========================================
 * GET /:userId
 * ========================================
 */

router.get("/:userId", async (req, res) => {

    try {

        const userId =
            String(req.params.userId);

        const { data, error } =
            await supabase
                .from("user_xp")
                .select("*")
                .eq("user_id", userId)
                .maybeSingle();

        if (error) {
            console.error(
                "[XP] Erro ao consultar perfil:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Erro ao consultar XP."
            });
        }

        if (!data) {
            return res.json({
                success: true,
                user_id: userId,
                xp: 0,
                total_xp: 0,
                level: 1,
                messages_count: 0
            });
        }

        res.json({
            success: true,
            user_id: data.user_id,
            xp: data.xp,
            total_xp: data.total_xp,
            level: data.level,
            messages_count: data.messages_count,
            created_at: data.created_at,
            updated_at: data.updated_at
        });

    } catch (error) {

        console.error(
            "[XP] Erro interno:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Erro interno."
        });
    }
});

module.exports = router;
