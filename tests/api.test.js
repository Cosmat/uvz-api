const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../server/index')
const config = require('../config')

// Test database
const TEST_DB = config.mongoUri.replace('birga_01', 'birga_01_test')

beforeAll(async () => {
  await mongoose.connect(TEST_DB)
})

afterAll(async () => {
  await mongoose.connection.db.dropDatabase()
  await mongoose.connection.close()
})

describe('Health Check', () => {
  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.status).toBe('ok')
  })
})

describe('Auth', () => {
  let token

  test('POST /api/auth/register creates user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'password123', role: 'user' })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.user.username).toBe('testuser')
    expect(res.body.token).toBeDefined()
  })

  test('POST /api/auth/login returns token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'password123' })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.token).toBeDefined()
    token = res.body.token
  })

  test('GET /api/auth/me returns user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.username).toBe('testuser')
  })

  test('GET /api/auth/me fails without token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })
})

describe('Zayavki', () => {
  let authToken
  let zayavkaId

  beforeAll(async () => {
    // Login as admin
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' })
    authToken = res.body.token
  })

  test('POST /api/zayavki creates vacancy', async () => {
    const res = await request(app)
      .post('/api/zayavki')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        tzeh: '330',
        professia: 'Тестовый инженер',
        description: 'Тестовое описание',
        salary_min: 50000,
        salary_max: 70000,
        schedule: 'Полный день',
        experience_required: '1-3 года'
      })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.tzeh).toBe('330')
    zayavkaId = res.body.data._id
  })

  test('GET /api/zayavki returns paginated list', async () => {
    const res = await request(app).get('/api/zayavki?page=1&limit=10')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toBeInstanceOf(Array)
    expect(res.body.pagination).toBeDefined()
  })

  test('GET /api/zayavki with filters', async () => {
    const res = await request(app).get('/api/zayavki?tzeh=330&limit=5')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.every(z => z.tzeh === '330')).toBe(true)
  })

  test('GET /api/zayavki/:id returns single vacancy', async () => {
    const res = await request(app).get(`/api/zayavki/${zayavkaId}`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data._id).toBe(zayavkaId)
  })

  test('PATCH /api/zayavki/:id updates vacancy', async () => {
    const res = await request(app)
      .patch(`/api/zayavki/${zayavkaId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ salary_min: 60000 })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.salary_min).toBe(60000)
  })

  test('POST /api/zayavki validation fails for missing fields', async () => {
    const res = await request(app)
      .post('/api/zayavki')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ professia: 'Только профессия' })
    expect(res.status).toBe(422)
    expect(res.body.error).toBe('VALIDATION_ERROR')
  })
})

describe('Deshife', () => {
  let authToken

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' })
    authToken = res.body.token
  })

  test('GET /api/deshife returns list', async () => {
    const res = await request(app).get('/api/deshife?limit=5')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toBeInstanceOf(Array)
  })

  test('POST /api/deshife creates code (admin only)', async () => {
    const res = await request(app)
      .post('/api/deshife')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ shifr: '999', description: 'Тестовый код', category: 'Начисления' })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.shifr).toBe('999')
  })

  test('GET /api/deshife/:shifr returns single code', async () => {
    const res = await request(app).get('/api/deshife/999')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.shifr).toBe('999')
  })
})

describe('PhoneTabel', () => {
  test('GET /api/phones returns list', async () => {
    const res = await request(app).get('/api/phones?limit=5')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toBeInstanceOf(Array)
  })

  test('GET /api/phones/:tzeh returns single phone', async () => {
    const res = await request(app).get('/api/phones/330')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.number_tzeh).toBe('330')
  })
})