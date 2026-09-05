const { model, Schema } = require("mongoose");

const deshifeSchema = new Schema({
  shifr: {
    type: String,
  },

  description: {
    type: String,
  },
});

module.exports = model("deshife", deshifeSchema);
