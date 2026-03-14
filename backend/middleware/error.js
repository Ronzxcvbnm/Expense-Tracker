const HttpError = require("../utils/httpError");

function notFound(req, res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = Number(err.statusCode || err.status || 500);
  let message = err.message;
  let details = err.details || null;

  if (err?.code === 11000) {
    statusCode = 409;
    message = "Resource already exists";
  } else if (err?.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(err.errors || {}).map((fieldError) => ({
      field: fieldError.path,
      message: fieldError.message
    }));
  } else if (err?.name === "CastError") {
    statusCode = 400;
    message = "Invalid identifier";
  }

  const isHttpError = err?.name === "HttpError" && Number.isFinite(Number(err.statusCode || err.status));
  const exposeMessage = statusCode < 500 || isHttpError;

  const payload = { message: exposeMessage ? message || "Request failed" : "Server error" };
  if (exposeMessage && details) {
    payload.details = details;
  }

  if (process.env.NODE_ENV !== "production" && !exposeMessage && message) {
    payload.error = message;
  }

  res.status(statusCode).json(payload);
}

module.exports = {
  notFound,
  errorHandler
};
