import { useState, useEffect } from 'react'
import { sports } from '../../config/sports'
import { authFetch } from '../../context/AuthContext'
import { API_BASE } from '../../config/api'

const DB_OVERRIDES_KEY = 'cs_db_overrides'

function loadOverrides() {
  try { return JSON.parse(localStorage.getItem(DB_OVERRIDES_KEY)) ?? {} }
  catch { return {} }
}

export default function DatabaseManager() {
  const [overrides, setOverrides] = useState(loadOverrides)
  const [editing, setEditing] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [statuses, setStatuses] = useState({})
  const [testing, setTesting] = useState(null)
  const [health, setHealth] = useState(null)
  const [healthLoading, setHealthLoading] = useState(false)

  async function fetchHealth() {
    setHealthLoading(true)
    try {
      const res = await authFetch(`${API_BASE}/api/health`)
      if (res.ok) setHealth(await res.json())
    } catch {}
    setHealthLoading(false)
  }

  useEffect(() => { fetchHealth() }, [])

  function getDb(key) {
    return overrides[key] ?? sports[key].db
  }

  function startEdit(key) {
    setEditing(key)
    setEditValue(getDb(key))
  }

  function saveEdit(key) {
    const updated = { ...overrides, [key]: editValue.trim() || sports[key].db }
    setOverrides(updated)
    localStorage.setItem(DB_OVERRIDES_KEY, JSON.stringify(updated))
    setEditing(null)
  }

  function resetDb(key) {
    const updated = { ...overrides }
    delete updated[key]
    setOverrides(updated)
    localStorage.setItem(DB_OVERRIDES_KEY, JSON.stringify(updated))
    setEditing(null)
  }

  async function testConnection(key) {
    const db = getDb(key)
    setTesting(key)
    try {
      const res = await authFetch(`${API_BASE}/api/${db}/test`)
      const data = await res.json()
      setStatuses(s => ({ ...s, [key]: res.ok ? 'ok' : 'error' }))
      if (!res.ok) console.error(db, data.error)
    } catch (err) {
      setStatuses(s => ({ ...s, [key]: 'error' }))
      console.error(db, err.message)
    }
    setTesting(null)
  }

  async function testAll() {
    for (const key of Object.keys(sports)) {
      await testConnection(key)
    }
  }

  return (
    <div className="opp-section">
      {/* Connection Pool Health */}
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <div className="opp-header">
          <h3>🩺 Connection Pool Health</h3>
          <button className="btn-save" onClick={fetchHealth} disabled={healthLoading}>
            {healthLoading ? 'Checking...' : 'Refresh'}
          </button>
        </div>
        {health ? (
          <>
            <div className="kpi-grid" style={{ marginBottom: 'var(--sp-4)' }}>
              <div className="kpi-card">
                <div className="kpi-label">Databases</div>
                <div className="kpi-value">{health.pools?.length ?? 0}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Active Connections</div>
                <div className="kpi-value">{health.totalActive}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Max Connections</div>
                <div className="kpi-value">{health.totalLimit}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Queued</div>
                <div className="kpi-value" style={{ color: health.pools?.some(p => p.queued > 0) ? 'var(--red)' : 'var(--green)' }}>
                  {health.pools?.reduce((s, p) => s + p.queued, 0) ?? 0}
                </div>
              </div>
            </div>
            {health.pools?.some(p => p.queued > 0) && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(229,62,62,0.08)', borderRadius: 8, marginBottom: 'var(--sp-4)', fontSize: '0.85rem', color: 'var(--red)' }}>
                ⚠️ Some pools have queued requests. Consider increasing <code>DB_CONN_LIMIT</code> in your <code>.env</code> file.
              </div>
            )}
            <details style={{ fontSize: '0.82rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>Pool details per database</summary>
              <div className="opp-table-wrap">
                <table className="opp-table">
                  <thead><tr><th>Database</th><th>Active</th><th>Idle</th><th>Queued</th><th>Limit</th></tr></thead>
                  <tbody>
                    {health.pools?.map(p => (
                      <tr key={p.db}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.db}</td>
                        <td>{p.active}</td>
                        <td>{p.idle}</td>
                        <td style={{ color: p.queued > 0 ? 'var(--red)' : undefined, fontWeight: p.queued > 0 ? 700 : undefined }}>{p.queued}</td>
                        <td>{p.limit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{healthLoading ? 'Loading...' : 'Could not reach health endpoint.'}</p>
        )}
      </div>

      {/* Database Management */}
      <div className="opp-header">
        <h3>🗄️ Database Management</h3>
        <button className="btn-save" onClick={testAll}>Test All</button>
      </div>
      <div className="opp-table-wrap">
        <table className="opp-table">
          <thead>
            <tr>
              <th>Sport</th>
              <th>Database Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(sports).map(([key, sport]) => {
              const status = statuses[key]
              const isEditing = editing === key
              const isOverridden = !!overrides[key]

              return (
                <tr key={key}>
                  <td>{sport.icon} {sport.label}</td>
                  <td>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <input
                          className="cell-edit"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(key); if (e.key === 'Escape') setEditing(null) }}
                          autoFocus
                          style={{ maxWidth: 180 }}
                        />
                        <button className="btn-save" style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }} onClick={() => saveEdit(key)}>✓</button>
                        <button className="btn-cancel" style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }} onClick={() => setEditing(null)}>✗</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{getDb(key)}</span>
                        {isOverridden && (
                          <span className="badge" style={{ background: 'rgba(13,148,136,0.1)', color: 'var(--purple)', fontSize: '0.7rem' }}>edited</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {!status && <span className="badge" style={{ background: 'var(--gray-100)', color: 'var(--text-muted)' }}>Not tested</span>}
                    {status === 'ok' && <span className="badge" style={{ background: 'rgba(3,194,82,0.1)', color: 'var(--green)' }}>✓ Connected</span>}
                    {status === 'error' && <span className="badge" style={{ background: 'rgba(229,62,62,0.1)', color: 'var(--red)' }}>✗ Failed</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {!isEditing && <button className="icon-btn" onClick={() => startEdit(key)} aria-label={`Edit database name for ${sport.label}`}>✏️</button>}
                      {isOverridden && !isEditing && <button className="icon-btn" title="Reset to default" aria-label={`Reset ${sport.label} to default database name`} onClick={() => resetDb(key)}>↩️</button>}
                      <button className="icon-btn" onClick={() => testConnection(key)} disabled={testing === key} aria-label={`Test connection for ${sport.label}`}>
                        {testing === key ? '...' : '🔌'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
