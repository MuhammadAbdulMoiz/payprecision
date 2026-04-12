const { Router } = require('express')
const path = require('path')
const fs = require('fs')

module.exports = function adminRouter(dbPath) {
  const router = Router()
  const BACKUP_DIR = process.env.BACKUP_DIR || '/backups'

  // Auth middleware — all admin routes require x-admin-token header
  router.use((req, res, next) => {
    const token = process.env.ADMIN_TOKEN
    if (!token) return res.status(503).json({ error: 'ADMIN_TOKEN not set on server' })
    if (req.headers['x-admin-token'] !== token) return res.status(401).json({ error: 'unauthorized' })
    next()
  })

  // GET /admin/backups — list all .db backup files
  router.get('/backups', (req, res) => {
    try {
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
      const files = fs.readdirSync(BACKUP_DIR)
        .filter((f) => f.endsWith('.db') || f.endsWith('.sqlite'))
        .map((f) => {
          const stat = fs.statSync(path.join(BACKUP_DIR, f))
          return { name: f, size: stat.size, createdAt: stat.birthtime.toISOString() }
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      res.json(files)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // POST /admin/backup — copy current DB to /backups/db-YYYY-MM-DD-HHmmss.db
  router.post('/backup', (req, res) => {
    try {
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      const dest = path.join(BACKUP_DIR, `db-${ts}.db`)
      fs.copyFileSync(path.join(dbPath, 'payprecision.db'), dest)
      const stat = fs.statSync(dest)
      res.json({ ok: true, file: `db-${ts}.db`, size: stat.size })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // POST /admin/restore  body: { file: "db-2026-04-12.db" }
  router.post('/restore', (req, res) => {
    try {
      const { file } = req.body
      if (!file) return res.status(400).json({ error: 'file required' })
      // Prevent path traversal
      const safe = path.basename(file)
      const src = path.join(BACKUP_DIR, safe)
      if (!fs.existsSync(src)) return res.status(404).json({ error: 'backup not found' })
      // Backup current DB before overwriting
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      fs.copyFileSync(
        path.join(dbPath, 'payprecision.db'),
        path.join(BACKUP_DIR, `pre-restore-${ts}.db`)
      )
      fs.copyFileSync(src, path.join(dbPath, 'payprecision.db'))
      // Reset DB singleton so next request reopens the restored file
      const dbModule = require('../db')
      if (typeof dbModule._reset === 'function') dbModule._reset()
      res.json({ ok: true, restored: safe })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // POST /admin/migrate — re-runs initSchema (idempotent)
  router.post('/migrate', (req, res) => {
    try {
      const { getDb } = require('../db')
      getDb(dbPath) // triggers initSchema
      res.json({ ok: true, message: 'Schema up to date' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // GET /admin/backups/:file/download — stream backup file to browser
  router.get('/backups/:file/download', (req, res) => {
    try {
      const safe = path.basename(req.params.file)
      const target = path.join(BACKUP_DIR, safe)
      if (!fs.existsSync(target)) return res.status(404).json({ error: 'not found' })
      res.setHeader('Content-Disposition', `attachment; filename="${safe}"`)
      res.setHeader('Content-Type', 'application/octet-stream')
      res.sendFile(target)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // POST /admin/restore-upload — upload a .db file from browser and restore it
  router.post('/restore-upload', (req, res) => {
    try {
      const { fileName, data } = req.body
      if (!data) return res.status(400).json({ error: 'data required' })
      const safe = path.basename(fileName || 'upload.db').replace(/[^a-z0-9._-]/gi, '_')
      const dest = path.join(BACKUP_DIR, `uploaded-${Date.now()}-${safe}`)
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
      const buf = Buffer.from(data, 'base64')
      fs.writeFileSync(dest, buf)
      // Auto-backup current before overwriting
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      fs.copyFileSync(path.join(dbPath, 'payprecision.db'), path.join(BACKUP_DIR, `pre-upload-restore-${ts}.db`))
      fs.copyFileSync(dest, path.join(dbPath, 'payprecision.db'))
      const dbModule = require('../db')
      if (typeof dbModule._reset === 'function') dbModule._reset()
      res.json({ ok: true, restored: safe })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // DELETE /admin/backups/:file — delete a specific backup
  router.delete('/backups/:file', (req, res) => {
    try {
      const safe = path.basename(req.params.file)
      const target = path.join(BACKUP_DIR, safe)
      if (!fs.existsSync(target)) return res.status(404).json({ error: 'not found' })
      fs.unlinkSync(target)
      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  return router
}
