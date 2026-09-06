require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')

const config = require('../config')
const apiRoutes = require('../routes/api.routes')
const { errorHandler, notFound } = require('../middlewares/errorHandler')

const app = express()

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1)

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

// CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Compression
app.use(compression())

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'))
}

// API routes
app.use('/api', apiRoutes)

// 404 handler
app.use(notFound)

// Error handler
app.use(errorHandler)

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    })
    console.log('✅ MongoDB connected')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    process.exit(1)
  }
}

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`)
  await mongoose.connection.close()
  console.log('MongoDB connection closed')
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

// Start server
const start = async () => {
  await connectDB()
  
  const server = app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port} (${config.nodeEnv})`)
    console.log(`📚 API: http://localhost:${config.port}/api`)
    console.log(`❤️  Health: http://localhost:${config.port}/api/health`)
  })

  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${config.port} is already in use`)
      process.exit(1)
    }
    throw error
  })
}

start()

module.exports = app