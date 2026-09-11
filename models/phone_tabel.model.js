const { model, Schema } = require("mongoose")

const phone_tabel_Schema = new Schema({
  phone_number: {
    type: String,
  },
  number_tzeh: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: {
    type: String
  },
  is_active: {
    type: Boolean,
    default: true
  }
})

module.exports = model("phone_tabel_Schema", phone_tabel_Schema)