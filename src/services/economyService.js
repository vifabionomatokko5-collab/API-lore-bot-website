const {
    getLuras,
    addLuras,
    removeLuras
} = require("./lurasService");

async function getBalance(guildId, userId) {
    return getLuras(userId);
}

async function addBalance(
    guildId,
    userId,
    amount,
    description = "Luras adicionadas"
) {
    const account = await addLuras(
        userId,
        amount,
        description
    );

    return {
        account,
        amount: Number(amount),
        description
    };
}

async function removeBalance(
    guildId,
    userId,
    amount,
    description = "Luras removidas"
) {
    const account = await removeLuras(
        userId,
        amount,
        description
    );

    return {
        account,
        amount: Number(amount),
        description
    };
}

async function transferBalance(
    guildId,
    fromUserId,
    toUserId,
    amount
) {
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
        throw new Error(
            "A quantidade precisa ser um número maior que zero."
        );
    }

    if (
        String(fromUserId) ===
        String(toUserId)
    ) {
        throw new Error(
            "Você não pode transferir Luras para si mesmo."
        );
    }

    const sender =
        await getLuras(fromUserId);

    if (
        Number(sender.balance || 0) <
        value
    ) {
        throw new Error(
            "Saldo de Luras insuficiente."
        );
    }

    /*
     * Remove do remetente.
     */
    const updatedSender =
        await removeLuras(
            fromUserId,
            value,
            `Transferência para ${toUserId}`
        );

    /*
     * Adiciona ao destinatário.
     */
    let updatedReceiver;

    try {
        updatedReceiver =
            await addLuras(
                toUserId,
                value,
                `Transferência de ${fromUserId}`
            );
    } catch (error) {

        /*
         * Tenta devolver o valor
         * caso a transferência falhe.
         */
        try {
            await addLuras(
                fromUserId,
                value,
                "Estorno de transferência"
            );
        } catch (rollbackError) {
            console.error(
                "[LURAS] Erro no estorno:",
                rollbackError
            );
        }

        throw error;
    }

    return {
        amount: value,
        sender: updatedSender,
        receiver: updatedReceiver
    };
}

module.exports = {
    getBalance,
    addBalance,
    removeBalance,
    transferBalance
};
