const zayavkaService = require('../services/zayavka.service')
const { validate, validateQuery, schemas } = require('../middlewares/validation')

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const getAll = [
  validateQuery(schemas.queryParams),
  async (req, res, next) => {
    try {
      const { page, limit, sort, tzeh, professia, status, search } = req.query
      
      const filters = {}
      if (tzeh) filters.tzeh = tzeh
      if (professia) filters.professia = { $regex: escapeRegex(professia), $options: 'i' }
      if (status) filters.status = status

      let result
      if (search) {
        // Regex search across tzeh, professia, description, requirements (partial match, case-insensitive)
        const rx = escapeRegex(search)
        filters.$or = [
          { tzeh: { $regex: rx, $options: 'i' } },
          { professia: { $regex: rx, $options: 'i' } },
          { description: { $regex: rx, $options: 'i' } },
          { requirements: { $regex: rx, $options: 'i' } }
        ]
        result = await zayavkaService.getAll({ page, limit, filters, sort })
      } else {
        result = await zayavkaService.getAll({ page, limit, filters, sort })
      }

      res.json({
        success: true,
        ...result
      })
    } catch (e) {
      next(e)
    }
  }
]

const getById = async (req, res, next) => {
  try {
    const zayavka = await zayavkaService.getById(req.params.id)
    res.json({ success: true, data: zayavka })
  } catch (e) {
    next(e)
  }
}

const create = [
  validate(schemas.zayavkaCreate),
  async (req, res, next) => {
    try {
      const data = req.validated
      if (req.user) data.id_sozdatelya = req.user._id.toString()
      
      const zayavka = await zayavkaService.create(data)
      res.status(201).json({ success: true, data: zayavka })
    } catch (e) {
      next(e)
    }
  }
]

const update = [
  validate(schemas.zayavkaUpdate),
  async (req, res, next) => {
    try {
      const zayavka = await zayavkaService.update(req.params.id, req.validated)
      res.json({ success: true, data: zayavka })
    } catch (e) {
      next(e)
    }
  }
]

const archive = async (req, res, next) => {
  try {
    const zayavka = await zayavkaService.archive(req.params.id)
    res.json({ success: true, data: zayavka })
  } catch (e) {
    next(e)
  }
}

const deleteZayavka = async (req, res, next) => {
  try {
    await zayavkaService.delete(req.params.id)
    res.json({ success: true, message: 'Deleted' })
  } catch (e) {
    next(e)
  }
}

const getByCreator = [
  validateQuery(schemas.queryParams),
  async (req, res, next) => {
    try {
      const { page, limit } = req.query
      const creatorId = req.params.creatorId || (req.user ? req.user._id.toString() : null)
      
      if (!creatorId) {
        return res.status(400).json({
          success: false,
          error: 'BAD_REQUEST',
          message: 'Creator ID required'
        })
      }

      const result = await zayavkaService.getByCreator(creatorId, { page, limit })
      res.json({ success: true, ...result })
    } catch (e) {
      next(e)
    }
  }
]

const getStats = async (req, res, next) => {
  try {
    const stats = await zayavkaService.getStats()
    res.json({ success: true, data: stats })
  } catch (e) {
    next(e)
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  archive,
  delete: deleteZayavka,
  getByCreator,
  getStats
}