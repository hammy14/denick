import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import compression from 'compression'
import mysql from 'mysql2/promise'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { requireAuth } from './routes/_helpers.js'

// Route modules
import authRoutes from './routes/auth.js'
import projectTrackerRoutes from './routes/projectTracker.js'
import analyticsRoutes from './routes/analytics.js'
import socialRoutes from './routes/social.js'
import sitesRoutes from './routes/sites.js'
import seoRoutes from './routes/seo.js'

// Load environment variables
// Try production path first, then fall back to local .env
const productionEnvPath = process.env.ENV_PATH || '.env'
dotenv.config({ path: productionEnvPath })
// If still no DB_NAMES, try default .env
if (!process.env.DB_NAMES) {
  dotenv.config()
}

// ── Rate limiters ─────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many login attempts. Please try again in 15 minutes.' } })
const generalLimiter = rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests. Please slow down.' } })

const app = express()

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(compression({ level: 6, threshold: 1024, filter: (req, res) => req.headers['x-no-compression'] ? false : compression.filter(req, res) }))
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))

// ── CORS Configuration ────────────────────────────────────────────────────────
// Allow specific origins from environment variable, with sensible defaults for development
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174').split(',').map(s => s.trim())
app.use(cors({ 
  origin: (origin, cb) => (!origin || ALLOWED_ORIGINS.includes(origin)) ? cb(null, true) : cb(null, false), 
  credentials: true 
}))
app.use(express.json())

// Cache headers
app.use((req, res, next) => {
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (req.url.endsWith('.html')) {
    res.set('Cache-Control', 'public, max-age=3600, must-revalidate')
  } else if (req.url.startsWith('/api')) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.set('Pragma', 'no-cache')
    res.set('Expires', '0')
  }
  next()
})

// Rate limiting
app.use('/api', generalLimiter)
app.use('/api/auth/login', loginLimiter)

// Global auth guard (skip login and health endpoints)
app.use('/api', (req, res, next) => {
  if (req.path === '/auth/login' && req.method === 'POST') return next()
  if (req.path === '/health') return next()
  requireAuth(req, res, next)
})

// ── Database pools ────────────────────────────────────────────────────────────
const pools = {}
const DB_LIST = process.env.DB_NAMES.split(',').map(s => s.trim())
const CONN_PER_DB = parseInt(process.env.DB_CONN_LIMIT) || 2

DB_LIST.forEach(db => {
  pools[db] = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: db,
    charset: 'utf8mb4',
    connectionLimit: CONN_PER_DB,
    waitForConnections: true,
    queueLimit: 20,
  })
})

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', authRoutes(pools))
app.use('/api', projectTrackerRoutes(pools))
app.use('/api', analyticsRoutes(pools))
app.use('/api', socialRoutes(pools))
app.use('/api', sitesRoutes(pools))
app.use('/', seoRoutes())

// Pool health check (no auth — useful for monitoring)
app.get('/api/health', (_req, res) => {
  const status = DB_LIST.map(db => {
    const p = pools[db]?.pool || pools[db]
    return {
      db,
      active: p._allConnections?.length ?? 0,
      idle: p._freeConnections?.length ?? 0,
      queued: p._connectionQueue?.length ?? 0,
      limit: CONN_PER_DB,
    }
  })
  const totalActive = status.reduce((s, d) => s + d.active, 0)
  res.json({ ok: true, totalActive, totalLimit: DB_LIST.length * CONN_PER_DB, pools: status })
})

// ── SPA fallback (production) ─────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
const distPath = join(__dirname, 'dist')
app.use(express.static(distPath))
app.get('*', (_req, res, next) => {
  if (_req.path.startsWith('/api')) return next()
  res.sendFile(join(distPath, 'index.html'), err => { if (err) next() })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.message, err.stack)
  const isDev = process.env.NODE_ENV !== 'production'
  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Internal server error'
  })
})

// ── Server startup ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  const totalConns = DB_LIST.length * CONN_PER_DB
  console.log(`✓ Denick server running on port ${PORT}`)
  console.log(`✓ ${DB_LIST.length} databases × ${CONN_PER_DB} connections = ${totalConns} max connections`)
})
