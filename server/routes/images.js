const { Router } = require('express')
const path = require('path')
const fs = require('fs')

module.exports = function imagesRouter(dbPath) {
  const IMAGES_DIR = path.join(dbPath, 'images')
  const router = Router()

  // Upload image — body: { imageData: "data:image/...;base64,..." }
  router.post('/:id', (req, res) => {
    const { imageData } = req.body
    if (!imageData) return res.status(400).json({ error: 'imageData required' })

    const match = imageData.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!match) return res.status(400).json({ error: 'Invalid image format' })

    const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
    const buffer = Buffer.from(match[2], 'base64')
    const filePath = path.join(IMAGES_DIR, `${req.params.id}.${ext}`)

    // Remove any old image for this id (different extension)
    for (const f of fs.readdirSync(IMAGES_DIR)) {
      if (f.startsWith(req.params.id + '.')) {
        fs.unlinkSync(path.join(IMAGES_DIR, f))
      }
    }

    fs.writeFileSync(filePath, buffer)
    res.json({ ok: true })
  })

  // Serve image
  router.get('/:id', (req, res) => {
    const files = fs.readdirSync(IMAGES_DIR)
    const file = files.find((f) => f.startsWith(req.params.id + '.'))
    if (!file) return res.status(404).end()
    res.sendFile(path.join(IMAGES_DIR, file))
  })

  // Delete image
  router.delete('/:id', (req, res) => {
    const files = fs.readdirSync(IMAGES_DIR)
    const file = files.find((f) => f.startsWith(req.params.id + '.'))
    if (file) fs.unlinkSync(path.join(IMAGES_DIR, file))
    res.json({ ok: true })
  })

  return router
}
