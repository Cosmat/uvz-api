const PhoneTabel = require('../models/PhoneTabel')
const { AppError } = require('../utils/AppError')

class PhoneTabelService {
  async getAll({ page = 1, limit = 100, activeOnly = true, search } = {}) {
    const query = activeOnly ? { is_active: true } : {}
    if (search) {
      const rx = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      query.$or = [
        { number_tzeh: { $regex: rx, $options: 'i' } },
        { phone_number: { $regex: rx, $options: 'i' } },
        { description: { $regex: rx, $options: 'i' } }
      ]
    }
    
    const skip = (page - 1) * limit
    
    const [data, total] = await Promise.all([
      PhoneTabel.find(query).sort({ number_tzeh: 1 }).skip(skip).limit(limit).lean(),
      PhoneTabel.countDocuments(query)
    ])

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  async getByTzeh(number_tzeh) {
    const item = await PhoneTabel.findOne({ number_tzeh }).lean()
    if (!item) {
      throw new AppError('Phone not found for this workshop', 404, 'PHONE_NOT_FOUND')
    }
    return item
  }

  async create(data) {
    const item = new PhoneTabel(data)
    await item.save()
    return item.toObject()
  }

  async bulkCreate(items) {
    const ops = items.map(item => ({
      updateOne: {
        filter: { number_tzeh: item.number_tzeh },
        update: { $set: item },
        upsert: true
      }
    }))
    const result = await PhoneTabel.bulkWrite(ops)
    return result
  }

  async update(number_tzeh, data) {
    const item = await PhoneTabel.findOneAndUpdate(
      { number_tzeh },
      { $set: data },
      { new: true, runValidators: true }
    ).lean()
    
    if (!item) {
      throw new AppError('Phone not found for this workshop', 404, 'PHONE_NOT_FOUND')
    }
    return item
  }

  async delete(number_tzeh) {
    const result = await PhoneTabel.findOneAndDelete({ number_tzeh })
    if (!result) {
      throw new AppError('Phone not found for this workshop', 404, 'PHONE_NOT_FOUND')
    }
    return { deleted: true }
  }
}

module.exports = new PhoneTabelService()