import { Router } from 'express'
import { vStr, vInt, vFloat, vEnum, requireAuth, sendError } from './_helpers.js'

const PT_SHIRT_WEIGHTS = { XS: 1, S: 3, M: 8, L: 20, XL: 40 }
const PT_SHIRT_LABEL = score =>
  score <= 10 ? 'XS' : score <= 25 ? 'S' : score <= 50 ? 'M' : score <= 100 ? 'L' : 'XL'

async function ensureProjectTracker(pool) {
  await pool.query(`ALTER TABLE tasks MODIFY COLUMN status ENUM('Idea','Backlog','In Progress','In Review','Done') DEFAULT 'Idea'`).catch(() => {})
  await pool.query(`ALTER TABLE tasks ADD COLUMN plan TEXT`).catch(() => {})
  await pool.query(`ALTER TABLE tasks ADD COLUMN done TEXT`).catch(() => {})
  await pool.query(`CREATE TABLE IF NOT EXISTS projects (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, description TEXT, status ENUM('Active','On Hold','Completed','Cancelled') DEFAULT 'Active', shirt_size ENUM('XS','S','M','L','XL') DEFAULT 'XS', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`)
  await pool.query(`CREATE TABLE IF NOT EXISTS releases (id INT AUTO_INCREMENT PRIMARY KEY, project_id INT NOT NULL, version VARCHAR(50) NOT NULL, name VARCHAR(255), description TEXT, release_date DATE, status ENUM('Planning','In Progress','Released') DEFAULT 'Planning', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`)
  await pool.query(`CREATE TABLE IF NOT EXISTS tasks (id INT AUTO_INCREMENT PRIMARY KEY, project_id INT NOT NULL, release_id INT, title VARCHAR(255) NOT NULL, description TEXT, plan TEXT, done TEXT, type ENUM('Enhancement','Bug','Change Request') DEFAULT 'Enhancement', status ENUM('Backlog','In Progress','In Review','Done') DEFAULT 'Backlog', priority ENUM('Low','Medium','High','Critical') DEFAULT 'Medium', shirt_size ENUM('XS','S','M','L','XL') DEFAULT 'S', assignee VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`)
}

async function recalcProjectShirt(pool, projectId) {
  const [tasks] = await pool.query('SELECT shirt_size FROM tasks WHERE project_id = ?', [projectId])
  const score = tasks.reduce((sum, t) => sum + (PT_SHIRT_WEIGHTS[t.shirt_size] ?? 3), 0)
  await pool.query('UPDATE projects SET shirt_size = ? WHERE id = ?', [PT_SHIRT_LABEL(score), projectId])
}

