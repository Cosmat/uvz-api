const { model, Schema } = require("mongoose");

const zayavkaSchema = new Schema({
  tzeh: {
    type: String,
    required: true,
  },
  professia: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  id_sozdatelya: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  // Новые поля для расширенной информации
  salary_min: {
    type: Number,
    default: null,
  },
  salary_max: {
    type: Number,
    default: null,
  },
  requirements: {
    type: String,
    default: "",
  },
  schedule: {
    type: String,
    enum: ["Полный день", "Сменный график", "Ж/д график", "4/3", "Удаленная работа"],
    default: "Полный день",
  },
  contact_name: {
    type: String,
    default: "",
  },
  contact_phone: {
    type: String,
    default: "",
  },
  contact_email: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["Активная", "Приостановлена", "Закрыта"],
    default: "Активная",
  },
  experience_required: {
    type: String,
    enum: ["Без опыта", "1-3 года", "3-5 лет", "5+ лет"],
    default: "Без опыта",
  },
});

module.exports = model("zayavka", zayavkaSchema);
