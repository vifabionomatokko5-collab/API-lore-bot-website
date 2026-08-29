function errorHandler(err, req, res, next) {

    console.error(
        `[API ERROR] ${err.stack || err}`
    );

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        success: false,
        message: "Erro interno da API."
    });
}

module.exports = errorHandler;
