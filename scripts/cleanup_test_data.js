// Verify creator binding + cleanup all smoke-test data
require('dotenv').config()
const mongoose = require('mongoose')

const guestId = process.argv[2]
const userVacId = process.argv[3]
const username = process.argv[4]

async function run() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  const Zayavka = mongoose.connection.collection('zayavkas')
  const User = mongoose.connection.collection('users')

  // 1) Check the creator binding of the user-created vacancy
  const vac = await Zayavka.findOne({ _id: new mongoose.Types.ObjectId(userVacId) })
  const u = await User.findOne({ username })
  const bound = vac && u && String(vac.id_sozdatelya) === String(u._id)
  console.log('привязка автора: ' + (bound ? 'ОК — id_sozdatelya == user._id' : `ПРОВАЛ (vac.creator=${vac && vac.id_sozdatelya}, user._id=${u && u._id})`))

  // 2) Count test data before cleanup
  const before = await Zayavka.countDocuments({ $or: [
    { _id: { $in: [new mongoose.Types.ObjectId(guestId), new mongoose.Types.ObjectId(userVacId)] } },
    { professia: /^тест( аноним| пользователь| лимит)?$/ }
  ]})
  console.log('тестовых вакансий к удалению: ' + before)

  // 3) Delete test vacancies
  const del = await Zayavka.deleteMany({ $or: [
    { _id: { $in: [new mongoose.Types.ObjectId(guestId), new mongoose.Types.ObjectId(userVacId)] } },
    { professia: /^тест( аноним| пользователь| лимит)?$/ }
  ]})
  console.log('удалено вакансий: ' + del.deletedCount)

  // 4) Delete smoke user
  const delUser = await User.deleteOne({ username })
  console.log('удалён тестовый пользователь: ' + (delUser.deletedCount === 1 ? 'да' : 'нет'))

  // 5) Final state
  const total = await Zayavka.countDocuments({ status: 'Активная' })
  const users = await User.countDocuments({})
  console.log(`итого в базе: активных вакансий ${total}, пользователей ${users}`)
  await mongoose.connection.close()
}
run().catch(e => { console.error('ОШИБКА:', e.message); process.exit(1) })
