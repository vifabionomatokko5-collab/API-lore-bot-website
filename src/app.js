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
