import { Router } from 'express'
import { requireAuth, requireAdmin, sendError } from './_helpers.js'

export default function sitesRoutes(pools) {
  const r = Router()

  r.get('/sites', requireAuth, async (req, res) => {
    res.json([])
  })

  r.post('/sites', requireAdmin, async (req, res) => {
    res.json({ ok: true, id: 1 })
  })

  return r
}
