import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { authFetch } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import useFocusTrap from '../../hooks/useFocusTrap'
import { API_BASE } from '../../config/api'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useSite } from '../../context/SiteContext'
import DocumentationTab from '../../components/DocumentationTab'
import RelatedDocumentation from '../../components/RelatedDocumentation'
import DocumentationLinkingInterface from '../../components/DocumentationLinkingInterface'
import DocumentationStatusTracker from '../../components/DocumentationStatusTracker'
import DocumentationSearch from '../../components/DocumentationSearch'

// Renders children into document.body so overflow:hidden on parent containers
// doesn't clip fixed overlays.
function Portal({ children }) {
  return createPortal(children, document.body)
}

const API = `${API_BASE}/api/pt`

const SHIRT_COLORS = { XS: 'var(--green)', S: 'var(--blue)', M: 'var(--yellow)', L: 'var(--orange)', XL: 'var(--red)' }
const TYPE_ICONS   = { Enhancement: '🚀', Bug: '🐛', 'Change Request': '🔄' }
const STATUS_COLORS = {
  Active: 'var(--green)', 'In Progress': 'var(--blue)', 'On Hold': 'var(--yellow)', Completed: 'var(--blue)', Cancelled: 'var(--red)',
  Idea: 'var(--purple)', Backlog: 'var(--gray-400)', 'In Review': 'var(--yellow)', Done: 'var(--green)',
  Planning: 'var(--gray-400)', Released: 'var(--green)',
}
const PRIORITY_COLORS = { Low: 'var(--green)', Medium: 'var(--blue)', High: 'var(--orange)', Critical: 'var(--red)' }

function ShirtBadge({ size }) {
  return <span className="badge" style={{ background: `${SHIRT_COLORS[size]}22`, color: SHIRT_COLORS[size] }}>{size}</span>
}
function StatusBadge({ status }) {
  return <span className="badge" style={{ background: `${STATUS_COLORS[status]}22`, color: STATUS_COLORS[status] }}>{status}</span>
}
function PriorityBadge({ priority }) {
  return <span className="badge" style={{ background: `${PRIORITY_COLORS[priority]}22`, color: PRIORITY_COLORS[priority] }}>{priority}</span>
}

const TASK_STATUSES = ['Idea','Backlog','In Progress','In Review','Done']
const EMPTY_PROJECT = { id: null, name: '', description: '', status: 'Active', site_id: '' }
const SITES = [
  { id: 1, name: 'CardSparky', icon: '⚡' },
  { id: 2, name: 'Serial Killers', icon: '🔪' },
  { id: 3, name: 'Denick', icon: '🛡️' },
  { id: 4, name: 'Pitch Passport', icon: '⚽' },
]
const EMPTY_RELEASE = { id: null, project_id: '', version: '', name: '', description: '', release_date: '', status: 'Planning' }
const EMPTY_TASK = { id: null, project_id: '', release_id: '', title: '', description: '', plan: '', done: '', type: 'Enhancement', status: 'Idea', priority: 'Medium', shirt_size: 'S', assignee: 'Eric', est_hours: '', actual_hours: '', model: 'Auto' }

function useApi(url) {
  const [data, setData] = useState([])
  const urlRef = useRef(url)
  urlRef.current = url

  const load = useCallback(async () => {
    try {
      const r = await authFetch(urlRef.current)
      const json = await r.json()
      setData(Array.isArray(json) ? json : [])
    } catch (err) {
      console.error(`API Error loading ${urlRef.current}:`, err)
      setData([])
    }
  }, [])

  useEffect(() => { load() }, [url, load])
  return [data, load]
}

