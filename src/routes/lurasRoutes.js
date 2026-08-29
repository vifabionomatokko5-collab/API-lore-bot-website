const express = require("express");

const router = express.Router();

const {
    getLuras,
    addLuras,
    removeLuras,
    getTransactions
} = require("../services/lurasService");

function validateUserId(req, res, next) {
    const { userId } = req.params;

    if (!/^\d{17,20}$/.test(String(userId))) {
        return res.status(400).json({
            success: false,
            message: "ID de usuário inválido."
        });
    }

    next();
}

router.get("/:userId", validateUserId, async (req, res, next) => {
    try {
        const luras = await getLuras(req.params.userId);

        res.json({
            success: true,
            luras
        });
    } catch (error) {
        next(error);
    }
});

router.get(
    "/:userId/transactions",
    validateUserId,
    async (req, res, next) => {
        try {
            const transactions = await getTransactions(
                req.params.userId
            );

            res.json({
                success: true,
                count: transactions.length,
                transactions
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/:userId/add",
    validateUserId,
    async (req, res, next) => {
        try {
            const amount = Number(req.body.amount);
            const description =
                req.body.description || "Luras adicionadas";

            if (!Number.isFinite(amount) || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Quantidade inválida."
                });
            }

            const luras = await addLuras(
                req.params.userId,
                amount,
                description
            );

            res.json({
                success: true,
                message: "Luras adicionadas.",
                luras
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/:userId/remove",
    validateUserId,
    async (req, res, next) => {
        try {
            const amount = Number(req.body.amount);
            const description =
                req.body.description || "Luras removidas";

            if (!Number.isFinite(amount) || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Quantidade inválida."
                });
            }

            const luras = await removeLuras(
                req.params.userId,
                amount,
                description
            );

            res.json({
                success: true,
                message: "Luras removidas.",
                luras
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
