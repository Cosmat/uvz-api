const { model, Schema } = require('mongoose')

const deshifeSchema = new Schema({
  shifr: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Начисления', 'Удержания', 'Прочее'],
    default: 'Начисления',
    index: true
  }
}, {
  timestamps: true,
  versionKey: false
})

// Only one index declaration per field
deshifeSchema.index({ category: 1 })

module.exports = model('Deshife', deshifeSchema)