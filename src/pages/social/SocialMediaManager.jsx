import { useState, useEffect } from 'react'
import { authFetch } from '../../context/AuthContext'
import { API_BASE } from '../../config/api'
import { useToast } from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'

const API = `${API_BASE}/api/social`

const PLATFORMS = [
  { value: 'Facebook',  icon: '👍', color: '#1877F2' },
  { value: 'Twitter',   icon: '𝕏',  color: '#000000' },
  { value: 'Instagram', icon: '📸', color: '#E4405F' },
  { value: 'YouTube',   icon: '▶️', color: '#FF0000' },
  { value: 'TikTok',    icon: '🎵', color: '#000000' },
  { value: 'Reddit',    icon: '🔗', color: '#FF4500' },
  { value: 'LinkedIn',  icon: '💼', color: '#0A66C2' },
  { value: 'Discord',   icon: '💬', color: '#5865F2' },
  { value: 'Threads',   icon: '🧵', color: '#000000' },
  { value: 'Bluesky',   icon: '🦋', color: '#0085FF' },
]

const EMPTY = { id: null, platform: 'Twitter', handle: '', profile_url: '', icon: '', is_active: true, display_order: 0 }

export default function SocialMediaManager() {
  const [accounts, setAccounts] = useState([])
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const showToast = useToast()

  async function load() {
    try {
      const res = await authFetch(`${API}/accounts`)
      if (res.ok) setAccounts(await res.json())
    } catch {}
  }

  useEffect(() => { load() }, [])

  async function save() {
    if (!editing.handle || !editing.profile_url) return
    const method = editing.id ? 'PUT' : 'POST'
    const url = editing.id ? `${API}/accounts/${editing.id}` : `${API}/accounts`
    const p = PLATFORMS.find(p => p.value === editing.platform)
    const body = { ...editing, icon: editing.icon || p?.icon || '' }
    const res = await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      showToast(editing.id ? 'Account updated' : 'Account added', 'success')
      setEditing(null); load()
    } else { showToast('Failed to save', 'error') }
  }

  async function del(id) {
    await authFetch(`${API}/accounts/${id}`, { method: 'DELETE' })
    showToast('Account removed', 'info')
    setConfirmDelete(null); load()
  }

  async function toggleActive(account) {
    await authFetch(`${API}/accounts/${account.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...account, is_active: !account.is_active })
    })
    load()
  }

  const activeAccounts = accounts.filter(a => a.is_active)

  return (
    <div className="opp-section">
      <div className="opp-header">
        <h3>📱 Social Media Accounts</h3>
        <button className="btn-save" onClick={() => setEditing({ ...EMPTY, display_order: accounts.length })}>+ Add Account</button>
      </div>

      {/* Footer Preview */}
      {activeAccounts.length > 0 && (
        <div style={{ marginBottom: 'var(--sp-4)', padding: 'var(--sp-3) var(--sp-4)', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--sp-2)' }}>Footer Preview</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>CardSparky · {new Date().getFullYear()}</span>
            <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              {activeAccounts.map(a => {
                const p = PLATFORMS.find(p => p.value === a.platform)
                return (
                  <a key={a.id} href={a.profile_url} target="_blank" rel="noopener noreferrer"
                    title={`${a.platform}: @${a.handle}`}
                    style={{ fontSize: '1.2rem', textDecoration: 'none', opacity: 0.7, transition: 'opacity 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
                  >{a.icon || p?.icon || '🔗'}</a>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Accounts Table */}
      <div className="opp-table-wrap">
        <table className="opp-table">
          <thead><tr><th>Platform</th><th>Handle</th><th>URL</th><th>Active</th><th>Order</th><th>Actions</th></tr></thead>
          <tbody>
            {accounts.length === 0 && <tr><td colSpan={6} className="opp-empty">No social accounts configured. Click "+ Add Account" to get started.</td></tr>}
            {accounts.map(a => {
              const p = PLATFORMS.find(p => p.value === a.platform)
              return (
                <tr key={a.id}>
                  <td><span style={{ marginRight: '0.4rem' }}>{a.icon || p?.icon || '🔗'}</span>{a.platform}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>@{a.handle}</td>
                  <td style={{ fontSize: '0.8rem' }}><a href={a.profile_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)' }}>{a.profile_url.replace(/^https?:\/\//, '').slice(0, 35)}...</a></td>
                  <td>
                    <button onClick={() => toggleActive(a)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }} title={a.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}>
                      {a.is_active ? '✅' : '⬜'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '0.85rem' }}>{a.display_order}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="row-hover-btn" onClick={() => setEditing({ ...a })}>Edit</button>
                      <button className="row-hover-btn danger" onClick={() => setConfirmDelete(a.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit/Add Panel */}
      {editing && (
        <div className="panel-overlay" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div className="panel" role="dialog" aria-modal="true">
            <div className="panel-header">
              <h3>{editing.id ? 'Edit Account' : 'Add Social Account'}</h3>
              <button className="panel-close" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="modal-field">
                <label>Platform *</label>
                <select className="opp-filter" style={{ width: '100%' }} value={editing.platform} onChange={e => setEditing(p => ({ ...p, platform: e.target.value }))}>
                  {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.icon} {p.value}</option>)}
                </select>
              </div>
              <div className="modal-field">
                <label>Handle * (without @)</label>
                <input value={editing.handle} onChange={e => setEditing(p => ({ ...p, handle: e.target.value }))} placeholder="cardsparky" />
              </div>
              <div className="modal-field">
                <label>Profile URL *</label>
                <input value={editing.profile_url} onChange={e => setEditing(p => ({ ...p, profile_url: e.target.value }))} placeholder="https://twitter.com/cardsparky" />
              </div>
              <div className="modal-field">
                <label>Custom Icon (emoji, optional)</label>
                <input value={editing.icon} onChange={e => setEditing(p => ({ ...p, icon: e.target.value }))} placeholder="Leave blank for default" style={{ maxWidth: 120 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="modal-field">
                  <label>Display Order</label>
                  <input type="number" min="0" value={editing.display_order} onChange={e => setEditing(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="modal-field">
                  <label>Active</label>
                  <select className="opp-filter" style={{ width: '100%' }} value={editing.is_active ? 'true' : 'false'} onChange={e => setEditing(p => ({ ...p, is_active: e.target.value === 'true' }))}>
                    <option value="true">✅ Active</option>
                    <option value="false">⬜ Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-save" onClick={save} disabled={!editing.handle || !editing.profile_url}>Save</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Remove Social Account?"
        message="This will remove the account from the footer and all settings. Posts linked to this account will remain."
        onConfirm={() => del(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
