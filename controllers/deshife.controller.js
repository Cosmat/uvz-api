const deshifeService = require('../services/deshife.service')
const { validate, validateQuery, schemas } = require('../middlewares/validation')

const getAll = [
  validateQuery(schemas.queryParams),
  async (req, res, next) => {
    try {
      const { page, limit, category, search } = req.query
      const result = await deshifeService.getAll({ page, limit, category, search })
      res.json({ success: true, ...result })
    } catch (e) {
      next(e)
    }
  }
]

const getByShifr = async (req, res, next) => {
  try {
    const item = await deshifeService.getByShifr(req.params.shifr)
    res.json({ success: true, data: item })
  } catch (e) {
    next(e)
  }
}

const create = [
  validate(schemas.deshifeCreate),
  async (req, res, next) => {
    try {
      const item = await deshifeService.create(req.validated)
      res.status(201).json({ success: true, data: item })
    } catch (e) {
      next(e)
    }
  }
]

const bulkCreate = async (req, res, next) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        error: 'BAD_REQUEST',
        message: 'Expected array of items'
      })
    }
    const result = await deshifeService.bulkCreate(req.body)
    res.json({ success: true, data: result })
  } catch (e) {
    next(e)
  }
}

const update = [
  validate(schemas.deshifeCreate),
  async (req, res, next) => {
    try {
      const item = await deshifeService.update(req.params.shifr, req.validated)
      res.json({ success: true, data: item })
    } catch (e) {
      next(e)
    }
  }
]

const deleteDeshife = async (req, res, next) => {
  try {
    await deshifeService.delete(req.params.shifr)
    res.json({ success: true, message: 'Deleted' })
  } catch (e) {
    next(e)
  }
}

const getCategories = async (req, res, next) => {
  try {
    const categories = await deshifeService.getCategories()
    res.json({ success: true, data: categories })
  } catch (e) {
    next(e)
  }
}

module.exports = {
  getAll,
  getByShifr,
  create,
  bulkCreate,
  update,
  delete: deleteDeshife,
  getCategories
}