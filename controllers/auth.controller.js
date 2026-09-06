const authService = require('../services/auth.service')
const { validate, schemas } = require('../middlewares/validation')

const login = [
  validate(schemas.authLogin),
  async (req, res, next) => {
    try {
      const { username, password } = req.validated
      const result = await authService.login(username, password)
      res.json({ success: true, ...result })
    } catch (e) {
      next(e)
    }
  }
]

const register = [
  validate(schemas.authRegister),
  async (req, res, next) => {
    try {
      const { username, password, role } = req.validated
      const result = await authService.register(username, password, role)
      res.status(201).json({ success: true, ...result })
    } catch (e) {
      next(e)
    }
  }
]

const me = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Not authenticated'
      })
    }
    res.json({
      success: true,
      data: {
        id: req.user._id,
        username: req.user.username,
        role: req.user.role
      }
    })
  } catch (e) {
    next(e)
  }
}

const changePassword = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Not authenticated'
      })
    }
    
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'BAD_REQUEST',
        message: 'oldPassword and newPassword required'
      })
    }

    await authService.changePassword(req.user._id, oldPassword, newPassword)
    res.json({ success: true, message: 'Password changed' })
  } catch (e) {
    next(e)
  }
}

module.exports = {
  login,
  register,
  me,
  changePassword
}