const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}:`, err.stack || err.message);

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map((val) => val.message);
    return res.status(400).json({
      error: 'Validation Error',
      details
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Malformed JSON payload'
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: err.message && statusCode !== 500 ? err.message : 'Something went wrong'
  });
};

module.exports = errorHandler;
