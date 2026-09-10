const { model, Schema } = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 1,
    maxlength: 30
  },
  password: {
    type: String,
    required: true,
    minlength: 1,
    select: false // Never return password in queries
  },
  role: {
    type: String,
    enum: ['admin', 'moderator', 'user'],
    default: 'user'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_login: {
    type: Date
  }
}, {
  timestamps: true,
  versionKey: false
})

// unique: true already creates index, no need for explicit index()

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = model('User', userSchema)