// ── Inline Project Detail ─────────────────────────────────────────────────────
// Renders as an expanded row directly below the selected project row.
function ProjectDetail({ project: initialProject, onRefresh, onClose }) {
  const [project, setProject] = useState(initialProject)
  const [editingField, setEditingField] = useState(null)
  const [tasks, setTasks] = useState([])
  const [releases, setReleases] = useState([])
  const [editingTask, setEditingTask] = useState(null)
  const [addingTask, setAddingTask] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const showToast = useToast()
  const newTask = { ...EMPTY_TASK, project_id: project.id }

  async function saveProjectField(field, value) {
    const updated = { ...project, [field]: value }
    setProject(updated)
    setEditingField(null)
    await authFetch(`${API}/projects/${project.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated)
    })
    showToast('Project updated', 'success')
    onRefresh()
  }

  const loadTasks = useCallback(async () => {
    try {
      const [tr, rr] = await Promise.all([
        authFetch(`${API}/tasks?project_id=${project.id}`).then(r => r.json()),
        authFetch(`${API}/releases?project_id=${project.id}`).then(r => r.json()),
      ])
      setTasks(Array.isArray(tr) ? tr : [])
      setReleases(Array.isArray(rr) ? rr : [])
    } catch {}
  }, [project.id])

  useEffect(() => { loadTasks() }, [loadTasks])

  async function updateTaskField(task, field, value) {
    await authFetch(`${API}/tasks/${task.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, [field]: value }),
    })
    loadTasks(); onRefresh()
  }

  async function saveTask(t) {
    if (!t.title) return
    const method = t.id ? 'PUT' : 'POST'
    const url = t.id ? `${API}/tasks/${t.id}` : `${API}/tasks`
    await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) })
    showToast(t.id ? 'Task updated' : 'Task created', 'success')
    setEditingTask(null); setAddingTask(false); loadTasks(); onRefresh()
  }

  async function delTask(id) {
    await authFetch(`${API}/tasks/${id}`, { method: 'DELETE' })
    showToast('Task deleted', 'info')
    setConfirmDelete(null)
    loadTasks(); onRefresh()
  }

  const done = (Array.isArray(tasks) ? tasks : []).filter(t => t.status === 'Done').length
  const pct  = (Array.isArray(tasks) ? tasks.length : 0) ? Math.round((done / (Array.isArray(tasks) ? tasks.length : 1)) * 100) : 0
  const taskForm = editingTask || (addingTask ? newTask : null)

  return (
    <tr>
      <td colSpan={7} style={{ padding: 0, background: 'var(--gray-50)', borderTop: '2px solid var(--blue)' }}>
        <div style={{ padding: '1.25rem 1.5rem' }}>

          {/* Project meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', width: 80, flexShrink: 0 }}>Name</span>
                {editingField === 'name' ? (
                  <input autoFocus defaultValue={project.name}
                    onBlur={e => saveProjectField('name', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveProjectField('name', e.target.value)}
                    style={{ flex: 1, maxWidth: 400, padding: '0.25rem 0.5rem', border: '1px solid var(--blue)', borderRadius: 6, fontSize: '0.9rem', background: 'var(--card)', color: 'var(--text)' }} />
                ) : (
                  <span className="cell-editable" style={{ fontSize: '1rem', fontWeight: 700 }} onClick={() => setEditingField('name')}>{project.name}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', width: 80, flexShrink: 0, paddingTop: 2 }}>Description</span>
                {editingField === 'description' ? (
                  <textarea autoFocus defaultValue={project.description} rows={2}
                    onBlur={e => saveProjectField('description', e.target.value)}
                    style={{ flex: 1, maxWidth: 600, padding: '0.25rem 0.5rem', border: '1px solid var(--blue)', borderRadius: 6, fontSize: '0.85rem', background: 'var(--card)', color: 'var(--text)', resize: 'vertical', fontFamily: 'inherit' }} />
                ) : (
                  <span className="cell-editable" style={{ fontSize: '0.85rem', color: project.description ? 'var(--text)' : 'var(--text-muted)' }} onClick={() => setEditingField('description')}>
                    {project.description || 'Click to add description...'}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', width: 80, flexShrink: 0 }}>Status</span>
                <select value={project.status} onChange={e => saveProjectField('status', e.target.value)}
                  style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', border: '1px solid var(--gray-200)', borderRadius: 6, background: `${STATUS_COLORS[project.status]}22`, color: STATUS_COLORS[project.status], fontWeight: 600, cursor: 'pointer' }}>
                  {['Active','In Progress','On Hold','Completed','Cancelled'].map(s => <option key={s}>{s}</option>)}
                </select>
                <ShirtBadge size={project.shirt_size} />
              </div>
            </div>
            <button className="btn-cancel" style={{ fontSize: '0.8rem', flexShrink: 0 }} onClick={onClose}>Close</button>
          </div>

          {/* KPIs + progress */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { label: 'Total',       value: (Array.isArray(tasks) ? tasks.length : 0),                                         color: 'var(--blue)' },
                { label: 'In Progress', value: (Array.isArray(tasks) ? tasks : []).filter(t => t.status === 'In Progress').length, color: 'var(--yellow)' },
                { label: 'In Review',   value: (Array.isArray(tasks) ? tasks : []).filter(t => t.status === 'In Review').length,   color: 'var(--orange)' },
                { label: 'Done',        value: done,                                                  color: 'var(--green)' },
              ].map(k => (
                <div key={k.label} style={{ background: 'var(--card)', borderRadius: 'var(--radius)', padding: '0.4rem 0.75rem', textAlign: 'center', border: '1px solid var(--border)', minWidth: 64 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: k.color }}>{k.value}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.label}</div>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                <span>Progress</span><span>{pct}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green)', borderRadius: 4, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          </div>

          {/* Task form */}
          {taskForm && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 700 }}>
              <input placeholder="Task title *" value={taskForm.title}
                onChange={e => editingTask ? setEditingTask(t => ({ ...t, title: e.target.value })) : setAddingTask(t => ({ ...newTask, ...t, title: e.target.value }))}
                style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', fontSize: '0.85rem', background: 'var(--card)', color: 'var(--text)' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                {[
                  { key: 'type',       opts: ['Enhancement','Bug','Change Request'] },
                  { key: 'status',     opts: ['Backlog','In Progress','In Review','Done'] },
                  { key: 'priority',   opts: ['Low','Medium','High','Critical'] },
                  { key: 'shirt_size', opts: ['XS','S','M','L','XL'] },
                  { key: 'model',      opts: ['Auto','Claude Sonnet 4.5','Claude Sonnet 4','Claude Haiku 4.5','Deepseek 3.2','MiniMax M2.5','MiniMac M2.1','GLM 5','Qwen3 Coder Next'] },
                ].map(f => (
                  <select key={f.key} className="opp-filter" style={{ width: '100%' }}
                    value={taskForm[f.key]}
                    onChange={e => editingTask ? setEditingTask(t => ({ ...t, [f.key]: e.target.value })) : setAddingTask(t => ({ ...newTask, ...t, [f.key]: e.target.value }))}>
                    {f.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <input placeholder="Assignee" value={taskForm.assignee}
                  onChange={e => editingTask ? setEditingTask(t => ({ ...t, assignee: e.target.value })) : setAddingTask(t => ({ ...newTask, ...t, assignee: e.target.value }))}
                  style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', fontSize: '0.85rem', background: 'var(--card)', color: 'var(--text)' }}
                />
                <input type="number" step="0.5" min="0" placeholder="Est. Hours" value={taskForm.est_hours ?? ''}
                  onChange={e => editingTask ? setEditingTask(t => ({ ...t, est_hours: e.target.value })) : setAddingTask(t => ({ ...newTask, ...t, est_hours: e.target.value }))}
                  style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', fontSize: '0.85rem', background: 'var(--card)', color: 'var(--text)' }}
                />
                <input type="number" step="0.5" min="0" placeholder="Actual Hours" value={taskForm.actual_hours ?? ''}
                  onChange={e => editingTask ? setEditingTask(t => ({ ...t, actual_hours: e.target.value })) : setAddingTask(t => ({ ...newTask, ...t, actual_hours: e.target.value }))}
                  style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', fontSize: '0.85rem', background: 'var(--card)', color: 'var(--text)' }}
                />
              </div>
              {/* Plan & Done */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>📋 Plan</label>
                  <textarea
                    rows={3}
                    placeholder="What needs to be done..."
                    value={taskForm.plan ?? ''}
                    onChange={e => editingTask ? setEditingTask(t => ({ ...t, plan: e.target.value })) : setAddingTask(t => ({ ...newTask, ...t, plan: e.target.value }))}
                    style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid var(--blue)', borderRadius: 'var(--radius)', fontSize: '0.82rem', background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>✅ Done</label>
                  <textarea
                    rows={3}
                    placeholder="What was actually implemented..."
                    value={taskForm.done ?? ''}
                    onChange={e => editingTask ? setEditingTask(t => ({ ...t, done: e.target.value })) : setAddingTask(t => ({ ...newTask, ...t, done: e.target.value }))}
                    style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid var(--green)', borderRadius: 'var(--radius)', fontSize: '0.82rem', background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button className="btn-cancel" onClick={() => { setEditingTask(null); setAddingTask(false) }}>Cancel</button>
                <button className="btn-save" onClick={() => saveTask(taskForm)} disabled={!taskForm.title}>Save Task</button>
              </div>
            </div>
          )}

          {/* Related Documentation */}
          {editingTask && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>📚 Related Documentation</div>
              <RelatedDocumentation taskId={editingTask.id} />
            </div>
          )}

          {/* Tasks header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tasks</span>
            {!addingTask && !editingTask && (
              <button className="btn-save" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setAddingTask(newTask)}>+ Add Task</button>
            )}
          </div>

          {/* Tasks table */}
          <div style={{ marginBottom: releases.length ? '1.25rem' : 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--gray-50)' }}>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '5%' }}>Type</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '5%' }}>ID</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '30%' }}>Title</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '12%' }}>Status</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '10%' }}>Priority</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '8%' }}>Size</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '12%' }}>Assignee</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '12%' }}>Model</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '8%' }}>Hours</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '7%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(tasks) ? tasks.length : 0) > 0 ? (Array.isArray(tasks) ? tasks : []).map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--card)'}>
                    <td style={{ padding: '0.5rem 0.75rem', fontSize: '1rem' }}>{TYPE_ICONS[t.type]}</td>
                    <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--brand)', fontFamily: 'monospace' }}>#{t.id}</td>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 500, color: 'var(--text)' }}>
                      <div style={{ marginBottom: '0.25rem' }}>{t.title}</div>
                      {t.plan && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.15rem', maxHeight: '2.4em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'pre-wrap', lineHeight: 1.2 }}>
                          📋 {t.plan}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <select value={t.status} onChange={e => updateTaskField(t, 'status', e.target.value)}
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.4rem', border: '1px solid var(--gray-200)', borderRadius: 4, background: `${STATUS_COLORS[t.status]}22`, color: STATUS_COLORS[t.status], fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                        {TASK_STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <ShirtBadge size={t.shirt_size} />
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {t.assignee || '—'}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <select value={t.model || 'Auto'} onChange={e => updateTaskField(t, 'model', e.target.value)}
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.4rem', border: '1px solid var(--gray-200)', borderRadius: 4, background: 'var(--gray-50)', cursor: 'pointer', width: '100%' }}>
                        {['Auto','Claude Sonnet 4.5','Claude Sonnet 4','Claude Haiku 4.5','Deepseek 3.2','MiniMax M2.5','MiniMac M2.1','GLM 5','Qwen3 Coder Next'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {t.est_hours ? `${t.est_hours}h` : '—'}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                        <button className="row-hover-btn" style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }} onClick={() => { setAddingTask(false); setEditingTask({ ...t, release_id: t.release_id ?? '' }) }}>Edit</button>
                        <button className="row-hover-btn danger" style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }} onClick={() => setConfirmDelete(t.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem', background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                      No tasks yet — add one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          
          {/* Documentation */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>📚 Documentation</div>
            <div style={{ background: 'white', borderRadius: 8, padding: '1rem', border: '1px solid var(--border)' }}>
              <DocumentationTab projectId={project.id} />
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>🔗 Link Documentation</div>
                <DocumentationLinkingInterface />
              </div>
            </div>
          </div>

{/* Releases */}
          {releases.length > 0 && (
            <>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Releases</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Array.isArray(releases) && releases.map(r => (
                  <div key={r.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.5rem 0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--brand)' }}>{r.version}</span>
                    {r.name && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.name}</span>}
                    <StatusBadge status={r.status} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{Number(r.done_count ?? 0)}/{Number(r.task_count ?? 0)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Task?"
        message="This will permanently delete this task. This cannot be undone."
        onConfirm={() => delTask(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
      </td>
    </tr>
  )
}
function EnhancementsImport({ projects, onImported, onClose }) {
  const [tasks, setTasks]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [projectId, setProjectId] = useState((Array.isArray(projects) && projects[0]?.id) ?? '')
  const [importing, setImporting] = useState(false)
  const [progress, setProgress]   = useState(null)
  const trapRef = useFocusTrap(true)

  useEffect(() => {
    authFetch(`${API}/parse-enhancements`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setTasks(d.tasks)
        // Pre-select all by default
        setSelected(new Set((Array.isArray(d.tasks) ? d.tasks : []).map(t => t.num)))
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  function toggleAll() {
    setSelected(s => s.size === (Array.isArray(tasks) ? tasks.length : 0) ? new Set() : new Set((Array.isArray(tasks) ? tasks : []).map(t => t.num)))
  }

  function toggle(num) {
    setSelected(s => { const n = new Set(s); n.has(num) ? n.delete(num) : n.add(num); return n })
  }

  async function handleImport() {
    if (!projectId || selected.size === 0) return
    const toImport = (Array.isArray(tasks) ? tasks : []).filter(t => selected.has(t.num))
    setImporting(true)
    setProgress({ done: 0, total: toImport.length })
    let succeeded = 0
    for (const t of toImport) {
      try {
        await authFetch(`${API}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            title: `#${t.num}. ${t.title}`,
            plan: t.plan,
            done: t.done,
            type: 'Enhancement',
            status: t.status,
            priority: 'Medium',
            shirt_size: 'S',
            assignee: '',
          })
        })
        succeeded++
      } catch {}
      setProgress(p => ({ ...p, done: p.done + 1 }))
    }
    setImporting(false)
    setProgress(null)
    onImported(succeeded)
    onClose()
  }

  const STATUS_COLORS_LOCAL = { Done: 'var(--green)', Backlog: 'var(--gray-400)' }

  return (
    <div className="panel-overlay" style={{ justifyContent: 'center', alignItems: 'center' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        ref={trapRef}
        className="modal"
        style={{ width: 720, padding: 0, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-modal-title"
      >
        <div className="modal-header">
          <h3 id="import-modal-title">📄 Import from Site Enhancements</h3>
          <button className="panel-close" onClick={onClose} aria-label="Close import dialog">✕</button>
        </div>

        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.5rem' }}>Assign to project:</label>
            <select className="opp-filter" value={projectId} onChange={e => setProjectId(e.target.value)}>
              <option value="">Select project...</option>
              {Array.isArray(projects) && projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {tasks.length > 0 && (
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              {selected.size} of {tasks.length} selected
            </span>
          )}
        </div>

        <div className="modal-body" style={{ overflowY: 'auto', padding: 0 }}>
          {loading && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ Parsing enhancements doc...</div>}
          {error  && <div className="opp-error" style={{ margin: '1rem' }}>⚠️ {error}</div>}

          {!loading && !error && (
            <table className="opp-table" style={{ fontSize: '0.82rem' }}>
              <thead className="sticky-header">
                <tr>
                  <th style={{ width: 36 }}>
                    <input type="checkbox"
                      checked={selected.size === tasks.length && tasks.length > 0}
                      ref={el => { if (el) el.indeterminate = selected.size > 0 && selected.size < tasks.length }}
                      onChange={toggleAll}
                    />
                  </th>
                  <th style={{ width: 36 }}>#</th>
                  <th>Title</th>
                  <th style={{ width: 80 }}>Status</th>
                  <th style={{ minWidth: 200 }}>Plan</th>
                  <th style={{ minWidth: 200 }}>Done</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(tasks) ? tasks : []).map(t => (
                  <tr key={t.num} style={{ opacity: selected.has(t.num) ? 1 : 0.45 }}>
                    <td>
                      <input type="checkbox" checked={selected.has(t.num)} onChange={() => toggle(t.num)} />
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{t.num}</td>
                    <td style={{ fontWeight: 500 }}>{t.title}</td>
                    <td>
                      <span className="badge" style={{ background: `${STATUS_COLORS_LOCAL[t.status]}22`, color: STATUS_COLORS_LOCAL[t.status] }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.plan}>
                      {t.plan || '—'}
                    </td>
                    <td style={{ color: t.done ? 'var(--green)' : 'var(--text-muted)', fontSize: '0.78rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.done}>
                      {t.done || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Progress bar */}
        {importing && progress && (
          <div style={{ padding: '0 1.25rem' }}>
            <div style={{ height: 4, background: 'var(--gray-100)', borderRadius: 2, overflow: 'hidden', marginBottom: '0.5rem' }}>
              <div style={{ width: `${(progress.done / progress.total) * 100}%`, height: '100%', background: 'var(--blue)', transition: 'width 0.2s ease' }} />
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={importing}>Cancel</button>
          <button
            className="btn-save"
            onClick={handleImport}
            disabled={importing || selected.size === 0 || !projectId}
          >
            {importing
              ? `Importing… ${progress?.done ?? 0}/${progress?.total ?? 0}`
              : `⬇ Import ${selected.size} task${selected.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Project New/Edit Modal ────────────────────────────────────────────────────
function ProjectModal({ editing, setEditing, save }) {
  const trapRef = useFocusTrap(true)
  return (
    <div
      ref={trapRef}
      className="modal"
      style={{ width: 600, padding: 0, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <div className="modal-header">
        <h3 id="project-modal-title">{editing.id ? 'Edit Project' : 'New Project'}</h3>
        <button className="panel-close" onClick={() => setEditing(null)} aria-label="Close dialog">✕</button>
      </div>
      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
        <div className="modal-field">
          <label htmlFor="proj-name">Project Name *</label>
          <input id="proj-name" value={editing.name} placeholder="e.g. Affiliate Marketing Phase 2" onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="modal-field">
          <label htmlFor="proj-desc">Description</label>
          <textarea id="proj-desc" rows={3} value={editing.description} placeholder="What is this project about?" onChange={e => setEditing(p => ({ ...p, description: e.target.value }))}
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', fontSize: '0.9rem', background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical' }} />
        </div>
        <div className="modal-field">
          <label htmlFor="proj-status">Status</label>
          <select id="proj-status" className="opp-filter" style={{ width: '100%' }} value={editing.status} onChange={e => setEditing(p => ({ ...p, status: e.target.value }))}>
            {['Active','In Progress','On Hold','Completed','Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="modal-field">
          <label htmlFor="proj-site">Site</label>
          <select id="proj-site" className="opp-filter" style={{ width: '100%' }} value={editing.site_id || ''} onChange={e => setEditing(p => ({ ...p, site_id: e.target.value ? parseInt(e.target.value) : null }))}>
            <option value="">All Sites</option>
            {SITES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
          </select>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn-cancel" onClick={() => setEditing(null)}>Cancel</button>
        <button className="btn-save" onClick={save} disabled={!editing.name}>Save Project</button>
      </div>
    </div>
  )
}

// ── Projects ──────────────────────────────────────────────────────────────────
function Projects({ onReload }) {
  const { activeSite } = useSite()
  const siteParam = activeSite?.id ? `?site_id=${activeSite.id}` : ''
  const [projects, reload] = useApi(`${API}/projects${siteParam}`)
  const [releases] = useApi(`${API}/releases`)
  const [editing, setEditing] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [importMsg, setImportMsg] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [syncProjectId, setSyncProjectId] = useState('')

  function reloadAll() { reload(); onReload?.() }

  async function handleSync() {
    const pid = syncProjectId || (Array.isArray(projects) && projects[0]?.id)
    if (!pid) return
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await authFetch(`${API}/sync-enhancements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: pid })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSyncResult(data)
      reloadAll()
    } catch (err) {
      setSyncResult({ error: err.message })
    }
    setSyncing(false)
  }

  const STATUS_ORDER = ['Active','In Progress','On Hold','Completed','Cancelled']

  const visible = (Array.isArray(projects) ? projects : [])
    .filter(p => !filterStatus || p.status === filterStatus)
    .sort((a, b) => {
      const aComp = a.status === 'Completed' || a.status === 'Cancelled'
      const bComp = b.status === 'Completed' || b.status === 'Cancelled'
      if (aComp !== bComp) return aComp ? 1 : -1
      return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
    })

  async function save() {
    if (!editing.name) return
    const method = editing.id ? 'PUT' : 'POST'
    const url = editing.id ? `${API}/projects/${editing.id}` : `${API}/projects`
    await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
    reload(); setEditing(null)
  }

  async function del(id) {
    if (!confirm('Delete project and all its tasks/releases?')) return
    await authFetch(`${API}/projects/${id}`, { method: 'DELETE' })
    reload()
    if (expandedId === id) setExpandedId(null)
  }

  return (
    <div className="opp-section">
      <div className="opp-header">
        <h3>📁 Projects</h3>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="opp-filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {['Active','In Progress','On Hold','Completed','Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="btn-cancel" style={{ fontSize: '0.82rem' }} onClick={() => setShowImport(true)}>
            📄 Import Enhancements
          </button>
          {/* Sync: pick project then sync */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <select className="opp-filter" value={syncProjectId} onChange={e => setSyncProjectId(e.target.value)} style={{ fontSize: '0.8rem' }}>
              <option value="">Pick project to sync…</option>
              {Array.isArray(projects) && projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button
              className="btn-cancel"
              style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}
              onClick={handleSync}
              disabled={syncing || (!syncProjectId && !(Array.isArray(projects) && projects[0]?.id))}
            >
              {syncing ? '⏳ Syncing…' : '🔄 Sync from Doc'}
            </button>
          </div>
          <button className="btn-save" onClick={() => setEditing({ ...EMPTY_PROJECT })}>+ New Project</button>
        </div>
      </div>

      {importMsg && (
        <div style={{ margin: '0 0 0.75rem', padding: '0.6rem 1rem', background: 'rgba(3,194,82,0.1)', border: '1px solid var(--green)', borderRadius: 'var(--radius)', fontSize: '0.85rem', color: 'var(--green)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✅ {importMsg}</span>
          <button onClick={() => setImportMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', fontSize: '1rem', lineHeight: 1 }}>✕</button>
        </div>
      )}

      {syncResult && !syncResult.error && (
        <div style={{ margin: '0 0 0.75rem', padding: '0.75rem 1rem', background: 'rgba(2,113,235,0.06)', border: '1px solid var(--blue)', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--blue)', marginBottom: '0.35rem' }}>
                🔄 Sync complete — {syncResult.updated.length} task{syncResult.updated.length !== 1 ? 's' : ''} updated, {syncResult.alreadyInSync.length} already in sync
              </div>
              {syncResult.updated.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {syncResult.updated.map(u => (
                    <span key={u.num} className="badge" style={{ background: 'rgba(2,113,235,0.1)', color: 'var(--blue)', fontSize: '0.75rem' }}>
                      #{u.num} {u.title} — {u.changes.join(', ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setSyncResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1, flexShrink: 0, marginLeft: '0.5rem' }}>✕</button>
          </div>
        </div>
      )}

      {syncResult?.error && (
        <div style={{ margin: '0 0 0.75rem', padding: '0.6rem 1rem', background: 'rgba(229,62,62,0.08)', border: '1px solid var(--red)', borderRadius: 'var(--radius)', fontSize: '0.85rem', color: 'var(--red)', display: 'flex', justifyContent: 'space-between' }}>
          <span>⚠️ Sync failed: {syncResult.error}</span>
          <button onClick={() => setSyncResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)' }}>✕</button>
        </div>
      )}

      <table className="opp-table">
        <thead>
          <tr>
            <th style={{ width: 28 }} />
            <th>Name</th>
            <th>Site</th>
            <th>Status</th>
            <th>Size</th>
            <th>Tasks</th>
            <th>Latest Release</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 && (
            <tr><td colSpan={7} className="opp-empty">No projects found.</td></tr>
          )}
          {visible.map(p => {
            const isExpanded = expandedId === p.id
            const latestRelease = (Array.isArray(releases) ? releases : []).filter(r => r.project_id === p.id).sort((a, b) => b.id - a.id)[0]
            return (
              <React.Fragment key={p.id}>
                <tr
                  className="opp-row-clickable"
                  style={{ background: isExpanded ? 'rgba(2,113,235,0.06)' : undefined }}
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                >
                  <td style={{ textAlign: 'center', color: 'var(--blue)', fontSize: '0.75rem', fontWeight: 700 }}>
                    {isExpanded ? '▼' : '▶'}
                  </td>
                  <td className="opp-name" style={{ fontWeight: isExpanded ? 700 : 500 }}><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginRight: '0.4rem' }}>#{p.id}</span>{p.name}</td>
                  <td style={{ fontSize: '0.82rem' }}>{(() => { const s = SITES.find(s => s.id === p.site_id); return s ? `${s.icon} ${s.name}` : '—' })()}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td><ShirtBadge size={p.shirt_size} /></td>
                  <td>{Number(p.done_count ?? 0)}/{Number(p.task_count ?? 0)}</td>
                  <td>
                    {latestRelease
                      ? <span style={{ fontSize: '0.8rem' }}><span style={{ color: 'var(--brand)', fontWeight: 600 }}>{latestRelease.version}</span> <StatusBadge status={latestRelease.status} /></span>
                      : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="row-hover-actions" style={{ opacity: 1 }}>
                      <button className="row-hover-btn" onClick={() => setEditing({ ...p })}>Edit</button>
                      <button className="row-hover-btn danger" onClick={() => del(p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <ProjectDetail
                    project={p}
                    onRefresh={reloadAll}
                    onClose={() => setExpandedId(null)}
                  />
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>

      {showImport && (
        <EnhancementsImport
          projects={projects}
          onImported={count => {
            reloadAll()
            setImportMsg(`Imported ${count} task${count !== 1 ? 's' : ''} from site-enhancements.md`)
          }}
          onClose={() => setShowImport(false)}
        />
      )}

      {editing && (
        <div className="panel-overlay" style={{ justifyContent: 'center', alignItems: 'center' }} onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <ProjectModal editing={editing} setEditing={setEditing} save={save} />
        </div>
      )}
    </div>
  )
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
function Tasks({ projects }) {
  const [tasks, reload] = useApi(`${API}/tasks`)
  const [releases, reloadReleases] = useApi(`${API}/releases`)
  const [editing, setEditing] = useState(null)
  const [filterProject, setFilterProject] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const showToast = useToast()

  useEffect(() => { reloadReleases() }, [reloadReleases])

  const visible = (Array.isArray(tasks) ? tasks : []).filter(t =>
    (!filterProject || String(t.project_id) === filterProject) &&
    (!filterStatus  || t.status === filterStatus) &&
    (!filterType    || t.type === filterType)
  )

  async function save() {
    if (!editing.title || !editing.project_id) return
    const method = editing.id ? 'PUT' : 'POST'
    const url = editing.id ? `${API}/tasks/${editing.id}` : `${API}/tasks`
    await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
    showToast(editing.id ? 'Task updated' : 'Task created', 'success')
    reload(); setEditing(null)
  }

  async function del(id) {
    await authFetch(`${API}/tasks/${id}`, { method: 'DELETE' })
    showToast('Task deleted', 'info')
    reload()
  }

  const projectRelease = (Array.isArray(releases) ? releases : []).filter(r => !editing?.project_id || String(r.project_id) === String(editing?.project_id))

  return (
    <div className="opp-section">
      <div className="opp-header">
        <h3>✅ Tasks</h3>
        <button className="btn-save" onClick={() => setEditing({ ...EMPTY_TASK })}>+ New Task</button>
      </div>
      <div className="opp-toolbar">
        <select className="opp-filter" value={filterProject} onChange={e => setFilterProject(e.target.value)}>
          <option value="">All Projects</option>
          {Array.isArray(projects) && projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="opp-filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {TASK_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="opp-filter" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {['Enhancement','Bug','Change Request'].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <table className="opp-table">
        <thead><tr><th>Type</th><th>Title</th><th>Project</th><th>Status</th><th>Priority</th><th>Size</th><th>Model</th><th>Assignee</th><th>Est Hrs</th><th>Actual Hrs</th><th>Actions</th></tr></thead>
        <tbody>
          {visible.map(t => (
            <tr key={t.id}>
              <td title={t.type}>{TYPE_ICONS[t.type]}</td>
              <td>{t.title}</td>
              <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{projects.find(p => p.id === t.project_id)?.name ?? '—'}</td>
              <td><StatusBadge status={t.status} /></td>
              <td><PriorityBadge priority={t.priority} /></td>
              <td><ShirtBadge size={t.shirt_size} /></td>
              <td style={{ fontSize: '0.8rem' }}>{t.model || 'Auto'}</td>
              <td style={{ fontSize: '0.8rem' }}>{t.assignee || '—'}</td>
              <td style={{ fontSize: '0.8rem' }}>{t.est_hours ?? '—'}</td>
              <td style={{ fontSize: '0.8rem' }}>{t.actual_hours ?? '—'}</td>
              <td>
                <div className="row-hover-actions" style={{ opacity: 1 }}>
                  <button className="row-hover-btn" onClick={() => setEditing({ ...t, release_id: t.release_id ?? '' })}>Edit</button>
                  <button className="row-hover-btn danger" onClick={() => del(t.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {!visible.length && <tr><td colSpan={11} className="opp-empty">No tasks found.</td></tr>}
        </tbody>
      </table>

      {editing && (
        <div className="panel-overlay" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div className="panel" role="dialog" aria-modal="true" aria-labelledby="task-panel-title">
            <div className="panel-header">
              <h3 id="task-panel-title">{editing.id ? 'Edit Task' : 'New Task'}</h3>
              <button className="panel-close" onClick={() => setEditing(null)} aria-label="Close dialog">✕</button>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="modal-field">
                <label>Project *</label>
                <select className="opp-filter" style={{ width: '100%' }} value={editing.project_id} onChange={e => setEditing(p => ({ ...p, project_id: e.target.value, release_id: '' }))}>
                  <option value="">Select project...</option>
                  {Array.isArray(projects) && projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="modal-field">
                <label>Title *</label>
                <input value={editing.title} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label>Description</label>
                <input value={editing.description} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} />
              </div>
              {[
                { key: 'type',       label: 'Type',      opts: ['Enhancement','Bug','Change Request'] },
                { key: 'status',     label: 'Status',    opts: TASK_STATUSES },
                { key: 'priority',   label: 'Priority',  opts: ['Low','Medium','High','Critical'] },
                { key: 'shirt_size', label: 'Size',      opts: ['XS','S','M','L','XL'] },
                { key: 'model',      label: 'Model',     opts: ['Auto','Claude Sonnet 4.5','Claude Sonnet 4','Claude Haiku 4.5','Deepseek 3.2','MiniMax M2.5','MiniMac M2.1','GLM 5','Qwen3 Coder Next'] },
              ].map(f => (
                <div className="modal-field" key={f.key}>
                  <label>{f.label}</label>
                  <select className="opp-filter" style={{ width: '100%' }} value={editing[f.key]} onChange={e => setEditing(p => ({ ...p, [f.key]: e.target.value }))}>
                    {f.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div className="modal-field">
                <label>Release</label>
                <select className="opp-filter" style={{ width: '100%' }} value={editing.release_id} onChange={e => setEditing(p => ({ ...p, release_id: e.target.value }))}>
                  <option value="">None</option>
                  {projectRelease.map(r => <option key={r.id} value={r.id}>{r.version} {r.name ? `— ${r.name}` : ''}</option>)}
                </select>
              </div>
              <div className="modal-field">
                <label>Assignee</label>
                <input value={editing.assignee} onChange={e => setEditing(p => ({ ...p, assignee: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="modal-field">
                  <label>Est. Hours</label>
                  <input type="number" step="0.5" min="0" value={editing.est_hours ?? ''} onChange={e => setEditing(p => ({ ...p, est_hours: e.target.value }))} placeholder="0.0" />
                </div>
                <div className="modal-field">
                  <label>Actual Hours</label>
                  <input type="number" step="0.5" min="0" value={editing.actual_hours ?? ''} onChange={e => setEditing(p => ({ ...p, actual_hours: e.target.value }))} placeholder="0.0" />
                </div>
              </div>
              <div className="modal-field">
                <label style={{ color: 'var(--blue)' }}>📋 Plan</label>
                <textarea rows={3} value={editing.plan ?? ''} placeholder="What needs to be done..."
                  onChange={e => setEditing(p => ({ ...p, plan: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--blue)', borderRadius: 'var(--radius)', fontSize: '0.88rem', background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
              <div className="modal-field">
                <label style={{ color: 'var(--green)' }}>✅ Done</label>
                <textarea rows={3} value={editing.done ?? ''} placeholder="What was actually implemented..."
                  onChange={e => setEditing(p => ({ ...p, done: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--green)', borderRadius: 'var(--radius)', fontSize: '0.88rem', background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-save" onClick={save} disabled={!editing.title || !editing.project_id}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Releases ──────────────────────────────────────────────────────────────────
function Releases({ projects }) {
  const [releases, reload] = useApi(`${API}/releases`)
  const [editing, setEditing] = useState(null)

  async function save() {
    if (!editing.version || !editing.project_id) return
    const method = editing.id ? 'PUT' : 'POST'
    const url = editing.id ? `${API}/releases/${editing.id}` : `${API}/releases`
    await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
    reload(); setEditing(null)
  }

  async function del(id) {
    await authFetch(`${API}/releases/${id}`, { method: 'DELETE' }); reload()
  }

  return (
    <div className="opp-section">
      <div className="opp-header">
        <h3>🚢 Releases</h3>
        <button className="btn-save" onClick={() => setEditing({ ...EMPTY_RELEASE })}>+ New Release</button>
      </div>
      <table className="opp-table">
        <thead><tr><th>Version</th><th>Name</th><th>Project</th><th>Status</th><th>Release Date</th><th>Tasks</th><th>Actions</th></tr></thead>
        <tbody>
          {Array.isArray(releases) && releases.map(r => (
            <tr key={r.id}>
              <td className="opp-name">{r.version}</td>
              <td>{r.name}</td>
              <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{projects.find(p => p.id === r.project_id)?.name ?? '—'}</td>
              <td><StatusBadge status={r.status} /></td>
              <td style={{ fontSize: '0.8rem' }}>{r.release_date ? new Date(r.release_date).toLocaleDateString() : '—'}</td>
              <td>{Number(r.done_count ?? 0)}/{Number(r.task_count ?? 0)}</td>
              <td>
                <div className="row-hover-actions" style={{ opacity: 1 }}>
                  <button className="row-hover-btn" onClick={() => setEditing({ ...r, release_date: r.release_date ? r.release_date.split('T')[0] : '' })}>Edit</button>
                  <button className="row-hover-btn danger" onClick={() => del(r.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {!releases.length && <tr><td colSpan={7} className="opp-empty">No releases yet.</td></tr>}
        </tbody>
      </table>

      {editing && (
        <div className="panel-overlay" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div className="panel" role="dialog" aria-modal="true" aria-labelledby="release-panel-title">
            <div className="panel-header">
              <h3 id="release-panel-title">{editing.id ? 'Edit Release' : 'New Release'}</h3>
              <button className="panel-close" onClick={() => setEditing(null)} aria-label="Close dialog">✕</button>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="modal-field">
                <label>Project *</label>
                <select className="opp-filter" style={{ width: '100%' }} value={editing.project_id} onChange={e => setEditing(p => ({ ...p, project_id: e.target.value }))}>
                  <option value="">Select project...</option>
                  {Array.isArray(projects) && projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              {[{ key: 'version', label: 'Version *', placeholder: 'v1.0.0' }, { key: 'name', label: 'Name', placeholder: 'Release name' }, { key: 'description', label: 'Description', placeholder: '' }].map(f => (
                <div className="modal-field" key={f.key}>
                  <label>{f.label}</label>
                  <input value={editing[f.key]} placeholder={f.placeholder} onChange={e => setEditing(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div className="modal-field">
                <label>Status</label>
                <select className="opp-filter" style={{ width: '100%' }} value={editing.status} onChange={e => setEditing(p => ({ ...p, status: e.target.value }))}>
                  {['Planning','In Progress','Released'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="modal-field">
                <label>Release Date</label>
                <input type="date" value={editing.release_date} onChange={e => setEditing(p => ({ ...p, release_date: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-save" onClick={save} disabled={!editing.version || !editing.project_id}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Ideas ──────────────────────────────────────────────────────────────────
function Ideas({ projects }) {
  const [tasks, reload] = useApi(`${API}/tasks?status=Idea`)
  const [releases, reloadReleases] = useApi(`${API}/releases`)
  const [bulkText, setBulkText] = useState('')
  const [bulkProject, setBulkProject] = useState('')
  const [importing, setImporting] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => { reloadReleases() }, [reloadReleases])

  async function handleBulkImport() {
    const ideas = bulkText.split('\n').map(l => l.trim()).filter(Boolean)
    if (!ideas.length) return
    setImporting(true)
    await authFetch(`${API}/tasks/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideas, project_id: bulkProject || null })
    })
    setBulkText(''); reload(); setImporting(false)
  }

  async function promoteTask(task, release_id, project_id) {
    await authFetch(`${API}/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, status: 'Backlog', release_id: release_id || null, project_id: project_id || task.project_id })
    })
    reload()
  }

  async function del(id) {
    await authFetch(`${API}/tasks/${id}`, { method: 'DELETE' }); reload()
  }

  async function save() {
    if (!editing.title) return
    await authFetch(`${API}/tasks/${editing.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing)
    })
    setEditing(null); reload()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Bulk import */}
      <div className="opp-section">
        <div className="opp-header"><h3>💡 Bulk Import Ideas</h3></div>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Type one idea per line, then click Import.</p>
          <textarea
            rows={6}
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
            placeholder={'Add dark mode toggle to research page\neBay price lookup on card detail\nExport my cards to CSV\nPush notifications for price drops'}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', fontSize: '0.88rem', background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <select className="opp-filter" value={bulkProject} onChange={e => setBulkProject(e.target.value)}>
              <option value="">No project (unassigned)</option>
              {Array.isArray(projects) && projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button className="btn-save" onClick={handleBulkImport} disabled={importing || !bulkText.trim()}>
              {importing ? 'Importing...' : `⬇️ Import ${bulkText.split('\n').filter(l => l.trim()).length} Ideas`}
            </button>
          </div>
        </div>
      </div>

      {/* Ideas list */}
      <div className="opp-section">
        <div className="opp-header">
          <h3>📝 Ideas Backlog <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>({tasks.length})</span></h3>
        </div>
        <table className="opp-table">
          <thead><tr><th>Idea</th><th>Project</th><th>Priority</th><th>Size</th><th>Assign to Release</th><th>Actions</th></tr></thead>
          <tbody>
            {(Array.isArray(tasks) ? tasks : []).map(t => (
              <tr key={t.id}>
                <td style={{ fontWeight: 500 }}>{t.title}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{projects.find(p => p.id === t.project_id)?.name ?? <span style={{ color: 'var(--gray-400)' }}>Unassigned</span>}</td>
                <td><PriorityBadge priority={t.priority} /></td>
                <td><ShirtBadge size={t.shirt_size} /></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select className="opp-filter" style={{ fontSize: '0.78rem' }}
                      defaultValue=""
                      onChange={e => e.target.value && promoteTask(t, e.target.value, t.project_id)}>
                      <option value="">Move to release...</option>
                      {Array.isArray(releases) && releases.map(r => <option key={r.id} value={r.id}>{r.version} — {r.name || (Array.isArray(projects) && projects.find(p => p.id === r.project_id)?.name)}</option>)}
                    </select>
                  </div>
                </td>
                <td>
                  <div className="row-hover-actions" style={{ opacity: 1 }}>
                    <button className="row-hover-btn" onClick={() => setEditing({ ...t, release_id: t.release_id ?? '' })}>Edit</button>
                    <button className="row-hover-btn danger" onClick={() => del(t.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!tasks.length && <tr><td colSpan={6} className="opp-empty">No ideas yet. Use the bulk importer above.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="panel-overlay" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div className="modal" style={{ width: 560, padding: 0 }}>
            <div className="modal-header">
              <h3>Edit Idea</h3>
              <button className="panel-close" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="modal-field">
                <label>Title *</label>
                <input value={editing.title} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label>Description</label>
                <textarea rows={2} value={editing.description} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', fontSize: '0.9rem', background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
              <div className="modal-field">
                <label>Project</label>
                <select className="opp-filter" style={{ width: '100%' }} value={editing.project_id ?? ''} onChange={e => setEditing(p => ({ ...p, project_id: e.target.value }))}>
                  <option value="">Unassigned</option>
                  {Array.isArray(projects) && projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              {[
                { key: 'priority',   label: 'Priority',  opts: ['Low','Medium','High','Critical'] },
                { key: 'shirt_size', label: 'Size',      opts: ['XS','S','M','L','XL'] },
              ].map(f => (
                <div className="modal-field" key={f.key}>
                  <label>{f.label}</label>
                  <select className="opp-filter" style={{ width: '100%' }} value={editing[f.key]} onChange={e => setEditing(p => ({ ...p, [f.key]: e.target.value }))}>
                    {f.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-save" onClick={save} disabled={!editing.title}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Roadmap ──────────────────────────────────────────────────────────────────
function Roadmap({ projects }) {
  const [releases, reloadReleases] = useApi(`${API}/releases`)
  const [tasks, reloadTasks] = useApi(`${API}/tasks`)

  useEffect(() => { reloadReleases(); reloadTasks() }, [reloadReleases, reloadTasks])

  const unassigned = (Array.isArray(tasks) ? tasks : []).filter(t => !t.release_id && t.status !== 'Idea')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {Array.isArray(releases) && releases.map(r => {
        const relTasks = (Array.isArray(tasks) ? tasks : []).filter(t => String(t.release_id) === String(r.id))
        const done = (Array.isArray(relTasks) ? relTasks : []).filter(t => t.status === 'Done').length
        const pct  = relTasks.length ? Math.round((done / relTasks.length) * 100) : 0
        const project = projects.find(p => p.id === r.project_id)
        const totalShirt = relTasks.reduce((s, t) => s + ({ XS:1, S:3, M:8, L:20, XL:40 }[t.shirt_size] ?? 3), 0)
        const shirtLabel = totalShirt <= 10 ? 'XS' : totalShirt <= 25 ? 'S' : totalShirt <= 50 ? 'M' : totalShirt <= 100 ? 'L' : 'XL'

        return (
          <div key={r.id} className="opp-section">
            <div className="opp-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h3 style={{ color: 'var(--brand)' }}>{r.version}</h3>
                {r.name && <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{r.name}</span>}
                {project && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>• {project.name}</span>}
                <StatusBadge status={r.status} />
                <ShirtBadge size={shirtLabel} />
                {r.release_date && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📅 {new Date(r.release_date).toLocaleDateString()}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{done}/{relTasks.length} done</span>
                <div style={{ width: 100, height: 8, background: 'var(--gray-100)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green)', borderRadius: 4, transition: 'width 0.6s ease' }} />
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{pct}%</span>
              </div>
            </div>
            {relTasks.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem', padding: '1rem 1.5rem' }}>
                {(Array.isArray(relTasks) ? relTasks : []).map(t => (
                  <div key={t.id} style={{ background: 'var(--card)', border: `1px solid ${t.status === 'Done' ? 'var(--green)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', opacity: t.status === 'Done' ? 0.7 : 1 }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>{TYPE_ICONS[t.type]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', textDecoration: t.status === 'Done' ? 'line-through' : 'none' }}>{t.title}</div>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <StatusBadge status={t.status} />
                        <PriorityBadge priority={t.priority} />
                        <ShirtBadge size={t.shirt_size} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="opp-empty">No tasks assigned to this release yet.</div>
            )}
          </div>
        )
      })}

      {unassigned.length > 0 && (
        <div className="opp-section">
          <div className="opp-header"><h3 style={{ color: 'var(--text-muted)' }}>📥 Unassigned Tasks</h3></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem', padding: '1rem 1.5rem' }}>
            {unassigned.map(t => (
              <div key={t.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{TYPE_ICONS[t.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>{t.title}</div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    <StatusBadge status={t.status} />
                    <ShirtBadge size={t.shirt_size} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!releases.length && <div className="opp-empty" style={{ padding: '3rem', textAlign: 'center' }}>No releases yet. Create one in the Releases tab.</div>}
    </div>
  )
}

// ── Analysis ──────────────────────────────────────────────────────────────────
function Analysis() {
  const [data, setData] = useState(null)

  useEffect(() => {
    authFetch(`${API}/analysis`).then(r => r.json()).then(setData).catch(() => {})
  }, [])

  if (!data) return <div className="opp-loading">Loading analysis...</div>

  function BarChart({ rows, labelKey, countKey, color }) {
    const max = Math.max(...rows.map(r => Number(r[countKey])), 1)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {rows.map(r => (
          <div key={r[labelKey]} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ width: 110, fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>{r[labelKey]}</span>
            <div style={{ flex: 1, height: 20, background: 'var(--gray-100)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ width: `${(Number(r[countKey]) / max) * 100}%`, height: '100%', background: color, borderRadius: 10, transition: 'width 0.6s ease' }} />
            </div>
            <span style={{ width: 30, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', textAlign: 'right' }}>{r[countKey]}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="kpi-grid">
        {[
          { label: 'Total Projects', value: (data.projectStats || []).reduce((s, r) => s + Number(r.cnt), 0), accent: 'var(--blue)' },
          { label: 'Total Tasks',    value: (data.tasksByStatus || []).reduce((s, r) => s + Number(r.cnt), 0), accent: 'var(--purple)' },
          { label: 'Done',           value: (data.tasksByStatus || []).find(r => r.status === 'Done')?.cnt ?? 0, accent: 'var(--green)' },
          { label: 'Total Releases', value: (data.releaseStats || []).reduce((s, r) => s + Number(r.releases), 0), accent: 'var(--orange)' },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-accent" style={{ background: k.accent }} />
            <div className="kpi-content">
              <span className="kpi-value">{k.value}</span>
              <span className="kpi-label">{k.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="home-grid">
        <div className="opp-section">
          <div className="opp-header"><h3>Tasks by Type</h3></div>
          <div style={{ padding: '1rem 1.5rem' }}>
            <BarChart rows={data.tasksByType || []} labelKey="type" countKey="cnt" color="var(--blue)" />
          </div>
        </div>
        <div className="opp-section">
          <div className="opp-header"><h3>Tasks by Status</h3></div>
          <div style={{ padding: '1rem 1.5rem' }}>
            <BarChart rows={data.tasksByStatus || []} labelKey="status" countKey="cnt" color="var(--green)" />
          </div>
        </div>
        <div className="opp-section">
          <div className="opp-header"><h3>Tasks by Priority</h3></div>
          <div style={{ padding: '1rem 1.5rem' }}>
            <BarChart rows={data.tasksByPriority || []} labelKey="priority" countKey="cnt" color="var(--orange)" />
          </div>
        </div>
        <div className="opp-section">
          <div className="opp-header"><h3>Tasks by Shirt Size</h3></div>
          <div style={{ padding: '1rem 1.5rem' }}>
            <BarChart rows={data.tasksByShirt || []} labelKey="shirt_size" countKey="cnt" color="var(--purple)" />
          </div>
        </div>
      </div>

      <div className="opp-section">
        <div className="opp-header"><h3>Project Shirt Sizes</h3></div>
        <table className="opp-table">
          <thead><tr><th>Project</th><th>Status</th><th>Shirt Size</th><th>Progress</th></tr></thead>
          <tbody>
            {(data.projectsWithShirt || []).map(p => (
              <tr key={p.id}>
                <td className="opp-name"><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginRight: '0.4rem' }}>#{p.id}</span>{p.name}</td>
                <td><StatusBadge status={p.status} /></td>
                <td><ShirtBadge size={p.shirt_size} /></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ flex: 1, height: 8, background: 'var(--gray-100)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${p.task_count > 0 ? (p.done_count / p.task_count) * 100 : 0}%`, height: '100%', background: 'var(--green)', borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Number(p.done_count ?? 0)}/{Number(p.task_count ?? 0)}</span>
                  </div>
                </td>
              </tr>
            ))}
            {!(data.projectsWithShirt || []).length && <tr><td colSpan={4} className="opp-empty">No projects yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}


// ── Documentation ────────────────────────────────────────────────────────────
function Documentation({ projects }) {
  const [selectedProject, setSelectedProject] = useState(null)
  const [view, setView] = useState('search') // 'search', 'status', 'linking'

  return (
    <div style={{ padding: 'var(--sp-4)' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setView('search')}
          style={{
            padding: '0.75rem 1rem',
            background: view === 'search' ? 'var(--blue)' : 'var(--gray-50)',
            color: view === 'search' ? 'white' : 'var(--text)',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          🔍 Search Documentation
        </button>
        <button
          onClick={() => setView('status')}
          style={{
            padding: '0.75rem 1rem',
            background: view === 'status' ? 'var(--blue)' : 'var(--gray-50)',
            color: view === 'status' ? 'white' : 'var(--text)',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          📋 Status Tracking
        </button>
        <button
          onClick={() => setView('linking')}
          style={{
            padding: '0.75rem 1rem',
            background: view === 'linking' ? 'var(--blue)' : 'var(--gray-50)',
            color: view === 'linking' ? 'white' : 'var(--text)',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          🔗 Link Documentation
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 8, padding: '1.5rem', minHeight: '400px' }}>
        {view === 'search' && <DocumentationSearch onSelectDoc={(doc) => setSelectedProject(doc)} />}
        {view === 'status' && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Documentation Status Tracking</h3>
            <p style={{ color: 'var(--text-muted)' }}>Select a project to track documentation status</p>
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {projects.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: selectedProject?.id === p.id ? 'var(--blue)22' : 'white',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {p.task_count} tasks
                  </div>
                </div>
              ))}
            </div>
            {selectedProject && <DocumentationStatusTracker docPath={selectedProject.name} projectId={selectedProject.id} />}
          </div>
        )}
        {view === 'linking' && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Link Documentation to Projects</h3>
            <DocumentationLinkingInterface />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'projects',      label: 'Projects',      icon: '📁' },
  { key: 'tasks',         label: 'Tasks',         icon: '✅' },
  { key: 'releases',      label: 'Releases',      icon: '🚢' },
  { key: 'ideas',         label: 'Ideas',         icon: '💡' },
  { key: 'roadmap',       label: 'Roadmap',       icon: '🗺️' },
  { key: 'analysis',      label: 'Analysis',      icon: '📊' },
  { key: 'documentation', label: 'Documentation', icon: '📚' },
]

export default function ProjectTracker() {
  const [tab, setTab] = useState('projects')
  const { activeSite } = useSite()
  const siteParam = activeSite?.id ? `?site_id=${activeSite.id}` : ''
  const [projects, reloadProjects] = useApi(`${API}/projects${siteParam}`)

  return (
    <div>
      <nav className="sub-tabs" style={{ marginBottom: 'var(--sp-6)' }}>
        {TABS.map(t => (
          <button key={t.key} className={`sub-tab ${tab === t.key ? 'sub-tab-active' : ''}`} onClick={() => setTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </nav>
      {tab === 'projects' && <Projects onReload={reloadProjects} />}
      {tab === 'tasks'    && <Tasks projects={projects} />}
      {tab === 'releases' && <Releases projects={projects} />}
      {tab === 'ideas'    && <Ideas projects={projects} />}
      {tab === 'roadmap'  && <Roadmap projects={projects} />}
      {tab === 'analysis' && <Analysis />}
      {tab === 'documentation' && <Documentation projects={projects} />}
    </div>
  )
}
