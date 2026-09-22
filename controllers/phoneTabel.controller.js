const phoneTabelService = require('../services/phoneTabel.service')
const { validate, validateQuery, schemas } = require('../middlewares/validation')

const getAll = [
  validateQuery(schemas.queryParams),
  async (req, res, next) => {
    try {
      const { page, limit, activeOnly, search } = req.query
      const result = await phoneTabelService.getAll({ page, limit, activeOnly, search })
      res.json({ success: true, ...result })
    } catch (e) {
      next(e)
    }
  }
]

const getByTzeh = async (req, res, next) => {
  try {
    const item = await phoneTabelService.getByTzeh(req.params.tzeh)
    res.json({ success: true, data: item })
  } catch (e) {
    next(e)
  }
}

const create = [
  validate(schemas.phoneTabelCreate),
  async (req, res, next) => {
    try {
      const item = await phoneTabelService.create(req.validated)
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
    const result = await phoneTabelService.bulkCreate(req.body)
    res.json({ success: true, data: result })
  } catch (e) {
    next(e)
  }
}

const update = [
  validate(schemas.phoneTabelCreate),
  async (req, res, next) => {
    try {
      const item = await phoneTabelService.update(req.params.tzeh, req.validated)
      res.json({ success: true, data: item })
    } catch (e) {
      next(e)
    }
  }
]

const deletePhone = async (req, res, next) => {
  try {
    await phoneTabelService.delete(req.params.tzeh)
    res.json({ success: true, message: 'Deleted' })
  } catch (e) {
    next(e)
  }
}

module.exports = {
  getAll,
  getByTzeh,
  create,
  bulkCreate,
  update,
  delete: deletePhone
}