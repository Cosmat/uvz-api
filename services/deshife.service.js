const Deshife = require('../models/Deshife')
const { AppError } = require('../utils/AppError')

class DeshifeService {
  async getAll({ page = 1, limit = 100, category, search } = {}) {
    const query = {}
    if (category) query.category = category
    if (search) {
      query.$or = [
        { shifr: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (page - 1) * limit
    
    const [data, total] = await Promise.all([
      Deshife.find(query).sort({ shifr: 1 }).skip(skip).limit(limit).lean(),
      Deshife.countDocuments(query)
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

  async getByShifr(shifr) {
    const item = await Deshife.findOne({ shifr }).lean()
    if (!item) {
      throw new AppError('Code not found', 404, 'DESHIFE_NOT_FOUND')
    }
    return item
  }

  async create(data) {
    const item = new Deshife(data)
    await item.save()
    return item.toObject()
  }

  async bulkCreate(items) {
    const ops = items.map(item => ({
      updateOne: {
        filter: { shifr: item.shifr },
        update: { $set: item },
        upsert: true
      }
    }))
    const result = await Deshife.bulkWrite(ops)
    return result
  }

  async update(shifr, data) {
    const item = await Deshife.findOneAndUpdate(
      { shifr },
      { $set: data },
      { new: true, runValidators: true }
    ).lean()
    
    if (!item) {
      throw new AppError('Code not found', 404, 'DESHIFE_NOT_FOUND')
    }
    return item
  }

  async delete(shifr) {
    const result = await Deshife.findOneAndDelete({ shifr })
    if (!result) {
      throw new AppError('Code not found', 404, 'DESHIFE_NOT_FOUND')
    }
    return { deleted: true }
  }

  async getCategories() {
    const cats = await Deshife.distinct('category')
    return (cats || []).filter(c => c !== null && c !== undefined)
  }
}

module.exports = new DeshifeService()