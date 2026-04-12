const { Router } = require('express')
const { getDb } = require('../db')

module.exports = function depositsRouter(dbPath) {
  const router = Router()

  // GET /api/deposits?goalId=xxx
  router.get('/', (req, res) => {
    const { goalId } = req.query
    if (!goalId) return res.status(400).json({ error: 'goalId required' })
    const db = getDb(dbPath)
    const rows = db.prepare(
      'SELECT * FROM deposits WHERE goal_id = ? ORDER BY created_at DESC'
    ).all(goalId)
    res.json(rows.map((r) => ({
      id: r.id,
      goalId: r.goal_id,
      amount: r.amount,
      month: r.month,
      note: r.note,
      createdAt: r.created_at,
    })))
  })

  // POST /api/deposits  { id, goalId, amount, month, note }
  router.post('/', (req, res) => {
    const { id, goalId, amount, month, note } = req.body
    if (!id || !goalId || !amount || !month) return res.status(400).json({ error: 'missing fields' })
    const db = getDb(dbPath)
    db.prepare(`INSERT INTO deposits (id, goal_id, amount, month, note) VALUES (?, ?, ?, ?, ?)`)
      .run(id, goalId, Number(amount), month, note || '')
    // Recompute saved_amount from all deposits for this goal
    const { total } = db.prepare(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM deposits WHERE goal_id = ?'
    ).get(goalId)
    db.prepare(`UPDATE goals SET saved_amount = ?, updated_at = datetime('now') WHERE id = ?`)
      .run(total, goalId)
    res.status(201).json({ ok: true, id, newSavedAmount: total })
  })

  // DELETE /api/deposits/:id
  router.delete('/:id', (req, res) => {
    const db = getDb(dbPath)
    const row = db.prepare('SELECT goal_id FROM deposits WHERE id = ?').get(req.params.id)
    if (!row) return res.status(404).json({ error: 'not found' })
    db.prepare('DELETE FROM deposits WHERE id = ?').run(req.params.id)
    const { total } = db.prepare(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM deposits WHERE goal_id = ?'
    ).get(row.goal_id)
    db.prepare(`UPDATE goals SET saved_amount = ?, updated_at = datetime('now') WHERE id = ?`)
      .run(total, row.goal_id)
    res.json({ ok: true, goalId: row.goal_id, newSavedAmount: total })
  })

  return router
}
