const express = require("express");

const router = express.Router();

const {
    getBalance,
    addBalance,
    removeBalance,
    transferBalance
} = require("../services/economyService");

function validateIds(req, res, next) {
    const { guildId, userId } = req.params;

    if (!/^\d{17,20}$/.test(String(guildId))) {
        return res.status(400).json({
            success: false,
            message: "ID de servidor inválido."
        });
    }

    if (
        userId &&
        !/^\d{17,20}$/.test(String(userId))
    ) {
        return res.status(400).json({
            success: false,
            message: "ID de usuário inválido."
        });
    }

    next();
}

// Consultar saldo
router.get(
    "/:guildId/economy/:userId",
    validateIds,
    async (req, res, next) => {
        try {
            const account = await getBalance(
                req.params.guildId,
                req.params.userId
            );

            res.json({
                success: true,
                balance: Number(account.balance || 0),
                account
            });
        } catch (error) {
            next(error);
        }
    }
);

// Adicionar Luras
router.post(
    "/:guildId/economy/:userId/add",
    validateIds,
    async (req, res, next) => {
        try {
            const {
                amount,
                description
            } = req.body;

            const result = await addBalance(
                req.params.guildId,
                req.params.userId,
                amount,
                description
            );

            res.json({
                success: true,
                balance: Number(
                    result.account.balance || 0
                ),
                amount: result.amount,
                account: result.account
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
);

// Remover Luras
router.post(
    "/:guildId/economy/:userId/remove",
    validateIds,
    async (req, res, next) => {
        try {
            const {
                amount,
                description
            } = req.body;

            const result = await removeBalance(
                req.params.guildId,
                req.params.userId,
                amount,
                description
            );

            res.json({
                success: true,
                balance: Number(
                    result.account.balance || 0
                ),
                amount: result.amount,
                account: result.account
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
);

// Transferência
router.post(
    "/:guildId/economy/transfer",
    async (req, res) => {
        try {
            const {
                fromUserId,
                toUserId,
                amount
            } = req.body;

            if (
                !/^\d{17,20}$/.test(
                    String(req.params.guildId)
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "ID de servidor inválido."
                });
            }

            if (
                !/^\d{17,20}$/.test(
                    String(fromUserId)
                ) ||
                !/^\d{17,20}$/.test(
                    String(toUserId)
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "ID de usuário inválido."
                });
            }

            const result =
                await transferBalance(
                    req.params.guildId,
                    fromUserId,
                    toUserId,
                    amount
                );

            res.json({
                success: true,
                amount: result.amount,
                sender: result.sender,
                receiver: result.receiver
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
);

module.exports = router;
