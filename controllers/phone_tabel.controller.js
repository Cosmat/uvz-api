const PhoneTabel = require("../models/phone_tabel.model")

module.exports.phone_tabel_controller = async (req, res) => {
  try {
    const phone_tabel = new PhoneTabel({
      phone_number: req.body.phone_number,
      number_tzeh: req.body.number_tzeh,
    })
    await phone_tabel.save()
    res.status(201).json({ message: "PHONE_TABEL_CREATED" })
  } catch (e) {
    res.status(500).json({ message: "PHONE_TABEL_CREATE_ERROR" })
  }
}
