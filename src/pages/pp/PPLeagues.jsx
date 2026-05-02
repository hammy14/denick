import { useState, useEffect } from 'react'
import { authFetch } from '../../context/AuthContext'
import { API_BASE } from '../../config/api'
import { useToast } from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'

const API = `${API_BASE}/api/pp/leagues`
const EMPTY = { id: null, name: '', country: '', description: '', founded_year: '', logo_url: '' }

export default function PPLeagues() {
  const [leagues, setLeagues] = useState([])
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const showToast = useToast()

  async function load() {
    const res = await authFetch(API)
    if (res.ok) setLeagues(await res.json())
  }

  useEffect(() => { load() }, [])

  async function save() {
    if (!editing?.name || !editing?.country) return showToast('Name and country required', 'warning')
    const method = editing.id ? 'PUT' : 'POST'
    const url = editing.id ? `${API}/${editing.id}` : API
    const res = await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
    if (res.ok) { showToast(editing.id ? 'League updated' : 'League added', 'success'); setEditing(null); load() }
    else showToast('Failed to save', 'error')
  }

  async function del(id) {
    await authFetch(`${API}/${id}`, { method: 'DELETE' })
    showToast('League deleted', 'info'); setConfirmDelete(null); load()
  }

  const F = ({ label, k, type = 'text' }) => (
    <div className="form-group">
      <label>{label}</label>
      <input type={type} className="opp-search" value={editing[k] || ''} onChange={e => setEditing(p => ({ ...p, [k]: e.target.value }))} />
    </div>
  )

  return (
    <div className="opp-section">
      <div className="opp-header">
        <h3>🏆 Leagues</h3>
        <button className="btn-save" onClick={() => setEditing({ ...EMPTY })}>+ Add League</button>
      </div>

      <table className="opp-table">
        <thead><tr><th>Name</th><th>Country</th><th>Founded</th><th></th></tr></thead>
        <tbody>
          {leagues.map(l => (
            <tr key={l.id}>
              <td><strong>{l.name}</strong></td>
              <td>{l.country}</td>
              <td>{l.founded_year || '—'}</td>
              <td>
                <button className="row-hover-btn" onClick={() => setEditing({ ...l })}>Edit</button>
                <button className="row-hover-btn" style={{ color: 'var(--red)' }} onClick={() => setConfirmDelete(l.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div className="panel-overlay">
          <div className="panel">
            <div className="panel-header"><h3>{editing.id ? 'Edit League' : 'Add League'}</h3><button onClick={() => setEditing(null)}>✕</button></div>
            <div className="panel-body">
              <F label="Name *" k="name" />
              <F label="Country *" k="country" />
              <F label="Description" k="description" />
              <F label="Founded Year" k="founded_year" type="number" />
              <F label="Logo URL" k="logo_url" />
            </div>
            <div className="panel-footer">
              <button className="btn-save" onClick={save}>Save</button>
              <button className="btn-cancel" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && <ConfirmDialog message="Delete this league?" onConfirm={() => del(confirmDelete)} onCancel={() => setConfirmDelete(null)} />}
    </div>
  )
}
