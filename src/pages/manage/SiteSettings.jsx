import { useState } from 'react'
import { authFetch } from '../../context/AuthContext'
import { API_BASE } from '../../config/api'
import { useSite } from '../../context/SiteContext'
import { useToast } from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'

const API = `${API_BASE}/api/sites`
const EMPTY = { id: null, name: '', domain: '', local_port: 5173, db_prefix: '', theme_color: '#6366f1', icon: '', is_active: true }

export default function SiteSettings() {
  const { sites, loadSites } = useSite()
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const showToast = useToast()

  async function save() {
    if (!editing?.name) return
    const method = editing.id ? 'PUT' : 'POST'
    const url = editing.id ? `${API}/${editing.id}` : API
    const res = await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
    if (res.ok) { showToast(editing.id ? 'Site updated' : 'Site added', 'success'); setEditing(null); loadSites() }
    else showToast('Failed to save', 'error')
  }

  async function del(id) {
    await authFetch(`${API}/${id}`, { method: 'DELETE' })
    showToast('Site removed', 'info'); setConfirmDelete(null); loadSites()
  }

  return (
    <div className="opp-section">
      <div className="opp-header">
        <h3>🌐 Site Management</h3>
        <button className="btn-save" onClick={() => setEditing({ ...EMPTY, local_port: 5173 + sites.length })}>+ Add Site</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--sp-3)' }}>
        {sites.map(s => (
          <div key={s.id} className="home-card" style={{ padding: 'var(--sp-4)', borderLeft: `4px solid ${s.theme_color || 'var(--border)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <span style={{ fontSize: '1.3rem' }}>{s.icon || '🌐'}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.domain || 'No domain set'}</div>
                </div>
              </div>
              <span className="badge" style={{ background: s.is_active ? 'rgba(16,185,129,0.1)' : 'var(--gray-100)', color: s.is_active ? 'var(--green)' : 'var(--text-muted)' }}>
                {s.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-2)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--sp-3)' }}>
              <div>Local Port: <strong>:{s.local_port}</strong></div>
              <div>DB Prefix: <strong>{s.db_prefix || '(none)'}</strong></div>
              <div>Theme: <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: s.theme_color, verticalAlign: 'middle', marginLeft: 4 }} /></div>
              <div>ID: <strong>#{s.id}</strong></div>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button className="row-hover-btn" onClick={() => setEditing({ ...s })}>Edit</button>
              <button className="row-hover-btn danger" onClick={() => setConfirmDelete(s.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="panel-overlay" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div className="panel" role="dialog" aria-modal="true">
            <div className="panel-header">
              <h3>{editing.id ? 'Edit Site' : 'Add Site'}</h3>
              <button className="panel-close" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="modal-field">
                <label>Site Name *</label>
                <input value={editing.name} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} placeholder="My Site" />
              </div>
              <div className="modal-field">
                <label>Domain</label>
                <input value={editing.domain} onChange={e => setEditing(p => ({ ...p, domain: e.target.value }))} placeholder="example.com" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="modal-field">
                  <label>Local Port</label>
                  <input type="number" value={editing.local_port} onChange={e => setEditing(p => ({ ...p, local_port: parseInt(e.target.value) || 5173 }))} />
                </div>
                <div className="modal-field">
                  <label>DB Prefix</label>
                  <input value={editing.db_prefix} onChange={e => setEditing(p => ({ ...p, db_prefix: e.target.value }))} placeholder="sk_" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="modal-field">
                  <label>Theme Color</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="color" value={editing.theme_color} onChange={e => setEditing(p => ({ ...p, theme_color: e.target.value }))} style={{ width: 40, height: 32, border: 'none', cursor: 'pointer' }} />
                    <input value={editing.theme_color} onChange={e => setEditing(p => ({ ...p, theme_color: e.target.value }))} style={{ flex: 1, padding: '0.4rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.85rem' }} />
                  </div>
                </div>
                <div className="modal-field">
                  <label>Icon (emoji)</label>
                  <input value={editing.icon} onChange={e => setEditing(p => ({ ...p, icon: e.target.value }))} placeholder="⚡" style={{ maxWidth: 80 }} />
                </div>
              </div>
              <div className="modal-field">
                <label>Active</label>
                <select className="opp-filter" style={{ width: '100%' }} value={editing.is_active ? 'true' : 'false'} onChange={e => setEditing(p => ({ ...p, is_active: e.target.value === 'true' }))}>
                  <option value="true">✅ Active</option>
                  <option value="false">⬜ Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-save" onClick={save} disabled={!editing.name}>Save</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Site?"
        message="This will remove the site from the admin portal. Data associated with this site will not be deleted."
        onConfirm={() => del(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
