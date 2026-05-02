import { useState, useEffect } from 'react'
import { authFetch } from '../../context/AuthContext'
import { API_BASE } from '../../config/api'
import { useToast } from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'
import { ARTICLES } from '../blog/BlogPage'

const API = `${API_BASE}/api/social`

const CHAR_LIMITS = { Twitter: 280, Facebook: 63206, Instagram: 2200, YouTube: 5000, TikTok: 2200, Reddit: 40000, LinkedIn: 3000, Discord: 2000, Threads: 500, Bluesky: 300 }
const STATUS_COLORS = { Draft: 'var(--text-muted)', Scheduled: 'var(--blue)', Published: 'var(--green)', Failed: 'var(--red)' }

const DEFAULT_TEMPLATES = [
  { name: '🃏 New Card Alert', body: 'Just pulled a {card_name} from {set}! {sport} collectors, what do you think?', hashtags: '#sportscards #cardcollecting #{sport}', category: 'Cards' },
  { name: '💰 Price Update', body: '{card_name} is now valued at ${value}! 📈', hashtags: '#sportscards #cardinvesting #{sport}', category: 'Market' },
  { name: '🏆 Collection Milestone', body: 'Hit {milestone} cards in my collection! Total value: ${value}', hashtags: '#cardcollecting #milestone', category: 'Milestones' },
  { name: '📝 Blog Post Share', body: 'New on the blog: {title} — {excerpt}\n\nRead more: {url}', hashtags: '#sportscards #cardsparky', category: 'Content' },
  { name: '📊 Weekly Recap', body: 'This week: {cards_added} cards added, ${value_change} value change. Top pickup: {top_card}', hashtags: '#sportscards #weeklyrecap', category: 'Recap' },
]

