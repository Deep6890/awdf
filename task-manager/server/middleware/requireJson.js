const requireJson = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.toLowerCase().includes('application/json')) {
      return res.status(415).json({
        error: 'Content-Type must be application/json'
      });
    }
  }
  next();
};

module.exports = requireJson;
