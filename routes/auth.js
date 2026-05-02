import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { vStr, vEmail, vEnum, vInt, requireAuth, requireAdmin, JWT_SECRET, JWT_EXPIRES, sendError } from './_helpers.js'

export default function authRoutes(pools) {
  const r = Router()

  r.post('/auth/login', async (req, res) => {
    const email    = vEmail(req.body.email)
    const password = vStr(req.body.password, 128, true)
    if (!email || !password) return res.status(400).json({ error: 'Valid email and password required' })
    try {
      const [[users]] = await Promise.all([
        pools['Auth'].query('SELECT * FROM users WHERE email = ? LIMIT 1', [email])
      ])
      const user = users[0]
      if (!user) return res.status(401).json({ error: 'Invalid email or password' })
      const match = await bcrypt.compare(password, user.password_hash)
      if (!match) return res.status(401).json({ error: 'Invalid email or password' })
      const role = user.role === 'Admin' ? 'admin' : 'user'
      const payload = {
        id: user.id,
        name: user.display_name || user.full_name || user.email,
        email: user.email,
        role,
        owner: user.display_name || user.full_name || '',
        mustResetPassword: !!user.must_reset_password
      }
      const token = jwt.sign(payload, JWT_SECRET(), { expiresIn: JWT_EXPIRES() })
      res.json({ ...payload, token })
    } catch (err) {
      sendError(res, err)
    }
  })

  r.get('/auth/users', requireAdmin, async (req, res) => {
    try {
      const site_id = req.query.site_id
      const where = site_id ? 'WHERE site_id = ?' : ''
      const params = site_id ? [site_id] : []
      const [users] = await pools['Auth'].query(`SELECT id, email, display_name, full_name, role, must_reset_password, site_id, created_at FROM users ${where} ORDER BY created_at DESC`, params)
      res.json(users.map(u => ({
        id: u.id,
        name: u.display_name || u.full_name || u.email,
        email: u.email,
        role: u.role === 'Admin' ? 'admin' : 'user',
        owner: u.display_name || u.full_name || '',
        mustResetPassword: !!u.must_reset_password,
        site_id: u.site_id
      })))
    } catch (err) {
      sendError(res, err)
    }
  })

  r.post('/auth/users', requireAdmin, async (req, res) => {
    const name     = vStr(req.body.name ?? req.body.owner, 100)
    const email    = vEmail(req.body.email)
    const password = vStr(req.body.password, 128, true)
    const role     = vEnum(req.body.role, ['admin', 'user']) ?? 'user'
    const owner    = vStr(req.body.owner ?? req.body.name, 100)
    const site_id  = req.body.site_id ? vInt(req.body.site_id, 1) : null
    if (!email || !password) return res.status(400).json({ error: 'Valid email and password required' })
    try {
      const hash = await bcrypt.hash(password, 10)
      const dbRole = role === 'admin' ? 'Admin' : 'Standard'
      await pools['Auth'].query('INSERT INTO users (email, password_hash, display_name, full_name, role, site_id) VALUES (?, ?, ?, ?, ?, ?)', [email, hash, name || owner || '', owner || name || '', dbRole, site_id])
      res.json({ ok: true })
    } catch (err) {
      sendError(res, err)
    }
  })

  r.put('/auth/users/:id', requireAdmin, async (req, res) => {
    const { id } = req.params
    const name     = vStr(req.body.name ?? req.body.owner, 100)
    const email    = vEmail(req.body.email)
    const password = vStr(req.body.password, 128)
    const role     = vEnum(req.body.role, ['admin', 'user']) ?? 'user'
    const owner    = vStr(req.body.owner ?? req.body.name, 100)
    const site_id  = req.body.site_id !== undefined ? (req.body.site_id ? vInt(req.body.site_id, 1) : null) : undefined
    if (!email) return res.status(400).json({ error: 'Valid email required' })
    try {
      const dbRole = role === 'admin' ? 'Admin' : 'Standard'
      if (password) {
        const hash = await bcrypt.hash(password, 10)
        await pools['Auth'].query('UPDATE users SET email=?, display_name=?, full_name=?, role=?, password_hash=?, site_id=? WHERE id=?', [email, name || owner || '', owner || name || '', dbRole, hash, site_id, id])
      } else {
        await pools['Auth'].query('UPDATE users SET email=?, display_name=?, full_name=?, role=?, site_id=? WHERE id=?', [email, name || owner || '', owner || name || '', dbRole, site_id, id])
      }
      res.json({ ok: true })
    } catch (err) {
      sendError(res, err)
    }
  })

  r.delete('/auth/users/:id', requireAdmin, async (req, res) => {
    try {
      await pools['Auth'].query('DELETE FROM users WHERE id = ?', [req.params.id])
      res.json({ ok: true })
    } catch (err) {
      sendError(res, err)
    }
  })

  // Password Reset
  r.put('/auth/reset-password', requireAuth, async (req, res) => {
    const password = vStr(req.body.password, 128, true)
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
    try {
      const hash = await bcrypt.hash(password, 10)
      await pools['Auth'].query('UPDATE users SET password_hash=?, must_reset_password=0 WHERE id=?', [hash, req.user.id])
      res.json({ ok: true })
    } catch (err) { sendError(res, err) }
  })

  // Login History
  r.get('/auth/loginhistory', requireAdmin, async (req, res) => {
    const { page = 1, perpage = 50, email = '', status = '' } = req.query
    const limit = Math.min(parseInt(perpage), 200)
    const offset = (parseInt(page) - 1) * limit
    const where = []; const params = []
    if (email)  { where.push('l.email LIKE ?'); params.push(`%${email}%`) }
    if (status) { where.push('l.status = ?'); params.push(status) }
    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : ''
    try {
      const [[rows], [countResult]] = await Promise.all([
        pools['Auth'].query(`SELECT l.id, l.user_id, l.email, l.login_time, l.logout_time, l.ip_address, l.user_agent, l.status, l.duration, u.display_name FROM login_log l LEFT JOIN users u ON u.id = l.user_id ${whereSql} ORDER BY l.login_time DESC LIMIT ? OFFSET ?`, [...params, limit, offset]),
        pools['Auth'].query(`SELECT COUNT(*) AS total FROM login_log l ${whereSql}`, params),
      ])
      res.json({ rows, total: countResult[0].total })
    } catch (err) {
      sendError(res, err)
    }
  })

  return r
}
