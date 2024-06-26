function errorHandler(err, req, res, next) {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const errorMessage = err.message || "An unexpected error occurred";
    res.status(statusCode).json({ error: errorMessage });
    }

module.exports = errorHandler;
