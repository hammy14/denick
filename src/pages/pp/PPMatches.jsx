import { useState, useEffect } from 'react'
import { authFetch } from '../../context/AuthContext'
import { API_BASE } from '../../config/api'
import { useToast } from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'

const API = `${API_BASE}/api/pp`
const EMPTY = { id: null, league_id: '', home_team_id: '', away_team_id: '', match_date: '', status: 'scheduled', home_score: '', away_score: '', venue: '' }

export default function PPMatches() {
  const [matches, setMatches] = useState([])
  const [leagues, setLeagues] = useState([])
  const [teams, setTeams] = useState([])
  const [leagueFilter, setLeagueFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const showToast = useToast()

  async function load() {
    const [mr, lr, tr] = await Promise.all([
      authFetch(`${API}/matches${leagueFilter ? `?league_id=${leagueFilter}` : ''}`),
      authFetch(`${API}/leagues`),
      authFetch(`${API}/teams`)
    ])
    if (mr.ok) { const d = await mr.json(); setMatches(d.matches || d) }
    if (lr.ok) setLeagues(await lr.json())
    if (tr.ok) setTeams(await tr.json())
  }

  useEffect(() => { load() }, [leagueFilter])

  async function save() {
    if (!editing?.league_id || !editing?.home_team_id || !editing?.away_team_id || !editing?.match_date)
      return showToast('League, teams and date required', 'warning')
    const method = editing.id ? 'PUT' : 'POST'
    const url = editing.id ? `${API}/matches/${editing.id}` : `${API}/matches`
    const res = await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
    if (res.ok) { showToast(editing.id ? 'Match updated' : 'Match added', 'success'); setEditing(null); load() }
    else showToast('Failed to save', 'error')
  }

  async function del(id) {
    await authFetch(`${API}/matches/${id}`, { method: 'DELETE' })
    showToast('Match deleted', 'info'); setConfirmDelete(null); load()
  }

  const statusBadge = s => ({ scheduled: '#2563eb', finished: '#16a34a', live: '#dc2626' }[s] || '#888')

  return (
    <div className="opp-section">
      <div className="opp-header">
        <h3>⚽ Matches</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select className="opp-filter" value={leagueFilter} onChange={e => setLeagueFilter(e.target.value)}>
            <option value="">All Leagues</option>
            {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <button className="btn-save" onClick={() => setEditing({ ...EMPTY })}>+ Add Match</button>
        </div>
      </div>

      <table className="opp-table">
        <thead><tr><th>Date</th><th>Home</th><th>Score</th><th>Away</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {matches.map(m => (
            <tr key={m.id}>
              <td style={{ fontSize: '0.8rem' }}>{new Date(m.match_date).toLocaleDateString()}</td>
              <td>{m.home_team_name}</td>
              <td style={{ textAlign: 'center', fontWeight: 700 }}>
                {m.status === 'finished' || m.status === 'live' ? `${m.home_score ?? 0} - ${m.away_score ?? 0}` : 'vs'}
              </td>
              <td>{m.away_team_name}</td>
              <td><span className="badge" style={{ background: `${statusBadge(m.status)}20`, color: statusBadge(m.status) }}>{m.status}</span></td>
              <td>
                <button className="row-hover-btn" onClick={() => setEditing({ ...m, match_date: m.match_date?.slice(0, 16) })}>Edit</button>
                <button className="row-hover-btn" style={{ color: 'var(--red)' }} onClick={() => setConfirmDelete(m.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div className="panel-overlay">
          <div className="panel">
            <div className="panel-header"><h3>{editing.id ? 'Edit Match' : 'Add Match'}</h3><button onClick={() => setEditing(null)}>✕</button></div>
            <div className="panel-body">
              {[['League *', 'league_id', leagues], ['Home Team *', 'home_team_id', teams], ['Away Team *', 'away_team_id', teams]].map(([label, key, opts]) => (
                <div key={key} className="form-group">
                  <label>{label}</label>
                  <select className="opp-filter" style={{ width: '100%' }} value={editing[key] || ''} onChange={e => setEditing(p => ({ ...p, [key]: e.target.value }))}>
                    <option value="">Select…</option>
                    {opts.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              ))}
              <div className="form-group"><label>Date & Time *</label><input type="datetime-local" className="opp-search" value={editing.match_date || ''} onChange={e => setEditing(p => ({ ...p, match_date: e.target.value }))} /></div>
              <div className="form-group"><label>Status</label>
                <select className="opp-filter" style={{ width: '100%' }} value={editing.status} onChange={e => setEditing(p => ({ ...p, status: e.target.value }))}>
                  {['scheduled', 'live', 'finished', 'postponed', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {(editing.status === 'finished' || editing.status === 'live') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div className="form-group"><label>Home Score</label><input type="number" className="opp-search" value={editing.home_score ?? ''} onChange={e => setEditing(p => ({ ...p, home_score: e.target.value }))} /></div>
                  <div className="form-group"><label>Away Score</label><input type="number" className="opp-search" value={editing.away_score ?? ''} onChange={e => setEditing(p => ({ ...p, away_score: e.target.value }))} /></div>
                </div>
              )}
              <div className="form-group"><label>Venue</label><input className="opp-search" value={editing.venue || ''} onChange={e => setEditing(p => ({ ...p, venue: e.target.value }))} /></div>
            </div>
            <div className="panel-footer">
              <button className="btn-save" onClick={save}>Save</button>
              <button className="btn-cancel" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && <ConfirmDialog message="Delete this match?" onConfirm={() => del(confirmDelete)} onCancel={() => setConfirmDelete(null)} />}
    </div>
  )
}
