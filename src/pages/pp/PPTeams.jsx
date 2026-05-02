import { useState, useEffect } from 'react'
import { authFetch } from '../../context/AuthContext'
import { API_BASE } from '../../config/api'
import { useToast } from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'

const API = `${API_BASE}/api/pp`
const EMPTY = { id: null, league_id: '', name: '', city: '', stadium: '', founded_year: '', logo_url: '', description: '' }

export default function PPTeams() {
  const [teams, setTeams] = useState([])
  const [leagues, setLeagues] = useState([])
  const [leagueFilter, setLeagueFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const showToast = useToast()

  async function load() {
    const [tr, lr] = await Promise.all([
      authFetch(`${API}/teams${leagueFilter ? `?league_id=${leagueFilter}` : ''}`),
      authFetch(`${API}/leagues`)
    ])
    if (tr.ok) setTeams(await tr.json())
    if (lr.ok) setLeagues(await lr.json())
  }

  useEffect(() => { load() }, [leagueFilter])

  async function save() {
    if (!editing?.name || !editing?.league_id) return showToast('Name and league required', 'warning')
    const method = editing.id ? 'PUT' : 'POST'
    const url = editing.id ? `${API}/teams/${editing.id}` : `${API}/teams`
    const res = await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
    if (res.ok) { showToast(editing.id ? 'Team updated' : 'Team added', 'success'); setEditing(null); load() }
    else showToast('Failed to save', 'error')
  }

  async function del(id) {
    await authFetch(`${API}/teams/${id}`, { method: 'DELETE' })
    showToast('Team deleted', 'info'); setConfirmDelete(null); load()
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
        <h3>👕 Teams</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select className="opp-filter" value={leagueFilter} onChange={e => setLeagueFilter(e.target.value)}>
            <option value="">All Leagues</option>
            {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <button className="btn-save" onClick={() => setEditing({ ...EMPTY })}>+ Add Team</button>
        </div>
      </div>

      <table className="opp-table">
        <thead><tr><th>Name</th><th>League</th><th>City</th><th>Stadium</th><th></th></tr></thead>
        <tbody>
          {teams.map(t => (
            <tr key={t.id}>
              <td><strong>{t.name}</strong></td>
              <td>{t.league_name}</td>
              <td>{t.city || '—'}</td>
              <td>{t.stadium || '—'}</td>
              <td>
                <button className="row-hover-btn" onClick={() => setEditing({ ...t })}>Edit</button>
                <button className="row-hover-btn" style={{ color: 'var(--red)' }} onClick={() => setConfirmDelete(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div className="panel-overlay">
          <div className="panel">
            <div className="panel-header"><h3>{editing.id ? 'Edit Team' : 'Add Team'}</h3><button onClick={() => setEditing(null)}>✕</button></div>
            <div className="panel-body">
              <div className="form-group">
                <label>League *</label>
                <select className="opp-filter" style={{ width: '100%' }} value={editing.league_id || ''} onChange={e => setEditing(p => ({ ...p, league_id: e.target.value }))}>
                  <option value="">Select league</option>
                  {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <F label="Name *" k="name" />
              <F label="City" k="city" />
              <F label="Stadium" k="stadium" />
              <F label="Founded Year" k="founded_year" type="number" />
              <F label="Logo URL" k="logo_url" />
              <F label="Description" k="description" />
            </div>
            <div className="panel-footer">
              <button className="btn-save" onClick={save}>Save</button>
              <button className="btn-cancel" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && <ConfirmDialog message="Delete this team?" onConfirm={() => del(confirmDelete)} onCancel={() => setConfirmDelete(null)} />}
    </div>
  )
}
