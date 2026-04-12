const { Router } = require('express')
const { getDb } = require('../db')

module.exports = function budgetsRouter(dbPath) {
  const router = Router()

  // GET /api/budgets?month=YYYY-MM
  router.get('/', (req, res) => {
    const { month } = req.query
    const db = getDb(dbPath)
    const rows = month
      ? db.prepare('SELECT * FROM budgets WHERE month = ?').all(month)
      : db.prepare('SELECT * FROM budgets ORDER BY month DESC').all()
    res.json(rows.map((r) => ({
      id: r.id,
      category: r.category,
      month: r.month,
      amount: r.amount,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })))
  })

  // POST /api/budgets  { id, category, month, amount } — upserts by category+month
  router.post('/', (req, res) => {
    const { id, category, month, amount } = req.body
    if (!category || !month) return res.status(400).json({ error: 'missing fields' })
    const db = getDb(dbPath)
    const existing = db.prepare('SELECT id FROM budgets WHERE category = ? AND month = ?').get(category, month)
    if (existing) {
      db.prepare(`UPDATE budgets SET amount = ?, updated_at = datetime('now') WHERE id = ?`)
        .run(Number(amount) || 0, existing.id)
      res.json({ ok: true, id: existing.id })
    } else {
      db.prepare(`INSERT INTO budgets (id, category, month, amount) VALUES (?, ?, ?, ?)`)
        .run(id, category, month, Number(amount) || 0)
      res.status(201).json({ ok: true, id })
    }
  })

  // DELETE /api/budgets/:id
  router.delete('/:id', (req, res) => {
    const db = getDb(dbPath)
    db.prepare('DELETE FROM budgets WHERE id = ?').run(req.params.id)
    res.json({ ok: true })
  })

  return router
}
