const jwt = require('jsonwebtoken')
const config = require('../config')
const User = require('../models/User')
const { UnauthorizedError, ForbiddenError } = require('../utils/AppError')

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided')
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, config.jwtSecret)

    const user = await User.findById(decoded.id).select('-password')
    if (!user || !user.is_active) {
      throw new UnauthorizedError('User not found or disabled')
    }

    req.user = user
    next()
  } catch (e) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Invalid or expired token'))
    }
    next(e)
  }
}

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'))
  }
  
  if (!roles.includes(req.user.role)) {
    return next(new ForbiddenError('Insufficient permissions'))
  }
  
  next()
}

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next()
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, config.jwtSecret)

    const user = await User.findById(decoded.id).select('-password')
    if (user && user.is_active) {
      req.user = user
    }
    next()
  } catch (e) {
    // Ignore auth errors for optional auth
    next()
  }
}

module.exports = {
  auth,
  requireRole,
  optionalAuth
}