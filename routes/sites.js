import { Router } from 'express'
import { requireAuth, requireAdmin, sendError } from './_helpers.js'

// Define available sites
const SITES = [
  { id: 1, name: 'SoccerBeacon', icon: '⚽', db: 'SoccerBeacon' },
  { id: 2, name: 'CardSparky', icon: '🃏', db: 'CardSparky' },
  { id: 3, name: 'SerialKillers', icon: '🔍', db: 'SerialKillers' },
  { id: 4, name: 'PitchPassport', icon: '🏆', db: 'PitchPassport' },
]

export default function sitesRoutes(pools) {
  const r = Router()

  r.get('/sites', requireAuth, async (req, res) => {
    res.json(SITES)
  })

  r.post('/sites', requireAdmin, async (req, res) => {
    res.json({ ok: true, id: 1 })
  })

  return r
}
