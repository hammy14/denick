import jwt from 'jsonwebtoken'

// Read env at call time (not import time) so dotenv.config() has run first
const getSecret  = () => process.env.JWT_SECRET  || 'cs_jwt_secret_change_in_production'
const getExpires = () => process.env.JWT_EXPIRES_IN || '8h'

// ── Input validation helpers ──────────────────────────────────────────────────

export function vStr(val, maxLen = 255, required = false) {
  const s = String(val ?? '').trim().slice(0, maxLen)
  if (required && !s) return null
  return s
}

export function vInt(val, min = 0, max = 999999) {
  const n = parseInt(val)
  if (isNaN(n)) return min
  return Math.max(min, Math.min(max, n))
}

export function vFloat(val, min = 0, max = 9999999) {
  const n = parseFloat(val)
  if (isNaN(n)) return min
  return Math.max(min, Math.min(max, n))
}

export function vEmail(val) {
  const s = String(val ?? '').trim().toLowerCase().slice(0, 254)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : null
}

export function vEnum(val, allowed) {
  return allowed.includes(val) ? val : null
}

// ── Auth middleware ────────────────────────────────────────────────────────────

export function requireAuth(req, res, next) {
  const header = req.headers['authorization']
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  try {
    req.user = jwt.verify(header.slice(7), getSecret())
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' })
    next()
  })
}

// ── Activity logging ──────────────────────────────────────────────────────────

export async function logActivity(pools, owner, type, message) {
  if (!pools['Auth'] || !owner) return
  try {
    await pools['Auth'].query(
      'INSERT INTO activity_log (owner, type, message) VALUES (?, ?, ?)',
      [String(owner).slice(0, 100), String(type).slice(0, 50), String(message).slice(0, 500)]
    )
  } catch { /* silent — table may not exist yet */ }
}

// Escape LIKE wildcards in user input to prevent LIKE injection
export function escapeLike(str) {
  return String(str).replace(/[%_\\]/g, '\\75abdaf2-837a-4708-bad3-dd18fff43498')
}

// Safe error response — logs full error server-side, returns generic message in production
export function sendError(res, err, status = 500) {
  console.error(`[${new Date().toISOString()}]`, err.message)
  const isDev = process.env.NODE_ENV !== 'production'
  res.status(status).json({ error: isDev ? err.message : 'Internal server error' })
}

export { getSecret as JWT_SECRET, getExpires as JWT_EXPIRES }
