import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const API_BASE = process.env.API_BASE || 'http://localhost:3001'
const API_TOKEN = process.env.API_TOKEN || ''

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_TOKEN}`, ...(options.headers || {}) },
  })
  return res.json()
}

const server = new McpServer({
  name: 'denick-admin',
  version: '1.0.0',
})

// ── Project Tracker Tools ─────────────────────────────────────────────────────

server.tool('list_projects', 'List all projects in the Project Tracker', {}, async () => {
  const data = await api('/pt/projects')
  const list = (Array.isArray(data) ? data : []).map(p =>
    `#${p.id} ${p.name} [${p.status}] — ${p.done_count || 0}/${p.task_count || 0} tasks done (${p.shirt_size})`
  ).join('\n')
  return { content: [{ type: 'text', text: list || 'No projects found.' }] }
})

server.tool('create_project', 'Create a new project', {
  name: z.string().describe('Project name'),
  description: z.string().optional().describe('Project description'),
  status: z.enum(['Active', 'On Hold', 'Completed', 'Cancelled']).optional().default('Active'),
}, async ({ name, description, status }) => {
  const data = await api('/pt/projects', { method: 'POST', body: JSON.stringify({ name, description, status }) })
  return { content: [{ type: 'text', text: data.ok ? `✅ Project created with ID #${data.id}` : `❌ ${data.error}` }] }
})

server.tool('list_tasks', 'List tasks for a project', {
  project_id: z.number().describe('Project ID'),
  status: z.string().optional().describe('Filter by status: Idea, Backlog, In Progress, In Review, Done'),
}, async ({ project_id, status }) => {
  const params = new URLSearchParams({ project_id: String(project_id) })
  if (status) params.set('status', status)
  const data = await api(`/pt/tasks?${params}`)
  const list = (Array.isArray(data) ? data : []).map(t =>
    `#${t.id} [${t.status}] ${t.priority} | ${t.title}${t.assignee ? ` → ${t.assignee}` : ''}${t.est_hours ? ` (${t.est_hours}h)` : ''}`
  ).join('\n')
  return { content: [{ type: 'text', text: list || 'No tasks found.' }] }
})