export default function projectTrackerRoutes(pools) {
  const r = Router()
  const pt = () => pools['ProjectTracker']

  // Run migrations once at startup
  ensureProjectTracker(pt()).catch(() => {})

  // Projects
  r.get('/pt/projects', requireAuth, async (req, res) => {
    try {
      const site_id = req.query.site_id
      const where = site_id ? 'WHERE p.site_id = ?' : ''
      const params = site_id ? [site_id] : []
      const [rows] = await pt().query(`SELECT p.*, (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS task_count, (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'Done') AS done_count, (SELECT COUNT(*) FROM releases r WHERE r.project_id = p.id) AS release_count FROM projects p ${where} ORDER BY p.created_at DESC`, params)
      res.json(rows)
    } catch (err) { sendError(res, err) }
  })

  r.post('/pt/projects', requireAuth, async (req, res) => {
    const name = vStr(req.body.name, 255, true)
    const description = vStr(req.body.description, 2000)
    const status = vEnum(req.body.status, ['Active','In Progress','On Hold','Completed','Cancelled']) ?? 'Active'
    const site_id = req.body.site_id ? vInt(req.body.site_id, 1) : null
    if (!name) return res.status(400).json({ error: 'Name required' })
    try {
      const [result] = await pt().query('INSERT INTO projects (name, description, status, site_id) VALUES (?, ?, ?, ?)', [name, description, status, site_id])
      res.json({ ok: true, id: result.insertId })
    } catch (err) { sendError(res, err) }
  })

  r.put('/pt/projects/:id', requireAuth, async (req, res) => {
    const name = vStr(req.body.name, 255, true)
    const description = vStr(req.body.description, 2000)
    const status = vEnum(req.body.status, ['Active','In Progress','On Hold','Completed','Cancelled']) ?? 'Active'
    const site_id = req.body.site_id ? vInt(req.body.site_id, 1) : null
    if (!name) return res.status(400).json({ error: 'Name required' })
    try {
      await pt().query('UPDATE projects SET name=?, description=?, status=?, site_id=? WHERE id=?', [name, description, status, site_id, req.params.id])
      res.json({ ok: true })
    } catch (err) { sendError(res, err) }
  })

  r.delete('/pt/projects/:id', requireAuth, async (req, res) => {
    try { await pt().query('DELETE FROM projects WHERE id=?', [req.params.id]); res.json({ ok: true }) }
    catch (err) { sendError(res, err) }
  })

  // Tasks
  r.get('/pt/tasks', requireAuth, async (req, res) => {
    const { project_id, release_id, status, type } = req.query
    const where = []; const params = []
    if (project_id) { where.push('project_id = ?'); params.push(project_id) }
    if (release_id) { where.push('release_id = ?'); params.push(release_id) }
    if (status) { where.push('status = ?'); params.push(status) }
    if (type) { where.push('type = ?'); params.push(type) }
    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : ''
    try {
      const [rows] = await pt().query(`SELECT * FROM tasks ${whereSql} ORDER BY created_at DESC`, params)
      res.json(rows)
    } catch (err) { sendError(res, err) }
  })

  r.post('/pt/tasks', requireAuth, async (req, res) => {
    const project_id = vInt(req.body.project_id, 1)
    const release_id = req.body.release_id ? vInt(req.body.release_id, 1) : null
    const title = vStr(req.body.title, 255, true)
    const description = vStr(req.body.description, 2000)
    const plan = vStr(req.body.plan, 5000)
    const done = vStr(req.body.done, 5000)
    const type = vEnum(req.body.type, ['Enhancement','Bug','Change Request']) ?? 'Enhancement'
    const status = vEnum(req.body.status, ['Idea','Backlog','In Progress','In Review','Done']) ?? 'Idea'
    const priority = vEnum(req.body.priority, ['Low','Medium','High','Critical']) ?? 'Medium'
    const shirt_size = vEnum(req.body.shirt_size, ['XS','S','M','L','XL']) ?? 'S'
    const assignee = vStr(req.body.assignee, 100)
    if (!project_id || !title) return res.status(400).json({ error: 'project_id and title required' })
    try {
      const [result] = await pt().query('INSERT INTO tasks (project_id, release_id, title, description, plan, done, type, status, priority, shirt_size, assignee) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [project_id, release_id, title, description, plan, done, type, status, priority, shirt_size, assignee])
      await recalcProjectShirt(pt(), project_id)
      res.json({ ok: true, id: result.insertId })
    } catch (err) { sendError(res, err) }
  })

  r.put('/pt/tasks/:id', requireAuth, async (req, res) => {
    const project_id = vInt(req.body.project_id, 1)
    const release_id = req.body.release_id ? vInt(req.body.release_id, 1) : null
    const title = vStr(req.body.title, 255, true)
    const description = vStr(req.body.description, 2000)
    const plan = vStr(req.body.plan, 5000)
    const done = vStr(req.body.done, 5000)
    const type = vEnum(req.body.type, ['Enhancement','Bug','Change Request']) ?? 'Enhancement'
    const status = vEnum(req.body.status, ['Idea','Backlog','In Progress','In Review','Done']) ?? 'Backlog'
    const priority = vEnum(req.body.priority, ['Low','Medium','High','Critical']) ?? 'Medium'
    const shirt_size = vEnum(req.body.shirt_size, ['XS','S','M','L','XL']) ?? 'S'
    const assignee = vStr(req.body.assignee, 100)
    if (!title) return res.status(400).json({ error: 'Title required' })
    try {
      await pt().query('UPDATE tasks SET project_id=?, release_id=?, title=?, description=?, plan=?, done=?, type=?, status=?, priority=?, shirt_size=?, assignee=? WHERE id=?', [project_id, release_id, title, description, plan, done, type, status, priority, shirt_size, assignee, req.params.id])
      await recalcProjectShirt(pt(), project_id)
      res.json({ ok: true })
    } catch (err) { sendError(res, err) }
  })

  r.delete('/pt/tasks/:id', requireAuth, async (req, res) => {
    try {
      const [[task]] = await pt().query('SELECT project_id FROM tasks WHERE id=?', [req.params.id])
      await pt().query('DELETE FROM tasks WHERE id=?', [req.params.id])
      if (task) await recalcProjectShirt(pt(), task.project_id)
      res.json({ ok: true })
    } catch (err) { sendError(res, err) }
  })

  return r
}
