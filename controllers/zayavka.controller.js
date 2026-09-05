const keys = require("../keys");
const Zayavka = require("../models/zayavka.model");

module.exports.createZayavka = async (req, res) => {
  try {
    const zayavka = new Zayavka({
      // Основные поля
      tzeh: req.body.tzeh,
      professia: req.body.professia,
      description: req.body.description,
      id_sozdatelya: req.body.id,
      date: req.body.date,
      
      // Новые поля
      requirements: req.body.requirements || "",
      salary_min: req.body.salary_min || null,
      salary_max: req.body.salary_max || null,
      schedule: req.body.schedule || "Полный день",
      experience_required: req.body.experience_required || "Без опыта",
      contact_name: req.body.contact_name || "",
      contact_phone: req.body.contact_phone || "",
      contact_email: req.body.contact_email || "",
      status: req.body.status || "Активная"
    });
    
    await zayavka.save();
    res.status(201).json({ 
      message: "ZAYAVKA_CREATED",
      zayavka: zayavka 
    });
  } catch (error) {
    console.error("Ошибка при создании вакансии:", error);
    res.status(500).json({ 
      message: "Ошибка при создании вакансии",
      error: error.message 
    });
  }
};
module.exports.del_Zayavka = async (req, res) => {
  const candidate_to_delete = await Zayavka.findOne({ _id: req.body.dt });
  if (candidate_to_delete) {
    candidate_to_delete.remove();
  } else {
    res.status(500).json({ message: "SOMETHING WRONG" });
  }

  res.status(200).json({ message: "ZAYAVKA_DELETED" });
};