server.tool('create_task', 'Create a new task in a project', {
  project_id: z.number().describe('Project ID'),
  title: z.string().describe('Task title'),
  description: z.string().optional().describe('Task description'),
  type: z.enum(['Enhancement', 'Bug', 'Change Request']).optional().default('Enhancement'),
  status: z.enum(['Idea', 'Backlog', 'In Progress', 'In Review', 'Done']).optional().default('Backlog'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional().default('Medium'),
  shirt_size: z.enum(['XS', 'S', 'M', 'L', 'XL']).optional().default('S'),
  assignee: z.string().optional().default('Eric'),
  est_hours: z.number().optional().describe('Estimated hours'),
  actual_hours: z.number().optional().describe('Actual hours for AI to complete'),
  plan: z.string().optional().describe('Plan of attack'),
  model: z.string().optional().default('Auto'),
}, async (params) => {
  const data = await api('/pt/tasks', { method: 'POST', body: JSON.stringify(params) })
  return { content: [{ type: 'text', text: data.ok ? `✅ Task #${data.id} created: ${params.title}` : `❌ ${data.error}` }] }
})

server.tool('update_task', 'Update an existing task', {
  task_id: z.number().describe('Task ID'),
  status: z.enum(['Idea', 'Backlog', 'In Progress', 'In Review', 'Done']).optional(),
  done: z.string().optional().describe('What was completed'),
  actual_hours: z.number().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
}, async ({ task_id, ...updates }) => {
  // Fetch current task first to preserve fields
  const tasks = await api(`/pt/tasks?project_id=0`)
  const all = Array.isArray(tasks) ? tasks : []
  // Try to find the task — if not found, just send the update
  const body = { ...updates }
  const data = await api(`/pt/tasks/${task_id}`, { method: 'PUT', body: JSON.stringify(body) })
  return { content: [{ type: 'text', text: data.ok ? `✅ Task #${task_id} updated` : `❌ ${data.error || 'Update failed — task may need all required fields'}` }] }
})

server.tool('create_release', 'Create a release/phase for a project', {
  project_id: z.number().describe('Project ID'),
  version: z.string().describe('Version number (e.g., 1.0)'),
  name: z.string().optional().describe('Release name'),
  description: z.string().optional(),
  status: z.enum(['Planning', 'In Progress', 'Released']).optional().default('Planning'),
}, async (params) => {
  const data = await api('/pt/releases', { method: 'POST', body: JSON.stringify(params) })
  return { content: [{ type: 'text', text: data.ok ? `✅ Release ${params.version} created with ID #${data.id}` : `❌ ${data.error}` }] }
})

// ── Social Media Tools ────────────────────────────────────────────────────────

server.tool('create_social_post', 'Create a social media post draft', {
  account_id: z.number().describe('Social account ID'),
  body: z.string().describe('Post content'),
  hashtags: z.string().optional().describe('Hashtags'),
  status: z.enum(['Draft', 'Scheduled']).optional().default('Draft'),
  scheduled_at: z.string().optional().describe('Schedule datetime (ISO format)'),
}, async (params) => {
  const data = await api('/social/posts', { method: 'POST', body: JSON.stringify({ ...params, created_by: 'MCP' }) })
  return { content: [{ type: 'text', text: data.ok ? `✅ Social post #${data.id} created as ${params.status}` : `❌ ${data.error}` }] }
})

server.tool('list_social_accounts', 'List connected social media accounts', {}, async () => {
  const data = await api('/social/accounts')
  const list = (Array.isArray(data) ? data : []).map(a =>
    `#${a.id} ${a.icon || '📱'} ${a.platform} — @${a.handle} [${a.is_active ? 'Active' : 'Inactive'}]`
  ).join('\n')
  return { content: [{ type: 'text', text: list || 'No social accounts configured.' }] }
})

server.tool('list_social_posts', 'List social media posts', {
  status: z.enum(['Draft', 'Scheduled', 'Published', 'Failed']).optional(),
}, async ({ status }) => {
  const params = status ? `?status=${status}` : '?perpage=20'
  const data = await api(`/social/posts${params}`)
  const rows = data.rows || []
  const list = rows.map(p =>
    `#${p.id} [${p.status}] ${p.platform || '?'} @${p.handle || '?'}: ${(p.body || '').slice(0, 80)}...`
  ).join('\n')
  return { content: [{ type: 'text', text: list || 'No posts found.' }] }
})

// ── Content Management Tools ──────────────────────────────────────────────────

server.tool('create_announcement', 'Create a new announcement', {
  title: z.string().describe('Announcement title'),
  body: z.string().describe('Announcement body'),
  priority: z.enum(['Normal', 'Important']).optional().default('Normal'),
}, async ({ title, body, priority }) => {
  const data = await api('/announcements', { method: 'POST', body: JSON.stringify({ title, body, priority, createdBy: 'MCP' }) })
  return { content: [{ type: 'text', text: data.id ? `✅ Announcement #${data.id} created: ${title}` : `❌ ${JSON.stringify(data)}` }] }
})

server.tool('create_tip', 'Create a new tip', {
  title: z.string().describe('Tip title'),
  body: z.string().describe('Tip body'),
  category: z.string().optional().default('General'),
  emoji: z.string().optional().default('💡'),
}, async ({ title, body, category, emoji }) => {
  const data = await api('/tips', { method: 'POST', body: JSON.stringify({ title, body, category, emoji, createdBy: 'MCP' }) })
  return { content: [{ type: 'text', text: data.id ? `✅ Tip #${data.id} created: ${title}` : `❌ ${JSON.stringify(data)}` }] }
})

// ── Site Management Tools ─────────────────────────────────────────────────────

server.tool('list_sites', 'List all managed sites', {}, async () => {
  const data = await api('/sites')
  const list = (Array.isArray(data) ? data : []).map(s =>
    `#${s.id} ${s.icon || '🌐'} ${s.name} — ${s.domain || 'no domain'} [port ${s.local_port}] ${s.is_active ? '✅' : '⬜'}`
  ).join('\n')
  return { content: [{ type: 'text', text: list || 'No sites configured.' }] }
})

// ── Resources ─────────────────────────────────────────────────────────────────

server.resource('project-list', 'project://list', async () => {
  const data = await api('/pt/projects')
  const text = (Array.isArray(data) ? data : []).map(p =>
    `# ${p.name} (ID: ${p.id})\nStatus: ${p.status} | Tasks: ${p.done_count || 0}/${p.task_count || 0} done | Size: ${p.shirt_size}\n${p.description || ''}`
  ).join('\n\n---\n\n')
  return { contents: [{ uri: 'project://list', mimeType: 'text/plain', text: text || 'No projects.' }] }
})

server.resource('sites-list', 'site://list', async () => {
  const data = await api('/sites')
  const text = (Array.isArray(data) ? data : []).map(s =>
    `${s.icon || '🌐'} ${s.name} (ID: ${s.id})\nDomain: ${s.domain || 'none'} | Port: ${s.local_port} | Active: ${s.is_active ? 'Yes' : 'No'}`
  ).join('\n\n')
  return { contents: [{ uri: 'site://list', mimeType: 'text/plain', text: text || 'No sites.' }] }
})

// ── Start ─────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch(console.error)

// ── Documentation Tools ──────────────────────────────────────────────────────

server.tool('list_documentation', 'List all documentation files', {
  project: z.string().optional().describe('Filter by project: cardsparky, pitch-passport, serial-killers, denick, shared'),
}, async ({ project }) => {
  try {
    const indexPath = '/Users/endimac/docs/INDEX.json'
    const fs = await import('fs').then(m => m.promises)
    const content = await fs.readFile(indexPath, 'utf-8')
    const index = JSON.parse(content)
    
    let docs = []
    if (project) {
      const proj = index.projects.find(p => p.path === project)
      if (proj) docs = proj.files.map(f => `${project}/${f}`)
    } else {
      index.projects.forEach(p => {
        docs.push(...p.files.map(f => `${p.path}/${f}`))
      })
      docs.push(...index.shared.files.map(f => `shared/${f}`))
    }
    
    return { content: [{ type: 'text', text: docs.join('\n') || 'No documentation found.' }] }
  } catch (err) {
    return { content: [{ type: 'text', text: `❌ Error reading documentation: ${err.message}` }] }
  }
})

server.tool('get_documentation', 'Get content of a documentation file', {
  path: z.string().describe('Documentation path (e.g., pitch-passport/START_HERE.md)'),
}, async ({ path }) => {
  try {
    const fs = await import('fs').then(m => m.promises)
    const filePath = `/Users/endimac/docs/${path}`
    const content = await fs.readFile(filePath, 'utf-8')
    return { content: [{ type: 'text', text: content }] }
  } catch (err) {
    return { content: [{ type: 'text', text: `❌ Error reading file: ${err.message}` }] }
  }
})

server.tool('link_documentation_to_project', 'Link documentation to a project', {
  project_id: z.number().describe('Project ID'),
  doc_path: z.string().describe('Documentation path (e.g., pitch-passport/START_HERE.md)'),
  status: z.enum(['up-to-date', 'needs-review', 'deprecated']).optional().default('up-to-date'),
}, async ({ project_id, doc_path, status }) => {
  try {
    // Store in a simple JSON file for now
    const fs = await import('fs').then(m => m.promises)
    const linksPath = '/Users/endimac/docs/.project-links.json'
    let links = {}
    try {
      const content = await fs.readFile(linksPath, 'utf-8')
      links = JSON.parse(content)
    } catch {}
    
    if (!links[project_id]) links[project_id] = []
    links[project_id].push({ doc_path, status, linked_at: new Date().toISOString() })
    
    await fs.writeFile(linksPath, JSON.stringify(links, null, 2))
    return { content: [{ type: 'text', text: `✅ Documentation linked to project #${project_id}` }] }
  } catch (err) {
    return { content: [{ type: 'text', text: `❌ Error linking documentation: ${err.message}` }] }
  }
})

server.tool('get_project_documentation', 'Get all documentation linked to a project', {
  project_id: z.number().describe('Project ID'),
}, async ({ project_id }) => {
  try {
    const fs = await import('fs').then(m => m.promises)
    const linksPath = '/Users/endimac/docs/.project-links.json'
    const content = await fs.readFile(linksPath, 'utf-8')
    const links = JSON.parse(content)
    const projectDocs = links[project_id] || []
    
    const list = projectDocs.map(d => `📄 ${d.doc_path} [${d.status}]`).join('\n')
    return { content: [{ type: 'text', text: list || 'No documentation linked to this project.' }] }
  } catch (err) {
    return { content: [{ type: 'text', text: `❌ Error retrieving documentation: ${err.message}` }] }
  }
})

server.tool('get_task_documentation', 'Get all documentation linked to a task', {
  task_id: z.number().describe('Task ID'),
}, async ({ task_id }) => {
  try {
    const fs = await import('fs').then(m => m.promises)
    const linksPath = '/Users/endimac/docs/.task-links.json'
    let taskDocs = []
    try {
      const content = await fs.readFile(linksPath, 'utf-8')
      const links = JSON.parse(content)
      taskDocs = links[task_id] || []
    } catch {}
    
    const list = taskDocs.map(d => `📄 ${d.doc_path} [${d.status}]`).join('\n')
    return { content: [{ type: 'text', text: list || 'No documentation linked to this task.' }] }
  } catch (err) {
    return { content: [{ type: 'text', text: `❌ Error retrieving documentation: ${err.message}` }] }
  }
})

server.tool('link_documentation_to_task', 'Link documentation to a task', {
  task_id: z.number().describe('Task ID'),
  doc_path: z.string().describe('Documentation path (e.g., pitch-passport/START_HERE.md)'),
  status: z.enum(['up-to-date', 'needs-review', 'deprecated']).optional().default('up-to-date'),
}, async ({ task_id, doc_path, status }) => {
  try {
    const fs = await import('fs').then(m => m.promises)
    const linksPath = '/Users/endimac/docs/.task-links.json'
    let links = {}
    try {
      const content = await fs.readFile(linksPath, 'utf-8')
      links = JSON.parse(content)
    } catch {}
    
    if (!links[task_id]) links[task_id] = []
    links[task_id].push({ doc_path, status, linked_at: new Date().toISOString() })
    
    await fs.writeFile(linksPath, JSON.stringify(links, null, 2))
    return { content: [{ type: 'text', text: `✅ Documentation linked to task #${task_id}` }] }
  } catch (err) {
    return { content: [{ type: 'text', text: `❌ Error linking documentation: ${err.message}` }] }
  }
})

server.tool('update_documentation_status', 'Update the status of linked documentation', {
  doc_path: z.string().describe('Documentation path'),
  project_id: z.number().optional().describe('Project ID (if linked to project)'),
  task_id: z.number().optional().describe('Task ID (if linked to task)'),
  status: z.enum(['up-to-date', 'needs-review', 'deprecated']).describe('New status'),
}, async ({ doc_path, project_id, task_id, status }) => {
  try {
    const fs = await import('fs').then(m => m.promises)
    
    if (project_id) {
      const linksPath = '/Users/endimac/docs/.project-links.json'
      const content = await fs.readFile(linksPath, 'utf-8')
      const links = JSON.parse(content)
      if (links[project_id]) {
        const doc = links[project_id].find(d => d.doc_path === doc_path)
        if (doc) doc.status = status
        await fs.writeFile(linksPath, JSON.stringify(links, null, 2))
      }
    }
    
    if (task_id) {
      const linksPath = '/Users/endimac/docs/.task-links.json'
      const content = await fs.readFile(linksPath, 'utf-8')
      const links = JSON.parse(content)
      if (links[task_id]) {
        const doc = links[task_id].find(d => d.doc_path === doc_path)
        if (doc) doc.status = status
        await fs.writeFile(linksPath, JSON.stringify(links, null, 2))
      }
    }
    
    return { content: [{ type: 'text', text: `✅ Documentation status updated to ${status}` }] }
  } catch (err) {
    return { content: [{ type: 'text', text: `❌ Error updating status: ${err.message}` }] }
  }
})

server.tool('search_documentation', 'Search documentation files by name, category, or tags', {
  query: z.string().describe('Search query'),
  project: z.string().optional().describe('Filter by project'),
  category: z.string().optional().describe('Filter by category'),
}, async ({ query, project, category }) => {
  try {
    const fs = await import('fs').then(m => m.promises)
    const indexPath = '/Users/endimac/docs/INDEX.json'
    const content = await fs.readFile(indexPath, 'utf-8')
    const index = JSON.parse(content)
    
    let results = []
    const searchLower = query.toLowerCase()
    
    index.projects.forEach(p => {
      if (project && p.path !== project) return
      p.files.forEach(f => {
        if (f.toLowerCase().includes(searchLower)) {
          results.push(`${p.path}/${f}`)
        }
      })
    })
    
    index.shared.files.forEach(f => {
      if (f.toLowerCase().includes(searchLower)) {
        results.push(`shared/${f}`)
      }
    })
    
    const list = results.slice(0, 20).join('\n')
    return { content: [{ type: 'text', text: list || 'No documentation found matching your search.' }] }
  } catch (err) {
    return { content: [{ type: 'text', text: `❌ Error searching documentation: ${err.message}` }] }
  }
})

