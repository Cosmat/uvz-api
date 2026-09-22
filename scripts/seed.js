require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const Zayavka = require('../models/Zayavka')
const Deshife = require('../models/Deshife')
const PhoneTabel = require('../models/PhoneTabel')
const User = require('../models/User')

const config = require('../config')

// Phone data for 36 цехов
const phonesData = [
  { number_tzeh: '100', phone_number: '+7 (3435) 344-100', description: 'Цех 100 - Главный диспетчер' },
  { number_tzeh: '113', phone_number: '+7 (3435) 344-113', description: 'Цех 113 - Подготовка производства' },
  { number_tzeh: '114', phone_number: '+7 (3435) 344-114', description: 'Цех 114 - Нормоконтроль' },
  { number_tzeh: '116', phone_number: '+7 (3435) 344-116', description: 'Цех 116 - ОТК' },
  { number_tzeh: '120', phone_number: '+7 (3435) 344-120', description: 'Цех 120 - Метрология' },
  { number_tzeh: '125', phone_number: '+7 (3435) 344-125', description: 'Цех 125 - Стандартизация' },
  { number_tzeh: '135', phone_number: '+7 (3435) 344-135', description: 'Цех 135 - Проектный' },
  { number_tzeh: '140', phone_number: '+7 (3435) 344-140', description: 'Цех 140 - Технологический' },
  { number_tzeh: '150', phone_number: '+7 (3435) 344-150', description: 'Цех 150 - Конструкторский' },
  { number_tzeh: '160', phone_number: '+7 (3435) 344-160', description: 'Цех 160 - Испытания' },
  { number_tzeh: '170', phone_number: '+7 (3435) 344-170', description: 'Цех 170 - Качество' },
  { number_tzeh: '180', phone_number: '+7 (3435) 344-180', description: 'Цех 180 - Сертификация' },
  { number_tzeh: '200', phone_number: '+7 (3435) 344-200', description: 'Цех 200 - Главный энергетик' },
  { number_tzeh: '210', phone_number: '+7 (3435) 344-210', description: 'Цех 210 - Энергосбыт' },
  { number_tzeh: '220', phone_number: '+7 (3435) 344-220', description: 'Цех 220 - Теплоснабжение' },
  { number_tzeh: '230', phone_number: '+7 (3435) 344-230', description: 'Цех 230 - Водоснабжение' },
  { number_tzeh: '240', phone_number: '+7 (3435) 344-240', description: 'Цех 240 - Вентиляция' },
  { number_tzeh: '250', phone_number: '+7 (3435) 344-250', description: 'Цех 250 - Газовое хозяйство' },
  { number_tzeh: '300', phone_number: '+7 (3435) 344-300', description: 'Цех 300 - Транспортный' },
  { number_tzeh: '310', phone_number: '+7 (3435) 344-310', description: 'Цех 310 - Автоколонна' },
  { number_tzeh: '320', phone_number: '+7 (3435) 344-320', description: 'Цех 320 - Железнодорожный' },
  { number_tzeh: '330', phone_number: '+7 (3435) 344-330', description: 'Цех 330 - Складской' },
  { number_tzeh: '340', phone_number: '+7 (3435) 344-340', description: 'Цех 340 - Таможенный' },
  { number_tzeh: '350', phone_number: '+7 (3435) 344-350', description: 'Цех 350 - Экспедиция' },
  { number_tzeh: '400', phone_number: '+7 (3435) 344-400', description: 'Цех 400 - Комбинат питания' },
  { number_tzeh: '410', phone_number: '+7 (3435) 344-410', description: 'Цех 410 - Столовая' },
  { number_tzeh: '420', phone_number: '+7 (3435) 344-420', description: 'Цех 420 - Буфет' },
  { number_tzeh: '430', phone_number: '+7 (3435) 344-430', description: 'Цех 430 - Пекарня' },
  { number_tzeh: '440', phone_number: '+7 (3435) 344-440', description: 'Цех 440 - Мясной цех' },
  { number_tzeh: '450', phone_number: '+7 (3435) 344-450', description: 'Цех 450 - Овощехранилище' },
  { number_tzeh: '500', phone_number: '+7 (3435) 344-500', description: 'Цех 500 - Поликлиника' },
  { number_tzeh: '510', phone_number: '+7 (3435) 344-510', description: 'Цех 510 - Стоматология' },
  { number_tzeh: '520', phone_number: '+7 (3435) 344-520', description: 'Цех 520 - Лаборатория' },
  { number_tzeh: '530', phone_number: '+7 (3435) 344-530', description: 'Цех 530 - Профилактика' },
  { number_tzeh: '540', phone_number: '+7 (3435) 344-540', description: 'Цех 540 - Санаторий' },
  { number_tzeh: '550', phone_number: '+7 (3435) 344-550', description: 'Цех 550 - Аптека' }
]

async function seed() {
  try {
    await mongoose.connect(config.mongoUri)
    console.log('🔌 Connected to MongoDB')

    // Create admin user
    const adminExists = await User.findOne({ username: 'admin' })
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      })
      await admin.save()
      console.log('✅ Admin user created: admin / admin123')
    } else {
      console.log('ℹ️ Admin user already exists')
    }

    // Seed phones
    console.log('📱 Seeding phones...')
    for (const phone of phonesData) {
      await PhoneTabel.findOneAndUpdate(
        { number_tzeh: phone.number_tzeh },
        { $set: phone },
        { upsert: true, new: true }
      )
    }
    console.log(`✅ ${phonesData.length} phones seeded/updated`)

    console.log('✅ Seeding complete')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding error:', error)
    process.exit(1)
  }
}

seed()