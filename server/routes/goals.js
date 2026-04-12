const { Router } = require('express')
const { getDb } = require('../db')

function toClient(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    targetAmount: row.target_amount,
    savedAmount: row.saved_amount,
    hasImage: row.has_image === 1,
    savingsRate: row.savings_rate ?? 0.10,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

module.exports = function goalsRouter(dbPath) {
  const router = Router()

  router.get('/', (req, res) => {
    const db = getDb(dbPath)
    const rows = db.prepare('SELECT * FROM goals ORDER BY created_at DESC').all()
    res.json(rows.map(toClient))
  })

  router.post('/', (req, res) => {
    const { id, name, description, targetAmount, savedAmount, hasImage, savingsRate } = req.body
    const db = getDb(dbPath)
    db.prepare(`
      INSERT INTO goals (id, name, description, target_amount, saved_amount, has_image, savings_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, description || '', targetAmount, savedAmount || 0, hasImage ? 1 : 0, savingsRate ?? 0.10)
    const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(id)
    res.status(201).json(toClient(row))
  })

  router.patch('/:id', (req, res) => {
    const { savedAmount, savingsRate } = req.body
    const db = getDb(dbPath)
    const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id)
    if (!row) return res.status(404).json({ error: 'not found' })
    const newSaved = savedAmount !== undefined ? savedAmount : row.saved_amount
    const newRate = savingsRate !== undefined ? savingsRate : (row.savings_rate ?? 0.10)
    db.prepare(`
      UPDATE goals SET saved_amount = ?, savings_rate = ?, updated_at = datetime('now') WHERE id = ?
    `).run(newSaved, newRate, req.params.id)
    const updated = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id)
    res.json(toClient(updated))
  })

  router.delete('/:id', (req, res) => {
    const db = getDb(dbPath)
    db.prepare('DELETE FROM goals WHERE id = ?').run(req.params.id)
    res.json({ ok: true })
  })

  return router
}
