module.exports = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5000',
  codeLength: 6,
  sessionSecret: process.env.SESSION_SECRET || 'super-secret-key',
  jwtSecret: process.env.JWT_SECRET || 'jwt-secret-key',
  jwtExpire: '30d'
};