require("dotenv").config();

const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.disable("x-powered-by");

app.use(
    cors({
        origin: process.env.WEBSITE_URL || "*",
        credentials: true
    })
);

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// Informações básicas da API
app.get("/", (req, res) => {
    res.json({
        success: true,
        service: "Lore API",
        version: "2.0.0",
        status: "online"
    });
});

// API V1
app.use("/api/v1", routes);

// 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint não encontrado.",
        path: req.originalUrl
    });
});

// Erros
app.use(errorHandler);

module.exports = app;

app.get("/api/v1/internal/test-supabase", async (req, res) => {
    try {
        const supabase = require("./database/supabase");

        if (!supabase) {
            return res.status(500).json({
                success: false,
                message: "Supabase não foi inicializado."
            });
        }

        const { data, error } = await supabase
            .from("guild_settings")
            .select("guild_id")
            .limit(1);

        if (error) {
            console.error("[SUPABASE] Erro:", error);

            return res.status(500).json({
                success: false,
                message: "Erro ao consultar o Supabase.",
                error: error.message
            });
        }

        res.json({
            success: true,
            message: "Supabase conectado com sucesso!",
            records: data.length
        });

    } catch (error) {
        console.error("[SUPABASE] Erro interno:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
