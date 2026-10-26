/** 404 handler for unknown API routes. */
function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

/** Central error handler: turns thrown errors into a consistent JSON shape. */
function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const first = Object.values(err.errors)[0];
    message = first ? first.message : 'Invalid data';
  }

  // Invalid MongoDB ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid id';
  }

  // Duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `That ${field} is already in use`;
  }

  // File upload problems reported by multer
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Audio file is too large (maximum 25 MB)';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field - upload the audio under "audio"';
    } else {
      message = err.message;
    }
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({ message });
}

module.exports = { notFound, errorHandler };
