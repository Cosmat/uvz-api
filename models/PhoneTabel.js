const { model, Schema } = require('mongoose')

const phoneTabelSchema = new Schema({
  number_tzeh: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone_number: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
})

// unique: true already creates index, no need for explicit index()

module.exports = model('PhoneTabel', phoneTabelSchema)