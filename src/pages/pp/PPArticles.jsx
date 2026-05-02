import { useState, useEffect } from 'react'
import { authFetch } from '../../context/AuthContext'
import { API_BASE } from '../../config/api'
import { useToast } from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'

const API = `${API_BASE}/api/pp`
const EMPTY = { id: null, title: '', content: '', excerpt: '', league_id: '', featured_image: '', status: 'draft' }

export default function PPArticles() {
  const [articles, setArticles] = useState([])
  const [leagues, setLeagues] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const showToast = useToast()

  async function load() {
    const params = statusFilter !== 'all' ? `?status=${statusFilter}&limit=100` : '?limit=100'
    const [ar, lr] = await Promise.all([
      authFetch(`${API}/articles${params}`),
      authFetch(`${API}/leagues`)
    ])
    if (ar.ok) { const d = await ar.json(); setArticles(d.articles || d) }
    if (lr.ok) setLeagues(await lr.json())
  }

  useEffect(() => { load() }, [statusFilter])

  async function save() {
    if (!editing?.title || !editing?.content) return showToast('Title and content required', 'warning')
    const method = editing.id ? 'PUT' : 'POST'
    const url = editing.id ? `${API}/articles/${editing.id}` : `${API}/articles`
    const res = await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
    if (res.ok) { showToast(editing.id ? 'Article updated' : 'Article created', 'success'); setEditing(null); load() }
    else { const d = await res.json(); showToast(d.error || 'Failed to save', 'error') }
  }

  async function del(id) {
    await authFetch(`${API}/articles/${id}`, { method: 'DELETE' })
    showToast('Article deleted', 'info'); setConfirmDelete(null); load()
  }

  const statusColor = s => ({ published: '#16a34a', draft: '#d97706', archived: '#888' }[s] || '#888')

  return (
    <div className="opp-section">
      <div className="opp-header">
        <h3>📰 Articles</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select className="opp-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <button className="btn-save" onClick={() => setEditing({ ...EMPTY })}>+ New Article</button>
        </div>
      </div>

      <table className="opp-table">
        <thead><tr><th>Title</th><th>League</th><th>Status</th><th>Published</th><th></th></tr></thead>
        <tbody>
          {articles.map(a => (
            <tr key={a.id}>
              <td style={{ maxWidth: 280 }}><strong style={{ fontSize: '0.85rem' }}>{a.title}</strong></td>
              <td style={{ fontSize: '0.8rem' }}>{leagues.find(l => l.id === a.league_id)?.name || '—'}</td>
              <td><span className="badge" style={{ background: `${statusColor(a.status)}20`, color: statusColor(a.status) }}>{a.status}</span></td>
              <td style={{ fontSize: '0.78rem' }}>{a.published_at ? new Date(a.published_at).toLocaleDateString() : '—'}</td>
              <td>
                <button className="row-hover-btn" onClick={() => setEditing({ ...a })}>Edit</button>
                <button className="row-hover-btn" style={{ color: 'var(--red)' }} onClick={() => setConfirmDelete(a.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div className="panel-overlay">
          <div className="panel" style={{ maxWidth: 700, width: '95vw' }}>
            <div className="panel-header"><h3>{editing.id ? 'Edit Article' : 'New Article'}</h3><button onClick={() => setEditing(null)}>✕</button></div>
            <div className="panel-body">
              <div className="form-group"><label>Title *</label><input className="opp-search" value={editing.title || ''} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="form-group"><label>Excerpt</label><textarea className="opp-search" rows={2} style={{ width: '100%', resize: 'vertical' }} value={editing.excerpt || ''} onChange={e => setEditing(p => ({ ...p, excerpt: e.target.value }))} /></div>
              <div className="form-group"><label>Content *</label><textarea className="opp-search" rows={10} style={{ width: '100%', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.82rem' }} value={editing.content || ''} onChange={e => setEditing(p => ({ ...p, content: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group"><label>League</label>
                  <select className="opp-filter" style={{ width: '100%' }} value={editing.league_id || ''} onChange={e => setEditing(p => ({ ...p, league_id: e.target.value }))}>
                    <option value="">None</option>
                    {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Status</label>
                  <select className="opp-filter" style={{ width: '100%' }} value={editing.status} onChange={e => setEditing(p => ({ ...p, status: e.target.value }))}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Featured Image URL</label><input className="opp-search" value={editing.featured_image || ''} onChange={e => setEditing(p => ({ ...p, featured_image: e.target.value }))} /></div>
            </div>
            <div className="panel-footer">
              <button className="btn-save" onClick={save}>Save</button>
              <button className="btn-cancel" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && <ConfirmDialog message="Delete this article?" onConfirm={() => del(confirmDelete)} onCancel={() => setConfirmDelete(null)} />}
    </div>
  )
}
