const config = require('../config');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  console.error(`[ERROR] ${statusCode} - ${message}`);
  console.error(err.stack);
  
  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || null,
    stack: config.nodeEnv === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;