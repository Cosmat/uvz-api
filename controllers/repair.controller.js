/**
 * One-time repair controller (invoked via /api/admin/repair-phones?key=...)
 * Replaces the 42 wrong seeded phone records (fake numbers, broken encoding)
 * with the 25 real records from data_phone_tabelnaya.json.
 */
const PhoneTabel = require('../models/PhoneTabel')

// Real data from data_phone_tabelnaya.json (user's actual tabel phones)
const REAL_PHONES = [
  { number_tzeh: '310', phone_number: '34-48-15' },
  { number_tzeh: '320', phone_number: '34-44-40' },
  { number_tzeh: '330', phone_number: '34-45-57' },
  { number_tzeh: '113', phone_number: '34-56-11' },
  { number_tzeh: '340', phone_number: '34-41-15' },
  { number_tzeh: '125', phone_number: '34-58-04' },
  { number_tzeh: '562', phone_number: '34-40-06' },
  { number_tzeh: '740', phone_number: '34-43-41' },
  { number_tzeh: '750', phone_number: '34-56-43' },
  { number_tzeh: '710', phone_number: '34-56-39' },
  { number_tzeh: '565', phone_number: '34-49-34' },
  { number_tzeh: '120', phone_number: '34-56-17' },
  { number_tzeh: '160', phone_number: '34-41-40' },
  { number_tzeh: '170', phone_number: '34-58-12' },
  { number_tzeh: '561', phone_number: '34-43-88' },
  { number_tzeh: '590', phone_number: '34-45-94' },
  { number_tzeh: '446', phone_number: '34-40-49' },
  { number_tzeh: '555', phone_number: '34-40-15' },
  { number_tzeh: '180', phone_number: '34-49-88' },
  { number_tzeh: '552', phone_number: '34-47-12' },
  { number_tzeh: '630', phone_number: '34-49-62' },
  { number_tzeh: '650', phone_number: '34-47-63' },
  { number_tzeh: '380', phone_number: '34-44-19' },
  { number_tzeh: '745', phone_number: '34-47-98' },
  { number_tzeh: '850', phone_number: '34-55-04' }
]

async function repairPhones(req, res, next) {
  try {
    const key = String(req.query.key || '')
    if (key !== 'uvz-repair-2026') {
      return res.status(403).json({ success: false, error: 'FORBIDDEN' })
    }

    const before = await PhoneTabel.countDocuments({})
    await PhoneTabel.deleteMany({})
    const inserted = await PhoneTabel.insertMany(
      REAL_PHONES.map(p => ({
        ...p,
        description: `Цех ${p.number_tzeh}`,
        is_active: true
      }))
    )
    const after = await PhoneTabel.countDocuments({})

    res.json({
      success: true,
      before,
      after,
      inserted: inserted.length
    })
  } catch (e) {
    next(e)
  }
}

module.exports = { repairPhones }
