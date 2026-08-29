const supabase = require("../database/supabase");

function getSupabase() {
    if (!supabase) {
        throw new Error("Supabase não configurado no ambiente da API.");
    }

    return supabase;
}

async function getLuras(userId) {
    const db = getSupabase();
    const id = String(userId);

    const { data, error } = await db
        .from("user_luras")
        .select("*")
        .eq("user_id", id)
        .maybeSingle();

    if (error) {
        throw new Error(`Erro ao buscar Luras: ${error.message}`);
    }

    if (data) {
        return data;
    }

    const { data: created, error: createError } = await db
        .from("user_luras")
        .insert({
            user_id: id,
            balance: 0,
            total_earned: 0,
            total_spent: 0
        })
        .select("*")
        .single();

    if (createError) {
        throw new Error(
            `Erro ao criar conta de Luras: ${createError.message}`
        );
    }

    return created;
}

async function addLuras(userId, amount, description = "Luras adicionadas") {
    const db = getSupabase();
    const id = String(userId);
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
        throw new Error("Quantidade de Luras inválida.");
    }

    const current = await getLuras(id);

    const balance = Number(current.balance) + value;
    const totalEarned = Number(current.total_earned) + value;

    const { data, error } = await db
        .from("user_luras")
        .update({
            balance,
            total_earned: totalEarned,
            updated_at: new Date().toISOString()
        })
        .eq("user_id", id)
        .select("*")
        .single();

    if (error) {
        throw new Error(`Erro ao adicionar Luras: ${error.message}`);
    }

    await db
        .from("luras_transactions")
        .insert({
            user_id: id,
            amount: value,
            type: "credit",
            description
        });

    return data;
}

async function removeLuras(userId, amount, description = "Luras removidas") {
    const db = getSupabase();
    const id = String(userId);
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
        throw new Error("Quantidade de Luras inválida.");
    }

    const current = await getLuras(id);
    const currentBalance = Number(current.balance);

    if (currentBalance < value) {
        throw new Error("Saldo de Luras insuficiente.");
    }

    const balance = currentBalance - value;
    const totalSpent = Number(current.total_spent) + value;

    const { data, error } = await db
        .from("user_luras")
        .update({
            balance,
            total_spent: totalSpent,
            updated_at: new Date().toISOString()
        })
        .eq("user_id", id)
        .select("*")
        .single();

    if (error) {
        throw new Error(`Erro ao remover Luras: ${error.message}`);
    }

    await db
        .from("luras_transactions")
        .insert({
            user_id: id,
            amount: -value,
            type: "debit",
            description
        });

    return data;
}

async function getTransactions(userId, limit = 20) {
    const db = getSupabase();
    const id = String(userId);

    const { data, error } = await db
        .from("luras_transactions")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        throw new Error(
            `Erro ao buscar histórico de Luras: ${error.message}`
        );
    }

    return data || [];
}

module.exports = {
    getLuras,
    addLuras,
    removeLuras,
    getTransactions
};
