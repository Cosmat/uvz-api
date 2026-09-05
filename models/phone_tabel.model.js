const { model, Schema } = require("mongoose")

const phone_tabel_Schema = new Schema({
  nuber_phone: {
    type: String,
  },

  number_tzeh: {
    type: String,
  },
})

module.exports = model("phone_tabel_Schema", phone_tabel_Schema)
