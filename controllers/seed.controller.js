/**
 * One-time seed controller (invoked via /api/admin/seed-zayavki?key=...)
 * Imports the 50 real UZV vacancies from the old site archive (zayavki_seed_data.json)
 * so search has real professions to match (электромонтер, экскаватор, токарь, фрезеровщик...).
 */
const Zayavka = require('../models/Zayavka')
const SEED = require('../scripts/zayavki_seed_data.json')

async function seedZayavki(req, res, next) {
  try {
    const key = String(req.query.key || '')
    if (key !== 'uvz-seed-2026') {
      return res.status(403).json({ success: false, error: 'FORBIDDEN' })
    }

    const before = await Zayavka.countDocuments({})
    const docs = SEED.map(v => ({
      tzeh: v.tzeh,
      professia: v.professia,
      description: v.description,
      salary_min: 0,
      salary_max: 0,
      schedule: 'Не указано',
      experience_required: 'Не указано',
      status: 'Активная',
      id_sozdatelya: 'seed-archive'
    }))
    const result = await Zayavka.bulkWrite(docs.map(d => ({ insertOne: { document: d } })))
    const after = await Zayavka.countDocuments({})

    res.json({ success: true, before, inserted: result.insertedCount, after })
  } catch (e) {
    next(e)
  }
}

module.exports = { seedZayavki }
