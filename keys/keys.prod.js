module.exports = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/birga_01',
  JWT: process.env.JWT_SECRET || 'production-jwt-secret-change-me',
  BASE_URL: process.env.BASE_URL || 'http://localhost:8000'
};