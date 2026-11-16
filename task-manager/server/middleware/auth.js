const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authorization token required'
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      error: 'Malformed authorization token'
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV !== 'test') {
    return res.status(500).json({
      error: 'JWT secret not configured'
    });
  }

  try {
    const decoded = jwt.verify(token, secret || 'test_jwt_secret_fallback');
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.message === 'Token expired') {
      return res.status(401).json({
        error: 'Token expired'
      });
    }
    return res.status(401).json({
      error: 'Invalid token'
    });
  }
};

module.exports = auth;
