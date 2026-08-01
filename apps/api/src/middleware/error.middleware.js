import { logger } from "../lib/logger.js";

// Centralized error handler. Stack traces and internal error details are
// logged server-side only; clients always get a generic message unless the
// error was explicitly marked safe to expose (see lib/httpError.js).
export default function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode;
  const isKnownClientError =
    Number.isInteger(status) && status >= 400 && status < 500 && err.expose;

  if (isKnownClientError) {
    return res.status(status).json({ message: err.message });
  }

  logger.error({ err }, "Unhandled error");
  res.status(500).json({ message: "Internal server error." });
}
