const { Router } = require('express')
const { getDb } = require('../db')

function toClientAI(row) {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    applied: row.applied === 1,
    hasLogo: row.has_logo === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toClientLaptop(row) {
  return {
    id: row.id,
    name: row.name,
    ram: row.ram || '',
    ssd: row.ssd || '',
    gpu: row.gpu || '',
    processor: row.processor || '',
    totalAmount: row.total_amount,
    monthlyAmount: row.monthly_amount,
    startDate: row.start_date || '',
    hasImage: row.has_image === 1,
    applied: row.applied !== 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

module.exports = function reimbursementsRouter(dbPath) {
  const router = Router()

  // ── AI Reimbursements ──────────────────────────────────────────────────

  router.get('/ai', (req, res) => {
    const db = getDb(dbPath)
    const rows = db.prepare('SELECT * FROM ai_reimbursements ORDER BY created_at DESC').all()
    res.json(rows.map(toClientAI))
  })

  router.post('/ai', (req, res) => {
    const { id, name, amount, applied, hasLogo } = req.body
    const db = getDb(dbPath)
    db.prepare(`
      INSERT INTO ai_reimbursements (id, name, amount, applied, has_logo)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, amount ?? 10, applied ? 1 : 0, hasLogo ? 1 : 0)
    const row = db.prepare('SELECT * FROM ai_reimbursements WHERE id = ?').get(id)
    res.status(201).json(toClientAI(row))
  })

  router.patch('/ai/:id', (req, res) => {
    const db = getDb(dbPath)
    const row = db.prepare('SELECT * FROM ai_reimbursements WHERE id = ?').get(req.params.id)
    if (!row) return res.status(404).json({ error: 'not found' })
    const name = req.body.name !== undefined ? req.body.name : row.name
    const amount = req.body.amount !== undefined ? req.body.amount : row.amount
    const applied = req.body.applied !== undefined ? (req.body.applied ? 1 : 0) : row.applied
    const hasLogo = req.body.hasLogo !== undefined ? (req.body.hasLogo ? 1 : 0) : row.has_logo
    db.prepare(`
      UPDATE ai_reimbursements
      SET name = ?, amount = ?, applied = ?, has_logo = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(name, amount, applied, hasLogo, req.params.id)
    const updated = db.prepare('SELECT * FROM ai_reimbursements WHERE id = ?').get(req.params.id)
    res.json(toClientAI(updated))
  })

  router.delete('/ai/:id', (req, res) => {
    const db = getDb(dbPath)
    db.prepare('DELETE FROM ai_reimbursements WHERE id = ?').run(req.params.id)
    res.json({ ok: true })
  })

  // ── Laptop Reimbursements ─────────────────────────────────────────────

  router.get('/laptop', (req, res) => {
    const db = getDb(dbPath)
    const rows = db.prepare('SELECT * FROM laptop_reimbursements ORDER BY created_at DESC').all()
    res.json(rows.map(toClientLaptop))
  })

  router.post('/laptop', (req, res) => {
    const { id, name, ram, ssd, gpu, processor, totalAmount, monthlyAmount, startDate, hasImage } = req.body
    const db = getDb(dbPath)
    const monthly = monthlyAmount ?? (totalAmount ? totalAmount / 36 : 0)
    db.prepare(`
      INSERT INTO laptop_reimbursements (id, name, ram, ssd, gpu, processor, total_amount, monthly_amount, start_date, has_image, applied)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, ram || '', ssd || '', gpu || '', processor || '', totalAmount || 0, monthly, startDate || '', hasImage ? 1 : 0, 1)
    const row = db.prepare('SELECT * FROM laptop_reimbursements WHERE id = ?').get(id)
    res.status(201).json(toClientLaptop(row))
  })

  router.patch('/laptop/:id', (req, res) => {
    const db = getDb(dbPath)
    const row = db.prepare('SELECT * FROM laptop_reimbursements WHERE id = ?').get(req.params.id)
    if (!row) return res.status(404).json({ error: 'not found' })
    const name = req.body.name !== undefined ? req.body.name : row.name
    const ram = req.body.ram !== undefined ? req.body.ram : row.ram
    const ssd = req.body.ssd !== undefined ? req.body.ssd : row.ssd
    const gpu = req.body.gpu !== undefined ? req.body.gpu : row.gpu
    const processor = req.body.processor !== undefined ? req.body.processor : row.processor
    const totalAmount = req.body.totalAmount !== undefined ? req.body.totalAmount : row.total_amount
    const monthlyAmount = req.body.monthlyAmount !== undefined ? req.body.monthlyAmount : (totalAmount / 36)
    const startDate = req.body.startDate !== undefined ? req.body.startDate : row.start_date
    const hasImage = req.body.hasImage !== undefined ? (req.body.hasImage ? 1 : 0) : row.has_image
    const applied = req.body.applied !== undefined ? (req.body.applied ? 1 : 0) : (row.applied !== 0 ? 1 : 0)
    db.prepare(`
      UPDATE laptop_reimbursements
      SET name = ?, ram = ?, ssd = ?, gpu = ?, processor = ?,
          total_amount = ?, monthly_amount = ?, start_date = ?, has_image = ?, applied = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(name, ram, ssd, gpu, processor, totalAmount, monthlyAmount, startDate, hasImage, applied, req.params.id)
    const updated = db.prepare('SELECT * FROM laptop_reimbursements WHERE id = ?').get(req.params.id)
    res.json(toClientLaptop(updated))
  })

  router.delete('/laptop/:id', (req, res) => {
    const db = getDb(dbPath)
    db.prepare('DELETE FROM laptop_reimbursements WHERE id = ?').run(req.params.id)
    res.json({ ok: true })
  })

  return router
}
