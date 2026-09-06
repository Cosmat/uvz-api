const { AppError } = require('../utils/AppError')
const config = require('../config')

const errorHandler = (err, req, res, next) => {
  // Log error in development
  if (config.nodeEnv === 'development') {
    console.error('❌ Error:', err)
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }))
    return res.status(422).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details
    })
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({
      success: false,
      error: 'CONFLICT',
      message: `${field} already exists`,
      details: [{ field, message: `${field} already exists` }]
    })
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'BAD_REQUEST',
      message: 'Invalid ID format',
      details: [{ field: err.path, message: 'Invalid ID format' }]
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Invalid token'
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Token expired'
    })
  }

  // Operational errors (our AppError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.code,
      message: err.message
    })
  }

  // Programming errors - don't leak details in production
  if (config.nodeEnv === 'production') {
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Something went wrong'
    })
  }

  // Development - show full error
  return res.status(500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: err.message,
    stack: err.stack
  })
}

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} not found`
  })
}

module.exports = {
  errorHandler,
  notFound
}