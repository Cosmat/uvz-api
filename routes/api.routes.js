const { Router } = require('express')
const { auth, requireRole } = require('../middlewares/auth')
const zayavkaController = require('../controllers/zayavka.controller')
const deshifeController = require('../controllers/deshife.controller')
const phoneTabelController = require('../controllers/phoneTabel.controller')
const { repairPhones } = require('../controllers/repair.controller')
const authController = require('../controllers/auth.controller')

const router = Router()

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
router.post('/zayavki', auth, ...zayavkaController.create)
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

module.exports = router