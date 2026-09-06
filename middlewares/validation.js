const Joi = require('joi')

const schemas = {
  zayavkaCreate: Joi.object({
    tzeh: Joi.string().trim().min(1).max(10).required(),
    professia: Joi.string().trim().min(1).max(100).required(),
    description: Joi.string().trim().allow('', null).max(5000),
    requirements: Joi.string().trim().allow('', null).max(5000),
    salary_min: Joi.number().min(0).max(1000000),
    salary_max: Joi.number().min(0).max(1000000),
    schedule: Joi.string().valid('Полный день', 'Сменный график', 'Гибкий график', 'Удаленная работа', 'Не указано'),
    experience_required: Joi.string().valid('Без опыта', '1-3 года', '3-5 лет', '5+ лет', 'Не указано'),
    contact_name: Joi.string().trim().allow('', null).max(100),
    contact_phone: Joi.string().trim().allow('', null).max(50),
    contact_email: Joi.string().email().allow('', null).max(100),
    status: Joi.string().valid('Активная', 'Архивная', 'Черновик'),
    id_sozdatelya: Joi.string().trim().allow('', null)
  }),

  zayavkaUpdate: Joi.object({
    tzeh: Joi.string().trim().min(1).max(10),
    professia: Joi.string().trim().min(1).max(100),
    description: Joi.string().trim().allow('', null).max(5000),
    requirements: Joi.string().trim().allow('', null).max(5000),
    salary_min: Joi.number().min(0).max(1000000),
    salary_max: Joi.number().min(0).max(1000000),
    schedule: Joi.string().valid('Полный день', 'Сменный график', 'Гибкий график', 'Удаленная работа', 'Не указано'),
    experience_required: Joi.string().valid('Без опыта', '1-3 года', '3-5 лет', '5+ лет', 'Не указано'),
    contact_name: Joi.string().trim().allow('', null).max(100),
    contact_phone: Joi.string().trim().allow('', null).max(50),
    contact_email: Joi.string().email().allow('', null).max(100),
    status: Joi.string().valid('Активная', 'Архивная', 'Черновик')
  }).min(1),

  deshifeCreate: Joi.object({
    shifr: Joi.string().trim().min(1).max(20).required(),
    description: Joi.string().trim().min(1).max(2000).required(),
    category: Joi.string().valid('Начисления', 'Удержания', 'Прочее')
  }),

  phoneTabelCreate: Joi.object({
    number_tzeh: Joi.string().trim().min(1).max(10).required(),
    nuber_phone: Joi.string().trim().min(1).max(50).required(),
    description: Joi.string().trim().allow('', null).max(500)
  }),

  authLogin: Joi.object({
    username: Joi.string().trim().min(3).max(30).required(),
    password: Joi.string().min(6).max(100).required()
  }),

  authRegister: Joi.object({
    username: Joi.string().trim().min(3).max(30).required(),
    password: Joi.string().min(6).max(100).required(),
    role: Joi.string().valid('admin', 'moderator', 'user')
  }),

  queryParams: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().pattern(/^[-+]?[a-zA-Z_][a-zA-Z0-9_]*$/),
    tzeh: Joi.string().trim(),
    professia: Joi.string().trim(),
    status: Joi.string().trim(),
    category: Joi.string().trim(),
    search: Joi.string().trim(),
    activeOnly: Joi.boolean()
  })
}

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  })
  
  if (error) {
    const details = error.details.map(d => ({
      field: d.path.join('.'),
      message: d.message
    }))
    return res.status(422).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details
    })
  }
  
  req.validated = value
  next()
}

const validateQuery = (schema = schemas.queryParams) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  })
  
  if (error) {
    const details = error.details.map(d => ({
      field: d.path.join('.'),
      message: d.message
    }))
    return res.status(422).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Invalid query parameters',
      details
    })
  }
  
  req.query = value
  next()
}

module.exports = {
  schemas,
  validate,
  validateQuery
}