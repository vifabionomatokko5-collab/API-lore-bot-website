const { error } = require("../utils/response");

function auth(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return error(
            res,
            "Token de autenticação ausente.",
            401
        );
    }

    const [type, token] = authorization.split(" ");

    if (
        type !== "Bearer" ||
        !token ||
        token !== process.env.API_TOKEN
    ) {
        return error(
            res,
            "Token de autenticação inválido.",
            401
        );
    }

    next();
}

module.exports = auth;
