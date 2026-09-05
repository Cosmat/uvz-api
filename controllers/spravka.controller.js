const Deshife = require("../models/deshife.model")

module.exports.deshife_controller = async (req, res) => {
  const money = new Deshife({
    shifr: req.body.shifr,
    description: req.body.description,
  })
  await money.save()
  res.status(201).json({ message: "MONEY_CREATED" })
}
