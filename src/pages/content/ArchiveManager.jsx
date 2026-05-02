import { useState, useEffect } from 'react'
import { archiveApi, tipsApi, announcementsApi } from '../../services/contentManagementApi'

export default function ArchiveManager() {
  const [archive, setArchive] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filterEntity, setFilterEntity] = useState(null)
  const [filterRestored, setFilterRestored] = useState(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(100)
  const [restoring, setRestoring] = useState(null)

  useEffect(() => {
    loadArchive()
  }, [filterEntity, filterRestored, page])

  async function loadArchive() {
    try {
      setLoading(true)
      setError(null)
      const data = await archiveApi.getAll({
        entityType: filterEntity,
        limit: limit * page
      })
      setArchive(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load archive:', err)
      // Don't show error, just set empty array
      setArchive([])
    } finally {
      setLoading(false)
    }
  }

  async function handleRestore(item) {
    if (!window.confirm(`Restore ${item.entity_type} "${item.entity_data?.title || item.entity_id}"?`)) return

    try {
      setRestoring(item.id)
      setError(null)

      if (item.entity_type === 'tip') {
        await tipsApi.restore(item.entity_id, 'admin')
      } else if (item.entity_type === 'announcement') {
        await announcementsApi.restore(item.entity_id, 'admin')
      }

      // Reload archive
      await loadArchive()
      setError(null)
    } catch (err) {
      console.error('Failed to restore item:', err)
      setError(`Failed to restore: ${err.message}`)
    } finally {
      setRestoring(null)
    }
  }

  const filteredArchive = archive.filter(item => {
    if (filterRestored !== null) {
      const isRestored = item.restored_at !== null
      if (filterRestored && !isRestored) return false
      if (!filterRestored && isRestored) return false
    }
    return true
  })

  return (
    <div className="opp-section">
      <div className="opp-header"><h3>🗂️ Archive Manager</h3></div>

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
          value={filterRestored === null ? '' : filterRestored ? 'restored' : 'not-restored'} 
          onChange={e => { 
            if (e.target.value === '') setFilterRestored(null)
            else if (e.target.value === 'restored') setFilterRestored(true)
            else setFilterRestored(false)
            setPage(1)
          }}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
        >
          <option value="">All Status</option>
          <option value="not-restored">Not Restored</option>
          <option value="restored">Restored</option>
        </select>

        <div style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {filteredArchive.length} item(s)
        </div>
      </div>

      {error && <div style={{ padding: '1rem 1.5rem', background: 'rgba(244,67,54,0.1)', color: 'var(--red)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{error}</span>
        <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
      </div>}
      {loading && <div style={{ padding: '1rem 1.5rem', background: 'rgba(2,113,235,0.1)', color: 'var(--blue)', borderBottom: '1px solid var(--border)' }}>⏳ Loading...</div>}

      {/* Archive Items */}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        {filteredArchive.length === 0 ? (
          <div className="opp-empty">No archived items found.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {filteredArchive.map(item => (
              <div key={item.id} className="home-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>
                    {item.entity_type === 'tip' ? '💡' : '📢'} {item.entity_type}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    ID: {item.entity_id}
                  </div>
                </div>

                {item.entity_data && (
                  <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      {item.entity_data.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {item.entity_data.body?.substring(0, 100)}...
                    </div>
                  </div>
                )}

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div>Archived: {new Date(item.archived_at).toLocaleString()}</div>
                  <div>By: {item.archived_by}</div>
                  {item.restored_at && (
                    <div style={{ color: 'var(--green)', fontWeight: 600 }}>
                      ✅ Restored: {new Date(item.restored_at).toLocaleString()}
                    </div>
                  )}
                </div>

                {item.entity_data && Object.keys(item.entity_data).length > 0 && (
                  <details style={{ marginBottom: '0.75rem' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: 'var(--blue)', marginBottom: '0.5rem' }}>View Full Data</summary>
                    <pre style={{ background: 'var(--gray-50)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.7rem', overflow: 'auto', maxHeight: '150px' }}>
                      {JSON.stringify(item.entity_data, null, 2)}
                    </pre>
                  </details>
                )}

                {!item.restored_at && (
                  <button
                    onClick={() => handleRestore(item)}
                    disabled={restoring === item.id}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--green)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: restoring === item.id ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      opacity: restoring === item.id ? 0.6 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    {restoring === item.id ? '⏳ Restoring...' : '↩️ Restore'}
                  </button>
                )}

                {item.restored_at && (
                  <div style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(76,175,80,0.1)',
                    color: 'var(--green)',
                    border: '1px solid rgba(76,175,80,0.3)',
                    borderRadius: '4px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textAlign: 'center'
                  }}>
                    ✅ Restored
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredArchive.length > 0 && (
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
            disabled={filteredArchive.length < limit * page}
            style={{
              padding: '0.4rem 0.8rem',
              background: filteredArchive.length < limit * page ? 'var(--gray-50)' : 'var(--brand)',
              color: filteredArchive.length < limit * page ? 'var(--text-muted)' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: filteredArchive.length < limit * page ? 'not-allowed' : 'pointer',
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
