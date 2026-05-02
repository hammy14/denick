import { useState, useEffect } from 'react'
import { auditLogApi } from '../../services/contentManagementApi'

export default function AuditLogViewer() {
  const [auditLog, setAuditLog] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filterEntity, setFilterEntity] = useState(null)
  const [filterAction, setFilterAction] = useState(null)
  const [filterUser, setFilterUser] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(50)

  console.log('AuditLogViewer mounted')

  useEffect(() => {
    loadAuditLog()
  }, [filterEntity, filterAction, filterUser, page])

  async function loadAuditLog() {
    try {
      setLoading(true)
      setError(null)
      const data = await auditLogApi.getAll({
        entityType: filterEntity,
        action: filterAction,
        limit: limit * page
      })
      setAuditLog(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load audit log:', err)
      // Don't show error, just set empty array
      setAuditLog([])
    } finally {
      setLoading(false)
    }
  }

  const actionColors = {
    'create': 'rgba(76,175,80,0.1)',
    'update': 'rgba(255,152,0,0.1)',
    'delete': 'rgba(244,67,54,0.1)',
    'restore': 'rgba(2,113,235,0.1)',
    'pin': 'rgba(156,39,176,0.1)',
    'feature': 'rgba(255,193,7,0.1)'
  }

  const actionTextColors = {
    'create': 'var(--green)',
    'update': 'var(--orange)',
    'delete': 'var(--red)',
    'restore': 'var(--blue)',
    'pin': 'var(--purple)',
    'feature': 'var(--yellow)'
  }

  const actionEmojis = {
    'create': '✨',
    'update': '✏️',
    'delete': '🗑️',
    'restore': '↩️',
    'pin': '📌',
    'feature': '⭐'
  }

  return (
    <div className="opp-section">
      <div className="opp-header"><h3>📋 Audit Log</h3></div>

      {/* Filters */}
      <div style={{ padding: '1rem 1.5rem', background: 'var(--gray-50)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select 
          value={filterEntity || ''} 
          onChange={e => { setFilterEntity(e.target.value || null); setPage(1) }}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
        >
          <option value="">All Entities</option>
          <option value="announcement">Announcements</option>
          <option value="tip">Tips</option>
        </select>

        <select 
          value={filterAction || ''} 
          onChange={e => { setFilterAction(e.target.value || null); setPage(1) }}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
        >
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="restore">Restore</option>
          <option value="pin">Pin</option>
          <option value="feature">Feature</option>
        </select>

        <input
          type="text"
          placeholder="Filter by user..."
          value={filterUser}
          onChange={e => { setFilterUser(e.target.value); setPage(1) }}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', flex: 1, minWidth: '200px', fontSize: '0.9rem' }}
        />
      </div>

      {error && <div style={{ padding: '1rem 1.5rem', background: 'rgba(244,67,54,0.1)', color: 'var(--red)', borderBottom: '1px solid var(--border)' }}>{error}</div>}
      {loading && <div style={{ padding: '1rem 1.5rem', background: 'rgba(2,113,235,0.1)', color: 'var(--blue)', borderBottom: '1px solid var(--border)' }}>⏳ Loading...</div>}

      {/* Audit Log Entries */}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        {auditLog.length === 0 ? (
          <div className="opp-empty">No audit log entries found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {auditLog.map(entry => (
              <div key={entry.id} className="home-card" style={{ padding: '1rem', borderLeft: `4px solid ${actionTextColors[entry.action] || 'var(--border)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{actionEmojis[entry.action] || '📝'}</span>
                    <div>
                      <span style={{ fontWeight: 600 }}>{entry.entity_type}</span>
                      <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>#{entry.entity_id}</span>
                    </div>
                  </div>
                  <span className="badge" style={{ background: actionColors[entry.action], color: actionTextColors[entry.action], fontWeight: 600 }}>
                    {entry.action.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                  <div>By: <strong>{entry.changed_by}</strong></div>
                  <div>At: {new Date(entry.created_at).toLocaleString()}</div>
                  {entry.ip_address && <div>IP: {entry.ip_address}</div>}
                </div>
                {entry.changes && Object.keys(entry.changes).length > 0 && (
                  <details style={{ marginTop: '0.5rem' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: 'var(--blue)' }}>View Changes</summary>
                    <pre style={{ background: 'var(--gray-50)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.75rem', overflow: 'auto', marginTop: '0.5rem', maxHeight: '200px' }}>
                      {JSON.stringify(entry.changes, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {auditLog.length > 0 && (
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            style={{
              padding: '0.4rem 0.8rem',
              background: page === 1 ? 'var(--gray-50)' : 'var(--brand)',
              color: page === 1 ? 'var(--text-muted)' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            ← Previous
          </button>
          <span style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', fontWeight: 600 }}>Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={auditLog.length < limit * page}
            style={{
              padding: '0.4rem 0.8rem',
              background: auditLog.length < limit * page ? 'var(--gray-50)' : 'var(--brand)',
              color: auditLog.length < limit * page ? 'var(--text-muted)' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: auditLog.length < limit * page ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
