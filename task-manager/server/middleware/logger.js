const logger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl || req.url}`);
  next();
};

module.exports = logger;
