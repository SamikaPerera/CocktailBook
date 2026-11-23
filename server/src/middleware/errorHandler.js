// Central error handling.
// Every route that throws (or calls next(err)) ends up here, so error
// responses always have the same JSON shape: { message: "..." }.

// 404 handler - runs when no route matched the request.
export function notFound(req, res, next) {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
}

// Turn common database errors into friendly messages with the right status code.
function translateError(err) {
  // MongoDB duplicate key, e.g. a second spec called "Negroni".
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    return { status: 409, message: `A record with this ${field} already exists` };
  }
  // Mongoose schema validation failed (backup for express-validator).
  if (err.name === 'ValidationError') {
    return { status: 400, message: Object.values(err.errors).map((e) => e.message).join('. ') };
  }
  // A badly formatted id reached the database.
  if (err.name === 'CastError') {
    return { status: 400, message: `Invalid ${err.path}` };
  }
  return { status: err.status || 500, message: err.message };
}

// Error handler - Express recognises it because it has 4 arguments.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const { status, message } = translateError(err);

  // Only log unexpected (server) errors; 4xx errors are the client's fault.
  if (status >= 500) console.error(err);

  res.status(status).json({
    message: status >= 500 && process.env.NODE_ENV === 'production'
      ? 'Something went wrong on the server' // don't leak internals in production
      : message,
  });
}
