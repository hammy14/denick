import { useState, useEffect } from 'react'
import { authFetch } from '../../context/AuthContext'
import { API_BASE } from '../../config/api'
import { useToast } from '../../components/Toast'
import { formatDate } from '../../utils/formatDate'

const API = `${API_BASE}/api/social`

const PLATFORM_ICONS = {
  Facebook: '👍', Twitter: '𝕏', Instagram: '📸', YouTube: '▶️', TikTok: '🎵',
  Reddit: '🔗', LinkedIn: '💼', Discord: '💬', Threads: '🧵', Bluesky: '🦋',
}

export default function SocialAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingEngagement, setEditingEngagement] = useState(null)
  const [engForm, setEngForm] = useState({ likes: 0, shares: 0, comments: 0, impressions: 0 })
  const showToast = useToast()

  async function load() {
    setLoading(true)
    try {
      const res = await authFetch(`${API}/analytics`)
      if (res.ok) setData(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function saveEngagement() {
    if (!editingEngagement) return
    const res = await authFetch(`${API}/posts/${editingEngagement}/engagement`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(engForm)
    })
    if (res.ok) { showToast('Engagement updated', 'success'); setEditingEngagement(null); load() }
    else showToast('Failed to save', 'error')
  }

  function openEngagement(post) {
    const eng = typeof post.engagement_data === 'string' ? JSON.parse(post.engagement_data || '{}') : (post.engagement_data || {})
    setEngForm({ likes: eng.likes || 0, shares: eng.shares || 0, comments: eng.comments || 0, impressions: eng.impressions || 0 })
    setEditingEngagement(post.id)
  }

  if (loading) return <div className="opp-loading">Loading analytics...</div>
  if (!data) return <div className="opp-empty">Could not load analytics.</div>

  const totalEngagement = (data.topPosts || []).reduce((sum, p) => {
    const eng = typeof p.engagement_data === 'string' ? JSON.parse(p.engagement_data || '{}') : (p.engagement_data || {})
    return sum + (eng.likes || 0) + (eng.shares || 0) + (eng.comments || 0)
  }, 0)

  return (
    <div className="opp-section">
      <div className="opp-header">
        <h3>📊 Social Media Analytics</h3>
        <button className="btn-save" onClick={load}>Refresh</button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: 'var(--sp-6)' }}>
        <div className="kpi-card">
          <div className="kpi-label">Connected Accounts</div>
          <div className="kpi-value">{data.accounts?.filter(a => a.is_active).length || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Posts</div>
          <div className="kpi-value">{data.posts?.total || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Published</div>
          <div className="kpi-value" style={{ color: 'var(--green)' }}>{data.posts?.published || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Scheduled</div>
          <div className="kpi-value" style={{ color: 'var(--blue)' }}>{data.posts?.scheduled || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Drafts</div>
          <div className="kpi-value" style={{ color: 'var(--text-muted)' }}>{data.posts?.draft || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Engagement</div>
          <div className="kpi-value" style={{ color: 'var(--orange)' }}>{totalEngagement.toLocaleString()}</div>
        </div>
      </div>

      {/* Platform Breakdown */}
      {data.byPlatform?.length > 0 && (
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--sp-3)' }}>Posts by Platform</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--sp-3)' }}>
            {data.byPlatform.map(p => (
              <div key={p.platform} className="home-card" style={{ padding: 'var(--sp-3)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 'var(--sp-1)' }}>{PLATFORM_ICONS[p.platform] || '📱'}</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.platform}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.posts} posts · {p.published} published</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Trend */}
      {data.byMonth?.length > 0 && (
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--sp-3)' }}>Monthly Activity</h4>
          <div className="opp-table-wrap">
            <table className="opp-table">
              <thead><tr><th>Month</th><th>Total Posts</th><th>Published</th></tr></thead>
              <tbody>
                {data.byMonth.map(m => (
                  <tr key={m.month}>
                    <td style={{ fontWeight: 500 }}>{m.month}</td>
                    <td>{m.posts}</td>
                    <td style={{ color: 'var(--green)' }}>{m.published}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Posts with Engagement */}
      <div>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--sp-3)' }}>Recent Posts & Engagement</h4>
        <div className="opp-table-wrap">
          <table className="opp-table">
            <thead><tr><th>Platform</th><th>Post</th><th>Published</th><th>👍 Likes</th><th>🔄 Shares</th><th>💬 Comments</th><th>👁 Impressions</th><th>Actions</th></tr></thead>
            <tbody>
              {(!data.topPosts || data.topPosts.length === 0) && <tr><td colSpan={8} className="opp-empty">No published posts yet.</td></tr>}
              {(data.topPosts || []).map(p => {
                const eng = typeof p.engagement_data === 'string' ? JSON.parse(p.engagement_data || '{}') : (p.engagement_data || {})
                return (
                  <tr key={p.id}>
                    <td><span style={{ marginRight: '0.3rem' }}>{p.icon || PLATFORM_ICONS[p.platform] || '📱'}</span>{p.platform}</td>
                    <td style={{ maxWidth: 250 }}>
                      {p.title && <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{p.title}</div>}
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxHeight: '2em', overflow: 'hidden' }}>{p.body}</div>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{formatDate(p.published_at)}</td>
                    <td style={{ fontWeight: 600 }}>{(eng.likes || 0).toLocaleString()}</td>
                    <td>{(eng.shares || 0).toLocaleString()}</td>
                    <td>{(eng.comments || 0).toLocaleString()}</td>
                    <td>{(eng.impressions || 0).toLocaleString()}</td>
                    <td><button className="row-hover-btn" onClick={() => openEngagement(p)}>📊 Update</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Engagement Edit Modal */}
      {editingEngagement && (
        <div className="panel-overlay" onClick={e => e.target === e.currentTarget && setEditingEngagement(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <h3 style={{ marginBottom: 'var(--sp-3)' }}>📊 Update Engagement</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { key: 'likes', label: '👍 Likes' },
                { key: 'shares', label: '🔄 Shares' },
                { key: 'comments', label: '💬 Comments' },
                { key: 'impressions', label: '👁 Impressions' },
              ].map(f => (
                <div className="modal-field" key={f.key}>
                  <label>{f.label}</label>
                  <input type="number" min="0" value={engForm[f.key]} onChange={e => setEngForm(p => ({ ...p, [f.key]: parseInt(e.target.value) || 0 }))} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-2)', justifyContent: 'flex-end', marginTop: 'var(--sp-4)' }}>
              <button className="btn-cancel" onClick={() => setEditingEngagement(null)}>Cancel</button>
              <button className="btn-save" onClick={saveEngagement}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
