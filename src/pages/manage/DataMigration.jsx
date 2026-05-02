import { useState } from 'react'
import { tipsApi, announcementsApi } from '../../services/contentManagementApi'

export default function DataMigration() {
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  async function handleMigrate() {
    if (!window.confirm('This will import data from localStorage to the database. Continue?')) return

    try {
      setLoading(true)
      setError(null)
      setStatus('Starting migration...')
      setProgress(0)
      setResults(null)

      // Get localStorage data
      const tips = JSON.parse(localStorage.getItem('cs_tips') || '[]')
      const announcements = JSON.parse(localStorage.getItem('cs_announcements') || '[]')

      const totalItems = tips.length + announcements.length

      if (totalItems === 0) {
        setStatus('✅ No data to migrate. localStorage is empty.')
        setProgress(100)
        setResults({ tips: 0, announcements: 0, total: 0 })
        return
      }

      setStatus(`Found ${tips.length} tips and ${announcements.length} announcements to migrate...`)

      let tipsImported = 0
      let announcementsImported = 0
      let errors = []

      // Import tips
      for (let i = 0; i < tips.length; i++) {
        try {
          const tip = tips[i]
          await tipsApi.create({
            title: tip.title,
            body: tip.body,
            category: tip.category || 'General',
            difficulty: tip.difficulty || 'Beginner',
            emoji: tip.emoji || '💡',
            isFeatured: tip.isFeatured || false,
            relatedUrl: tip.relatedUrl || null,
            createdBy: 'migration'
          })
          tipsImported++
          setStatus(`Importing tips... ${tipsImported}/${tips.length}`)
          setProgress(Math.round((tipsImported / totalItems) * 100))
        } catch (err) {
          console.error('Failed to import tip:', tips[i].title, err)
          errors.push(`Tip "${tips[i].title}": ${err.message}`)
        }
      }

      // Import announcements
      for (let i = 0; i < announcements.length; i++) {
        try {
          const a = announcements[i]
          await announcementsApi.create({
            title: a.title,
            body: a.body,
            priority: a.priority || 'Normal',
            isPinned: a.isPinned || false,
            pinDuration: a.pinDuration || 24,
            targetAudience: a.targetAudience || 'All',
            richText: a.richText || false,
            createdBy: 'migration'
          })
          announcementsImported++
          setStatus(`Importing announcements... ${announcementsImported}/${announcements.length}`)
          setProgress(Math.round(((tipsImported + announcementsImported) / totalItems) * 100))
        } catch (err) {
          console.error('Failed to import announcement:', announcements[i].title, err)
          errors.push(`Announcement "${announcements[i].title}": ${err.message}`)
        }
      }

      // Verify data
      setStatus('Verifying imported data...')
      const importedTips = await tipsApi.getAll()
      const importedAnnouncements = await announcementsApi.getAll()

      setResults({
        tips: tipsImported,
        announcements: announcementsImported,
        total: tipsImported + announcementsImported,
        errors: errors,
        databaseTips: importedTips.length,
        databaseAnnouncements: importedAnnouncements.length
      })

      if (errors.length === 0) {
        setStatus(`✅ Migration complete! Imported ${tipsImported} tips and ${announcementsImported} announcements.`)
      } else {
        setStatus(`⚠️ Migration complete with ${errors.length} error(s). Check details below.`)
      }

      setProgress(100)
    } catch (err) {
      console.error('Migration error:', err)
      setError(`Migration failed: ${err.message}`)
      setStatus('❌ Migration failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleClearLocalStorage() {
    if (!window.confirm('This will permanently delete all data from localStorage. Make sure migration was successful first. Continue?')) return

    try {
      localStorage.removeItem('cs_tips')
      localStorage.removeItem('cs_announcements')
      setStatus('✅ localStorage cleared successfully')
      setProgress(100)
    } catch (err) {
      setError(`Failed to clear localStorage: ${err.message}`)
    }
  }

  return (
    <div className="opp-section">
      <div className="opp-header"><h3>🔄 Data Migration</h3></div>

      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
          Migrate data from localStorage to MySQL database. This will import all tips and announcements to the database while keeping localStorage intact.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleMigrate}
            disabled={loading}
            className="btn-save"
            style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? '⏳ Migrating...' : '🚀 Start Migration'}
          </button>
          <button
            onClick={handleClearLocalStorage}
            disabled={loading || !results}
            style={{
              padding: '0.6rem 1.2rem',
              background: results ? 'var(--orange)' : 'var(--gray-50)',
              color: results ? 'white' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              cursor: results && !loading ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            🗑️ Clear localStorage
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '0.75rem 1.5rem',
          background: 'rgba(244,67,54,0.1)',
          color: 'var(--red)',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.9rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {status && (
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.95rem' }}>
            {status}
          </div>
          {progress > 0 && (
            <div>
              <div style={{
                background: 'var(--border)',
                borderRadius: '4px',
                height: '8px',
                overflow: 'hidden',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  background: 'var(--brand)',
                  height: '100%',
                  width: `${progress}%`,
                  transition: 'width 0.3s'
                }} />
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {progress}% complete
              </div>
            </div>
          )}
        </div>
      )}

      {results && (
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <div className="home-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '1rem' }}>
              ✅ Migration Results
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Tips Imported</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--green)' }}>{results.tips}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Announcements Imported</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--green)' }}>{results.announcements}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Imported</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand)' }}>{results.total}</div>
              </div>
            </div>

            {results.databaseTips !== undefined && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Database Verification</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <div>Tips in database: <strong>{results.databaseTips}</strong></div>
                  <div>Announcements in database: <strong>{results.databaseAnnouncements}</strong></div>
                </div>
              </div>
            )}

            {results.errors && results.errors.length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--orange)' }}>
                  ⚠️ {results.errors.length} Error(s)
                </div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--blue)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    padding: 0
                  }}
                >
                  {showDetails ? '▼ Hide Details' : '▶ Show Details'}
                </button>
                {showDetails && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {results.errors.map((err, i) => (
                      <div key={i} style={{ marginBottom: '0.25rem', padding: '0.25rem', background: 'var(--gray-50)', borderRadius: '3px' }}>
                        • {err}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ padding: '1rem', background: 'rgba(76,175,80,0.05)', borderRadius: '6px', border: '1px solid rgba(76,175,80,0.2)' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>✅ Next Steps</div>
            <ol style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, paddingLeft: '1.5rem' }}>
              <li>Verify the data above looks correct</li>
              <li>Test the TipsManager and AnnouncementsManager components</li>
              <li>Click "Clear localStorage" to remove old data</li>
              <li>Refresh the page to confirm everything still works</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
