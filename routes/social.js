import { Router } from 'express'
import { requireAuth, requireAdmin, sendError } from './_helpers.js'

export default function socialRoutes(pools) {
  const r = Router()

  r.get('/social/accounts', requireAdmin, async (req, res) => {
    res.json([])
  })

  r.post('/social/accounts', requireAdmin, async (req, res) => {
    res.json({ ok: true, id: 1 })
  })

  r.get('/social/footer-links', async (req, res) => {
    res.json([])
  })

  r.get('/social/posts', requireAuth, async (req, res) => {
    res.json({ rows: [], total: 0, page: 1, perpage: 50 })
  })

  r.post('/social/posts', requireAuth, async (req, res) => {
    res.json({ ok: true, id: 1 })
  })

  r.get('/social/analytics', requireAuth, async (req, res) => {
    res.json({ accounts: [], posts: { draft: 0, scheduled: 0, published: 0, failed: 0, total: 0 }, topPosts: [], byPlatform: [], byMonth: [] })
  })

  return r
}
