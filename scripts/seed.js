require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const Zayavka = require('../models/Zayavka')
const Deshife = require('../models/Deshife')
const PhoneTabel = require('../models/PhoneTabel')
const User = require('../models/User')

const config = require('../config')

async function seed() {
  try {
    await mongoose.connect(config.mongoUri)
    console.log('🔌 Connected to MongoDB')

    // Clear existing data (optional - comment out to keep existing)
    // await Zayavka.deleteMany({})
    // await Deshife.deleteMany({})
    // await PhoneTabel.deleteMany({})
    // await User.deleteMany({})

    // Create admin user
    const adminExists = await User.findOne({ username: 'admin' })
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        password: 'admin123', // Will be hashed by pre-save hook
        role: 'admin'
      })
      await admin.save()
      console.log('✅ Admin user created: admin / admin123')
    } else {
      console.log('ℹ️ Admin user already exists')
    }

    console.log('✅ Seeding complete')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding error:', error)
    process.exit(1)
  }
}

seed()