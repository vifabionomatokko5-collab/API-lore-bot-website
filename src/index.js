require("dotenv").config();

const app = require("./app");

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
    console.log("=================================");
    console.log("        LORE API");
    console.log("=================================");
    console.log(`Status: ONLINE`);
    console.log(`Porta: ${PORT}`);
    console.log(`Host: ${HOST}`);
    console.log(`Supabase: ${process.env.SUPABASE_URL ? "CONFIGURADO" : "NÃO CONFIGURADO"}`);
    console.log("=================================");
});

server.on("error", (error) => {
    console.error("[SERVER] Erro ao iniciar:", error);
    process.exit(1);
});

process.on("SIGTERM", () => {
    console.log("[SERVER] Recebido SIGTERM. Encerrando...");
    server.close(() => {
        process.exit(0);
    });
});

process.on("SIGINT", () => {
    console.log("[SERVER] Encerrando...");
    server.close(() => {
        process.exit(0);
    });
});
