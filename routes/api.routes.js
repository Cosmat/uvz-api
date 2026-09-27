const { Router } = require('express')
const { auth, requireRole, optionalAuth } = require('../middlewares/auth')
const zayavkaController = require('../controllers/zayavka.controller')
const deshifeController = require('../controllers/deshife.controller')
const phoneTabelController = require('../controllers/phoneTabel.controller')
const { repairPhones } = require('../controllers/repair.controller')
const authController = require('../controllers/auth.controller')

const router = Router()

// Simple in-memory rate limit for anonymous vacancy creation:
// 5 posts per IP per hour for guests, 10 for logged-in users
// (Render free = single instance, in-memory is fine).
const createHits = new Map() // ip -> { count, resetAt }
const createRateLimit = (req, res, next) => {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '?').toString().split(',')[0].trim()
  const maxPerHour = req.user ? 10 : 5
  const now = Date.now()
  let rec = createHits.get(ip)
  if (!rec || now > rec.resetAt) {
    rec = { count: 0, resetAt: now + 60 * 60 * 1000 }
    createHits.set(ip, rec)
    // opportunistic cleanup
    if (createHits.size > 500) {
      for (const [k, v] of createHits) {
        if (now > v.resetAt) createHits.delete(k)
      }
    }
  }
  rec.count++
  if (rec.count > maxPerHour) {
    return res.status(429).json({
      success: false,
      error: 'RATE_LIMITED',
      message: 'Слишком много вакансий с этого адреса. Попробуйте через час.'
    })
  }
  next()
}

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Auth routes (public)
router.post('/auth/login', ...authController.login)
router.post('/auth/register', ...authController.register)
router.get('/auth/me', auth, authController.me)
router.post('/auth/change-password', auth, authController.changePassword)

// Zayavka routes
router.get('/zayavki', ...zayavkaController.getAll)
router.get('/zayavki/stats', zayavkaController.getStats)
router.get('/zayavki/my', auth, ...zayavkaController.getByCreator)
router.get('/zayavki/:id', zayavkaController.getById)
router.post('/zayavki', createRateLimit, optionalAuth, ...zayavkaController.create)
router.patch('/zayavki/:id', auth, ...zayavkaController.update)
router.patch('/zayavki/:id/archive', auth, zayavkaController.archive)
router.delete('/zayavki/:id', auth, requireRole('admin', 'moderator'), zayavkaController.delete)

// Deshife routes
router.get('/deshife', ...deshifeController.getAll)
router.get('/deshife/categories', deshifeController.getCategories)
router.get('/deshife/:shifr', deshifeController.getByShifr)
router.post('/deshife', auth, requireRole('admin', 'moderator'), ...deshifeController.create)
router.post('/deshife/bulk', auth, requireRole('admin'), deshifeController.bulkCreate)
router.patch('/deshife/:shifr', auth, requireRole('admin', 'moderator'), ...deshifeController.update)
router.delete('/deshife/:shifr', auth, requireRole('admin'), deshifeController.delete)

// PhoneTabel routes
router.get('/phones', ...phoneTabelController.getAll)
router.get('/phones/:tzeh', phoneTabelController.getByTzeh)
router.post('/phones', auth, requireRole('admin', 'moderator'), ...phoneTabelController.create)
router.post('/phones/bulk', auth, requireRole('admin'), phoneTabelController.bulkCreate)
router.patch('/phones/:tzeh', auth, requireRole('admin', 'moderator'), ...phoneTabelController.update)
router.delete('/phones/:tzeh', auth, requireRole('admin'), phoneTabelController.delete)

// One-time repair endpoint removed after successful data repair (2026-09-22)

// One-time seed endpoint: removed after successful import of 50 vacancies (2026-09-23)

module.exports = router