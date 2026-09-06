const { model, Schema } = require('mongoose')

const zayavkaSchema = new Schema({
  tzeh: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  professia: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  requirements: {
    type: String,
    default: '',
    trim: true
  },
  salary_min: {
    type: Number,
    default: 0,
    min: 0
  },
  salary_max: {
    type: Number,
    default: 0,
    min: 0
  },
  schedule: {
    type: String,
    enum: ['Полный день', 'Сменный график', 'Гибкий график', 'Удаленная работа', 'Не указано'],
    default: 'Не указано'
  },
  experience_required: {
    type: String,
    enum: ['Без опыта', '1-3 года', '3-5 лет', '5+ лет', 'Не указано'],
    default: 'Не указано'
  },
  contact_name: {
    type: String,
    default: '',
    trim: true
  },
  contact_phone: {
    type: String,
    default: '',
    trim: true
  },
  contact_email: {
    type: String,
    default: '',
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['Активная', 'Архивная', 'Черновик'],
    default: 'Активная',
    index: true
  },
  date: {
    type: String,
    default: () => new Date().toLocaleDateString('ru-RU')
  },
  id_sozdatelya: {
    type: String,
    default: '',
    index: true
  }
}, {
  timestamps: true,
  versionKey: false
})

// Compound indexes for common queries
zayavkaSchema.index({ tzeh: 1, status: 1 })
zayavkaSchema.index({ professia: 1, status: 1 })
zayavkaSchema.index({ status: 1, createdAt: -1 })
zayavkaSchema.index({ salary_min: 1, salary_max: 1 })

// Text search index
zayavkaSchema.index({
  tzeh: 'text',
  professia: 'text',
  description: 'text',
  requirements: 'text'
})

module.exports = model('Zayavka', zayavkaSchema)