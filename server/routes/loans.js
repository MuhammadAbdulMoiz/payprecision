const express = require('express')
const { randomUUID } = require('crypto')
const { getDb } = require('../db')

function toClient(row) {
  const totalPaid = row.total_paid ?? 0
  return {
    id: row.id,
    lenderName: row.lender_name,
    amount: row.amount,
    currency: row.currency,
    loanDate: row.loan_date,
    purpose: row.purpose,
    goalId: row.goal_id,
    monthlyInstallment: row.monthly_installment,
    status: row.status,
    notes: row.notes,
    hasImage: row.has_image === 1,
    createdAt: row.created_at,
    totalPaid,
    remaining: Math.max(row.amount - totalPaid, 0),
  }
}

function toPaymentClient(row) {
  return {
    id: row.id,
    loanId: row.loan_id,
    amount: row.amount,
    paymentDate: row.payment_date,
    note: row.note,
    createdAt: row.created_at,
  }
}

module.exports = function loansRouter(dbPath) {
  const router = express.Router()
  const db = () => getDb(dbPath)

  // ── Loans ──────────────────────────────────────────────────────────────────
  router.get('/', (_req, res) => {
    const rows = db().prepare(`
      SELECT l.*, COALESCE(SUM(p.amount), 0) as total_paid
      FROM loans l
      LEFT JOIN loan_payments p ON p.loan_id = l.id
      GROUP BY l.id
      ORDER BY l.loan_date DESC
    `).all()
    res.json(rows.map(toClient))
  })

  router.post('/', (req, res) => {
    const { lenderName, amount, currency = 'PKR', loanDate, purpose = '', goalId = null, monthlyInstallment = 0, notes = '' } = req.body
    if (!lenderName || !loanDate) return res.status(400).json({ error: 'lenderName and loanDate are required' })
    const id = randomUUID()
    db().prepare(`
      INSERT INTO loans (id, lender_name, amount, currency, loan_date, purpose, goal_id, monthly_installment, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, lenderName, Number(amount) || 0, currency, loanDate, purpose, goalId || null, Number(monthlyInstallment) || 0, notes)
    const row = db().prepare('SELECT * FROM loans WHERE id = ?').get(id)
    res.status(201).json(toClient(row))
  })

  router.patch('/:id', (req, res) => {
    const { id } = req.params
    const row = db().prepare('SELECT * FROM loans WHERE id = ?').get(id)
    if (!row) return res.status(404).json({ error: 'Not found' })

    const updated = {
      lender_name: req.body.lenderName ?? row.lender_name,
      amount: req.body.amount !== undefined ? Number(req.body.amount) : row.amount,
      currency: req.body.currency ?? row.currency,
      loan_date: req.body.loanDate ?? row.loan_date,
      purpose: req.body.purpose ?? row.purpose,
      goal_id: req.body.goalId !== undefined ? (req.body.goalId || null) : row.goal_id,
      monthly_installment: req.body.monthlyInstallment !== undefined ? Number(req.body.monthlyInstallment) : row.monthly_installment,
      status: req.body.status ?? row.status,
      notes: req.body.notes ?? row.notes,
      has_image: req.body.hasImage !== undefined ? (req.body.hasImage ? 1 : 0) : row.has_image,
    }

    db().prepare(`
      UPDATE loans SET lender_name=?, amount=?, currency=?, loan_date=?, purpose=?, goal_id=?,
        monthly_installment=?, status=?, notes=?, has_image=?, updated_at=datetime('now')
      WHERE id=?
    `).run(updated.lender_name, updated.amount, updated.currency, updated.loan_date,
      updated.purpose, updated.goal_id, updated.monthly_installment, updated.status,
      updated.notes, updated.has_image, id)

    res.json(toClient(db().prepare(`
      SELECT l.*, COALESCE(SUM(p.amount), 0) as total_paid
      FROM loans l LEFT JOIN loan_payments p ON p.loan_id = l.id
      WHERE l.id = ? GROUP BY l.id
    `).get(id)))
  })

  router.delete('/:id', (req, res) => {
    db().prepare('DELETE FROM loan_payments WHERE loan_id = ?').run(req.params.id)
    db().prepare('DELETE FROM loans WHERE id = ?').run(req.params.id)
    res.json({ ok: true })
  })

  // ── Payments ───────────────────────────────────────────────────────────────
  router.get('/:id/payments', (req, res) => {
    const rows = db().prepare('SELECT * FROM loan_payments WHERE loan_id = ? ORDER BY payment_date DESC').all(req.params.id)
    res.json(rows.map(toPaymentClient))
  })

  router.post('/:id/payments', (req, res) => {
    const { amount, paymentDate, note = '' } = req.body
    if (!amount || !paymentDate) return res.status(400).json({ error: 'amount and paymentDate are required' })
    const payId = randomUUID()
    db().prepare('INSERT INTO loan_payments (id, loan_id, amount, payment_date, note) VALUES (?, ?, ?, ?, ?)')
      .run(payId, req.params.id, Number(amount), paymentDate, note)

    const totalPaid = db().prepare('SELECT COALESCE(SUM(amount),0) as total FROM loan_payments WHERE loan_id = ?').get(req.params.id).total
    const loan = db().prepare('SELECT * FROM loans WHERE id = ?').get(req.params.id)
    if (loan && totalPaid >= loan.amount) {
      db().prepare("UPDATE loans SET status='paid', updated_at=datetime('now') WHERE id=?").run(req.params.id)
    }

    res.status(201).json(toPaymentClient(db().prepare('SELECT * FROM loan_payments WHERE id = ?').get(payId)))
  })

  router.delete('/:loanId/payments/:payId', (req, res) => {
    db().prepare('DELETE FROM loan_payments WHERE id = ? AND loan_id = ?').run(req.params.payId, req.params.loanId)

    const totalPaid = db().prepare('SELECT COALESCE(SUM(amount),0) as total FROM loan_payments WHERE loan_id = ?').get(req.params.loanId).total
    const loan = db().prepare('SELECT * FROM loans WHERE id = ?').get(req.params.loanId)
    if (loan && loan.status === 'paid' && totalPaid < loan.amount) {
      db().prepare("UPDATE loans SET status='active', updated_at=datetime('now') WHERE id=?").run(req.params.loanId)
    }

    res.json({ ok: true })
  })

  return router
}
