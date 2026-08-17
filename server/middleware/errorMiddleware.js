import { ApiError } from "../utils/ApiError.js";

export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    if (error.name === "CastError") {
      error = new ApiError(400, `Invalid ${error.path}: ${error.value}`);
    } else if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      error = new ApiError(422, "Validation failed", errors);
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] ?? "field";
      error = new ApiError(409, `${field} already in use`);
    } else if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      error = new ApiError(401, "Invalid or expired session, please log in again");
    } else if (error.name === "MulterError") {
      error = new ApiError(400, error.message);
    } else {
      error = new ApiError(error.statusCode || 500, error.message || "Internal server error");
    }
  }

  if (error.statusCode >= 500) {
    console.error(err);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(error.errors ? { errors: error.errors } : {}),
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
}
