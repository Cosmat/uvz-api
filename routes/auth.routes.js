const { Router } = require("express")
const Deshife = require("../models/deshife.model")
const Zayavka = require("../models/zayavka.model")
const { login, createUser } = require("../controllers/auth.controller")
const {
  createZayavka,
  del_Zayavka,
} = require("../controllers/zayavka.controller")
const { deshife_controller } = require("../controllers/spravka.controller")
const {
  phone_tabel_controller,
} = require("../controllers/phone_tabel.controller")
const PhoneTabel = require("../models/phone_tabel.model")

const router = Router()

// /api/auth/admin/login
router.post("/admin/login", login)

// /api/auth/admin/create
router.post("/admin/create", createUser)

router.post("/createZayavka", createZayavka)

router.post("/get_Zayavka_profile", async (req, res) => {
  const Zayavki = await Zayavka.find({ id_sozdatelya: req.body.id_sozdatelya })
  res.status(200).json(Zayavki)
})

router.post("/del_Zayavka", del_Zayavka)

router.get("/getallZayavka", async (req, res) => {
  const Zayavki = await Zayavka.find()
  res.status(200).json(Zayavki)
})

router.get("/get_Deshife", async (req, res) => {
  const data_deshife = await Deshife.find()
  res.status(200).json(data_deshife)
})

router.post("/create_Deshife", deshife_controller)

router.post("/create_phone_tabel", phone_tabel_controller)

router.get("/get_phone_tabel", async (req, res) => {
  const data_phone = await PhoneTabel.find()
  res.status(200).json(data_phone)
})

module.exports = router
