const jwt = require('jsonwebtoken');
const config = require('../config');
const ApiError = require('../utils/api-error');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      throw new ApiError('Access denied. No token provided.', 401);
    }
    
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      next(new ApiError('Token expired', 401));
    } else if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError('Invalid token', 403));
    }
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ApiError('Admin access required', 403));
  }
  next();
};

module.exports = { authenticateToken, isAdmin };