export default function SocialPostsManager() {
  const [accounts, setAccounts] = useState([])
  const [posts, setPosts] = useState([])
  const [templates, setTemplates] = useState([])
  const [total, setTotal] = useState(0)
  const [tab, setTab] = useState('posts')
  const [filterStatus, setFilterStatus] = useState('')
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const showToast = useToast()

  async function loadAccounts() {
    try { const r = await authFetch(`${API}/accounts`); if (r.ok) setAccounts(await r.json()) } catch {}
  }
  async function loadPosts() {
    try {
      const params = new URLSearchParams({ perpage: '100' })
      if (filterStatus) params.set('status', filterStatus)
      const r = await authFetch(`${API}/posts?${params}`)
      if (r.ok) { const d = await r.json(); setPosts(d.rows || []); setTotal(d.total || 0) }
    } catch {}
  }
  async function loadTemplates() {
    try { const r = await authFetch(`${API}/templates`); if (r.ok) setTemplates(await r.json()) } catch {}
  }

  useEffect(() => { loadAccounts(); loadPosts(); loadTemplates() }, [])
  useEffect(() => { loadPosts() }, [filterStatus])

  // Post CRUD
  async function savePost() {
    if (!editing?.body) return
    const method = editing.id ? 'PUT' : 'POST'
    const url = editing.id ? `${API}/posts/${editing.id}` : `${API}/posts`
    const res = await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
    if (res.ok) { showToast(editing.id ? 'Post updated' : 'Post created', 'success'); setEditing(null); loadPosts() }
    else showToast('Failed to save', 'error')
  }

  async function deletePost(id) {
    await authFetch(`${API}/posts/${id}`, { method: 'DELETE' })
    showToast('Post deleted', 'info'); setConfirmDelete(null); loadPosts()
  }

  async function publishPost(id) {
    const res = await authFetch(`${API}/posts/${id}/publish`, { method: 'POST' })
    if (res.ok) { showToast('Post marked as published', 'success'); loadPosts() }
    else showToast('Failed to publish', 'error')
  }

  // Templates
  async function saveTemplate(t) {
    const res = await authFetch(`${API}/templates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) })
    if (res.ok) { showToast('Template saved', 'success'); loadTemplates() }
  }

  async function deleteTemplate(id) {
    await authFetch(`${API}/templates/${id}`, { method: 'DELETE' })
    showToast('Template deleted', 'info'); loadTemplates()
  }

  function useTemplate(t) {
    setEditing(prev => ({ ...(prev || newPost()), body: t.body, hashtags: t.hashtags || '' }))
    setTab('posts')
  }

  // Blog to social
  function createFromBlog(article) {
    const body = `New on the blog: ${article.title}\n\n${article.excerpt}\n\nRead more: https://cardsparky.com/blog/${article.slug}`
    setEditing({ ...newPost(), title: article.title, body, hashtags: '#sportscards #cardsparky #cardcollecting' })
    setTab('posts')
  }

  function newPost() {
    return { id: null, account_id: accounts[0]?.id || '', title: '', body: '', hashtags: '', status: 'Draft', scheduled_at: '', created_by: 'Eric' }
  }

  const activeAccount = accounts.find(a => String(a.id) === String(editing?.account_id))
  const charLimit = activeAccount ? CHAR_LIMITS[activeAccount.platform] : null
  const charCount = (editing?.body || '').length

  return (
    <div className="opp-section">
      <div className="opp-header">
        <h3>✍️ Social Media Posts</h3>
        <button className="btn-save" onClick={() => setEditing(newPost())}>+ New Post</button>
      </div>

      {/* Tabs */}
      <nav className="sub-tabs" style={{ marginBottom: 'var(--sp-4)' }}>
        <button className={`sub-tab ${tab === 'posts' ? 'sub-tab-active' : ''}`} onClick={() => setTab('posts')}>Posts ({total})</button>
        <button className={`sub-tab ${tab === 'templates' ? 'sub-tab-active' : ''}`} onClick={() => setTab('templates')}>Templates ({templates.length})</button>
        <button className={`sub-tab ${tab === 'blog' ? 'sub-tab-active' : ''}`} onClick={() => setTab('blog')}>From Blog ({ARTICLES.length})</button>
      </nav>

      {/* Posts List */}
      {tab === 'posts' && (
        <>
          <div className="opp-toolbar" style={{ marginBottom: 'var(--sp-3)' }}>
            <select className="opp-filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {['Draft', 'Scheduled', 'Published', 'Failed'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="opp-table-wrap">
            <table className="opp-table">
              <thead><tr><th>Platform</th><th>Title / Body</th><th>Status</th><th>Scheduled</th><th>Actions</th></tr></thead>
              <tbody>
                {posts.length === 0 && <tr><td colSpan={5} className="opp-empty">No posts yet. Create one or generate from a blog article.</td></tr>}
                {posts.map(p => (
                  <tr key={p.id}>
                    <td><span style={{ marginRight: '0.3rem' }}>{p.platform_icon || '📝'}</span>{p.platform || '—'}<br /><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{p.handle || '—'}</span></td>
                    <td>
                      {p.title && <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 2 }}>{p.title}</div>}
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxHeight: '2.4em', overflow: 'hidden' }}>{p.body}</div>
                    </td>
                    <td><span className="badge" style={{ background: `${STATUS_COLORS[p.status]}22`, color: STATUS_COLORS[p.status] }}>{p.status}</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.scheduled_at ? new Date(p.scheduled_at).toLocaleString() : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        <button className="row-hover-btn" onClick={() => setEditing({ ...p, account_id: p.account_id || '' })}>Edit</button>
                        {p.status === 'Draft' && <button className="row-hover-btn" style={{ color: 'var(--green)' }} onClick={() => publishPost(p.id)}>Publish</button>}
                        <button className="row-hover-btn danger" onClick={() => setConfirmDelete(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Templates */}
      {tab === 'templates' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--sp-3)' }}>
            {(templates.length ? templates : DEFAULT_TEMPLATES).map((t, i) => (
              <div key={t.id || i} className="home-card" style={{ padding: 'var(--sp-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-2)' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</span>
                  {t.category && <span className="badge" style={{ background: 'var(--gray-100)', fontSize: '0.7rem' }}>{t.category}</span>}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 'var(--sp-2)', whiteSpace: 'pre-wrap' }}>{t.body}</p>
                {t.hashtags && <div style={{ fontSize: '0.75rem', color: 'var(--blue)' }}>{t.hashtags}</div>}
                <div style={{ display: 'flex', gap: '0.25rem', marginTop: 'var(--sp-2)' }}>
                  <button className="row-hover-btn" onClick={() => useTemplate(t)}>Use</button>
                  {!t.id && <button className="row-hover-btn" onClick={() => saveTemplate(t)}>Save to DB</button>}
                  {t.id && <button className="row-hover-btn danger" onClick={() => deleteTemplate(t.id)}>Delete</button>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Blog to Social */}
      {tab === 'blog' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--sp-3)' }}>
          {ARTICLES.map(a => (
            <div key={a.slug} className="home-card" style={{ padding: 'var(--sp-3)' }}>
              <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
                <span className="badge" style={{ background: 'rgba(27,42,107,0.1)', color: 'var(--blue)', fontSize: '0.72rem' }}>{a.category}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.readTime}</span>
              </div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: 'var(--sp-2)', lineHeight: 1.4 }}>{a.title}</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 'var(--sp-2)' }}>{a.excerpt}</p>
              <button className="btn-save" style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }} onClick={() => createFromBlog(a)}>📤 Create Social Post</button>
            </div>
          ))}
        </div>
      )}

      {/* Post Composer / Editor */}
      {editing && (
        <div className="panel-overlay" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div className="panel" role="dialog" aria-modal="true" style={{ maxWidth: 560 }}>
            <div className="panel-header">
              <h3>{editing.id ? 'Edit Post' : 'New Post'}</h3>
              <button className="panel-close" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Account selector */}
              <div className="modal-field">
                <label>Platform / Account *</label>
                <select className="opp-filter" style={{ width: '100%' }} value={editing.account_id} onChange={e => setEditing(p => ({ ...p, account_id: e.target.value }))}>
                  <option value="">Select account...</option>
                  {accounts.filter(a => a.is_active).map(a => <option key={a.id} value={a.id}>{a.icon || '📱'} {a.platform} — @{a.handle}</option>)}
                </select>
              </div>

              {/* Title */}
              <div className="modal-field">
                <label>Title (optional)</label>
                <input value={editing.title || ''} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} placeholder="Internal title for this post" />
              </div>

              {/* Body with character count */}
              <div className="modal-field">
                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Post Body *</span>
                  {charLimit && (
                    <span style={{ fontSize: '0.75rem', color: charCount > charLimit ? 'var(--red)' : 'var(--text-muted)', fontWeight: charCount > charLimit ? 700 : 400 }}>
                      {charCount}/{charLimit}
                    </span>
                  )}
                </label>
                <textarea
                  rows={6}
                  value={editing.body || ''}
                  onChange={e => setEditing(p => ({ ...p, body: e.target.value }))}
                  placeholder="What do you want to share?"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: `1px solid ${charCount > (charLimit || Infinity) ? 'var(--red)' : 'var(--border)'}`, borderRadius: 'var(--radius)', fontSize: '0.88rem', background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              {/* Hashtags */}
              <div className="modal-field">
                <label>Hashtags</label>
                <input value={editing.hashtags || ''} onChange={e => setEditing(p => ({ ...p, hashtags: e.target.value }))} placeholder="#sportscards #cardcollecting" />
              </div>

              {/* Status + Schedule */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="modal-field">
                  <label>Status</label>
                  <select className="opp-filter" style={{ width: '100%' }} value={editing.status} onChange={e => setEditing(p => ({ ...p, status: e.target.value }))}>
                    {['Draft', 'Scheduled', 'Published'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="modal-field">
                  <label>Schedule For</label>
                  <input type="datetime-local" value={editing.scheduled_at ? editing.scheduled_at.slice(0, 16) : ''} onChange={e => setEditing(p => ({ ...p, scheduled_at: e.target.value, status: e.target.value ? 'Scheduled' : p.status }))} style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.85rem', background: 'var(--card)', color: 'var(--text)' }} />
                </div>
              </div>

              {/* Preview */}
              {editing.body && activeAccount && (
                <div style={{ padding: 'var(--sp-3)', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--sp-2)' }}>Preview — {activeAccount.platform}</div>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.2rem' }}>{activeAccount.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>@{activeAccount.handle}</div>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', margin: '0.25rem 0' }}>{editing.body}</p>
                      {editing.hashtags && <div style={{ fontSize: '0.8rem', color: 'var(--blue)' }}>{editing.hashtags}</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-save" onClick={savePost} disabled={!editing.body || !editing.account_id}>
                {editing.status === 'Scheduled' ? '📅 Schedule' : editing.id ? 'Update' : 'Save Draft'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Post?"
        message="This will permanently delete this post."
        onConfirm={() => deletePost(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
