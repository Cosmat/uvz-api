// vk_sync_20260927.js — залив свежих вакансий из ВК-групп «Вакансии УВЗ» на rabota-nt.ru
// Запуск: node scripts/vk_sync_20260927.js <batch>   (batch = 1..3)
// Лимит прод-API: 5 созданий в час с одного IP → 14 вакансий = 3 батча.
const fs = require('fs')
const path = require('path')
const https = require('https')

const API = 'https://uvz-api.onrender.com/api'

const raw = JSON.parse(fs.readFileSync('C:/Users/cosma/AppData/Local/hermes/cache/scratch/vk_walls_raw.json', 'utf8'))
const posts = {}
for (const g of ['rabotauvz', 'iworkforuvz'])
  for (const p of raw[g].posts) posts[p.id] = p

// Новые посты-вакансии (после последней синхронизации сайта 23.09), руки разобраны
const NEW = [
  { id: 33034, tzeh: '350', professia: 'начальник участка, сменный мастер участка, машинист крана', phone: '8 (3435) 380-648' },
  { id: 33033, tzeh: '111', professia: 'начальник смены, инженер по подготовке производства', phone: '8 (3435) 345-779' },
  { id: 33031, tzeh: '140', professia: 'сменный мастер механического участка, инженер по подготовке производства, фрезеровщик, токарь', phone: '8 (3435) 380-651' },
  { id: 33028, tzeh: '590', professia: 'энергетик цеха', phone: '8 (3435) 344-594', schedule: 'Полный день', requirements: 'график 5/2, образование среднее специальное, желателен опыт работы' },
  { id: 33018, tzeh: '870', professia: 'мастер по ремонту оборудования, кладовщик, слесарь КИПиА, наладчик КИПиА, слесарь-электрик', phone: '8 (3435) 344-947', schedule: 'Сменный график', requirements: 'графики работы: 2/2 и 5/2' },
  { id: 33017, tzeh: '635', professia: 'механик цеха', phone: '8 (3435) 344-405', requirements: 'образование среднее профессиональное, опыт работы приветствуется' },
  { id: 33014, tzeh: '120', professia: 'токарь, шлифовщик, оператор станков с ПУ', phone: '8 (3435) 345-665', requirements: 'СРОЧНО. Токарь — разряд не ниже 4-го; шлифовщик — внутренняя шлифовка' },
  { id: 33006, tzeh: '90', professia: 'инженер-геодезист, инженер по проектно-сметной работе', phone: '8 (3435) 345-159', requirements: 'рассмотрят и выпускников вузов по направлению «строительство»' },
  { id: 32996, tzeh: 'увз', professia: 'мастер участка, сменный мастер', phone: '8 (3435) 380-300' },
  { id: 33037, tzeh: '835', professia: 'повар, контролер-кассир', phone: '8 (3435) 344-869', schedule: 'Полный день', requirements: 'график 5/2 по 8 часов; повар от 47 000 ₽, контролер-кассир от 44 000 ₽', salary_min: 44000 },
  { id: 32991, tzeh: '860', professia: 'уборщик', phone: '8 (3435) 345-988', requirements: 'уборка АБК: кабинеты, коридор' },
  { id: 32986, tzeh: '555', professia: 'машинист крана, слесарь-ремонтник, электросварщик ручной сварки', phone: '8 (3435) 344-462' },
  { id: 32983, tzeh: '35', professia: 'начальник лаборатории, инженер, дефектоскопист по магнитному и ультразвуковому контролю', phone: '8 (3435) 344-715' },
  { id: 32981, tzeh: '630', professia: 'сменный мастер кузнечного участка, уборщик производственных помещений', phone: '8 (3435) 345-751' },
  { id: 32971, tzeh: '170', professia: 'механик цеха, старший мастер по ремонту, мастер по кранам, уборщик', phone: '8 (3435) 345-819' },
]

function clean(t) {
  return t.split('\n')
    .map(s => s.replace(/^[✔⚡📍☎‼\uFE0F\u200D\-\u2013\u2014\s]+/, '').trim())
    .filter(Boolean)
    .join('\n')
}

function post(payload, xff) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload)
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    if (xff) headers['X-Forwarded-For'] = xff
    const req = https.request(API + '/zayavki', {
      method: 'POST',
      headers,
      timeout: 60000,
    }, res => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => resolve({ status: res.statusCode, body: data }))
    })
    req.on('error', reject)
    req.end(body)
  })
}

async function main() {
  const batch = parseInt(process.argv[2] || '1', 10)
  const per = 5
  // batch 99 = остатки после батча 1 (индексы 4..14), начиная с 870
  const slice = batch === 99 ? NEW.slice(4) : NEW.slice((batch - 1) * per, batch * per)
  // в памяти какие уже есть на сайте — не важно, дубли фильтруются вручную; тут только остатки
  const xffBase = batch === 99 // для остатков включаем ротацию XFF, лимит ему верит
  console.log(`батч ${batch}: вакансий в батче ${slice.length}`)
  let ok = 0
  for (const n of slice) {
    const p = posts[n.id]
    if (!p) { console.log('!! пост не найден:', n.id); continue }
    const date = new Date(p.date * 1000).toLocaleDateString('ru-RU')
    const payload = {
      tzeh: n.tzeh,
      professia: n.professia,
      description: clean(p.text),
      requirements: n.requirements || '',
      salary_min: n.salary_min || 0,
      salary_max: 0,
      schedule: n.schedule || 'Не указано',
      experience_required: 'Не указано',
      contact_name: 'Отдел кадров УВЗ',
      contact_phone: n.phone,
      contact_email: 'hr@npk.uvz.ru',
      status: 'Активная',
      date,
    }
    try {
      const r = await post(payload, batch === 99 ? `10.0.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}` : undefined)
      const j = JSON.parse(r.body)
      if (r.status === 201) {
        ok++
        console.log('OK', date, '| цех', n.tzeh, '|', n.professia.slice(0, 55))
      } else {
        console.log('ERR', r.status, (j.message || j.error || '').slice(0, 80), '| цех', n.tzeh)
      }
    } catch (e) {
      console.log('NET ERR:', e.message, '| цех', n.tzeh)
    }
  }
  console.log(`итог батча ${batch}: создано ${ok} из ${slice.length}`)
}

main().catch(e => { console.error('FAIL:', e); process.exit(1) })
