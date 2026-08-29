require("dotenv").config();

const app = require("./app");

const PORT = Number(process.env.PORT) || 3000;

// ========================================
// SERVIDOR
// ========================================

const server = app.listen(PORT, "0.0.0.0", () => {

    console.log("=================================");
    console.log("           LORE API");
    console.log("=================================");
    console.log("Status: ONLINE");
    console.log(`Porta: ${PORT}`);
    console.log("Host: 0.0.0.0");
    console.log("=================================");

});

// ========================================
// ENCERRAMENTO SEGURO
// ========================================

function shutdown(signal) {

    console.log(`[API] Recebido ${signal}. Encerrando...`);

    server.close(() => {

        console.log("[API] Servidor encerrado.");

        process.exit(0);

    });

}

process.on("SIGTERM", () => {
    shutdown("SIGTERM");
});

process.on("SIGINT", () => {
    shutdown("SIGINT");
});

// ========================================
// ERROS
// ========================================

process.on("unhandledRejection", (error) => {

    console.error(
        "[API] Unhandled Rejection:",
        error
    );

});

process.on("uncaughtException", (error) => {

    console.error(
        "[API] Uncaught Exception:",
        error
    );

});