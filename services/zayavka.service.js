const Zayavka = require('../models/Zayavka')
const { AppError } = require('../utils/AppError')

class ZayavkaService {
  // Get paginated list with filters
  async getAll({ page = 1, limit = 20, filters = {}, sort = '-createdAt' }) {
    const query = { status: 'Активная', ...filters }
    
    // Remove empty filters
    Object.keys(query).forEach(key => {
      if (query[key] === '' || query[key] === undefined || query[key] === null) {
        delete query[key]
      }
    })

    const skip = (page - 1) * limit
    
    const [data, total] = await Promise.all([
      Zayavka.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Zayavka.countDocuments(query)
    ])

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  }

  // Get by ID
  async getById(id) {
    const zayavka = await Zayavka.findById(id).lean()
    if (!zayavka) {
      throw new AppError('Vacancy not found', 404, 'ZAYAVKA_NOT_FOUND')
    }
    return zayavka
  }

  // Create new
  async create(data) {
    const zayavka = new Zayavka(data)
    await zayavka.save()
    return zayavka.toObject()
  }

  // Update
  async update(id, data) {
    const zayavka = await Zayavka.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean()
    
    if (!zayavka) {
      throw new AppError('Vacancy not found', 404, 'ZAYAVKA_NOT_FOUND')
    }
    return zayavka
  }

  // Soft delete (archive)
  async archive(id) {
    const zayavka = await Zayavka.findByIdAndUpdate(
      id,
      { status: 'Архивная' },
      { new: true }
    ).lean()
    
    if (!zayavka) {
      throw new AppError('Vacancy not found', 404, 'ZAYAVKA_NOT_FOUND')
    }
    return zayavka
  }

  // Hard delete
  async delete(id) {
    const result = await Zayavka.findByIdAndDelete(id)
    if (!result) {
      throw new AppError('Vacancy not found', 404, 'ZAYAVKA_NOT_FOUND')
    }
    return { deleted: true }
  }

  // Get by creator
  async getByCreator(creatorId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit
    
    const [data, total] = await Promise.all([
      Zayavka.find({ id_sozdatelya: creatorId }).sort('-createdAt').skip(skip).limit(limit).lean(),
      Zayavka.countDocuments({ id_sozdatelya: creatorId })
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

  // Search with text index
  async search(text, { page = 1, limit = 20 } = {}) {
    if (!text || text.trim().length < 2) {
      return this.getAll({ page, limit })
    }

    const skip = (page - 1) * limit
    
    const [data, total] = await Promise.all([
      Zayavka.find(
        { $text: { $search: text }, status: 'Активная' },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .lean(),
      Zayavka.countDocuments({ $text: { $search: text }, status: 'Активная' })
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

  // Get stats
  async getStats() {
    const [total, active, byTzeh, bySchedule] = await Promise.all([
      Zayavka.countDocuments(),
      Zayavka.countDocuments({ status: 'Активная' }),
      Zayavka.aggregate([
        { $match: { status: 'Активная' } },
        { $group: { _id: '$tzeh', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]),
      Zayavka.aggregate([
        { $match: { status: 'Активная' } },
        { $group: { _id: '$schedule', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ])

    return { total, active, byTzeh, bySchedule }
  }
}

module.exports = new ZayavkaService()