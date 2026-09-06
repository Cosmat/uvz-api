require('dotenv').config()

module.exports = {
  port: process.env.PORT || 8000,
  mongoUri: process.env.MONGO_URI || 'mongodb+srv://Cosmatos:***@uvz-cluster.ovtqxpr.mongodb.net/birga_01?appName=uvz-cluster',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-prod',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
}