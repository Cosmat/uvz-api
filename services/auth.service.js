const User = require('../models/User')
const jwt = require('jsonwebtoken')
const config = require('../config')
const { AppError } = require('../utils/AppError')

class AuthService {
  generateToken(user) {
    return jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    )
  }

  async login(username, password) {
    const user = await User.findOne({ username }).select('+password')
    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
    }

    if (!user.is_active) {
      throw new AppError('Account is disabled', 403, 'ACCOUNT_DISABLED')
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
    }

    user.last_login = new Date()
    await user.save()

    const token = this.generateToken(user)
    
    return {
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      },
      token
    }
  }

  async register(username, password, role = 'user') {
    const existing = await User.findOne({ username })
    if (existing) {
      throw new AppError('Username already exists', 409, 'USER_EXISTS')
    }

    const user = new User({ username, password, role })
    await user.save()

    const token = this.generateToken(user)
    
    return {
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      },
      token
    }
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret)
      const user = await User.findById(decoded.id)
      if (!user || !user.is_active) {
        throw new AppError('User not found or disabled', 401, 'USER_NOT_FOUND')
      }
      return user
    } catch (e) {
      throw new AppError('Invalid token', 401, 'INVALID_TOKEN')
    }
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId).select('+password')
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    const isMatch = await user.comparePassword(oldPassword)
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401, 'WRONG_PASSWORD')
    }

    user.password = newPassword
    await user.save()

    return { success: true }
  }
}

module.exports = new AuthService()