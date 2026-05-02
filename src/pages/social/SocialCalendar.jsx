import { useState, useEffect } from 'react'
import { authFetch } from '../../context/AuthContext'
import { API_BASE } from '../../config/api'

const API = `${API_BASE}/api/social`
const PLATFORM_ICONS = { Facebook: '👍', Twitter: '𝕏', Instagram: '📸', YouTube: '▶️', TikTok: '🎵', Reddit: '🔗', LinkedIn: '💼', Discord: '💬', Threads: '🧵', Bluesky: '🦋' }
const STATUS_COLORS = { Draft: 'var(--text-muted)', Scheduled: 'var(--blue)', Published: 'var(--green)', Failed: 'var(--red)' }
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function SocialCalendar() {
  const [posts, setPosts] = useState([])
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [selectedDay, setSelectedDay] = useState(null)

  async function load() {
    try {
      const res = await authFetch(`${API}/posts?perpage=500`)
      if (res.ok) { const d = await res.json(); setPosts(d.rows || []) }
    } catch {}
  }

  useEffect(() => { load() }, [])

  const year = month.getFullYear()
  const mo = month.getMonth()
  const firstDay = new Date(year, mo, 1).getDay()
  const daysInMonth = new Date(year, mo + 1, 0).getDate()
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Group posts by date
  const postsByDate = {}
  posts.forEach(p => {
    const dateStr = p.scheduled_at ? p.scheduled_at.slice(0, 10) : p.published_at ? p.published_at.slice(0, 10) : p.created_at ? p.created_at.slice(0, 10) : null
    if (!dateStr) return
    if (!postsByDate[dateStr]) postsByDate[dateStr] = []
    postsByDate[dateStr].push(p)
  })

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function prevMonth() { setMonth(new Date(year, mo - 1, 1)); setSelectedDay(null) }
  function nextMonth() { setMonth(new Date(year, mo + 1, 1)); setSelectedDay(null) }

  function dateStr(day) {
    return `${year}-${String(mo + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const selectedPosts = selectedDay ? (postsByDate[dateStr(selectedDay)] || []) : []

  return (
    <div className="opp-section">
      <div className="opp-header">
        <h3>📅 Content Calendar</h3>
        <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center' }}>
          <button className="btn-cancel" style={{ padding: '0.3rem 0.6rem' }} onClick={prevMonth}>◀</button>
          <span style={{ fontWeight: 600, minWidth: 160, textAlign: 'center' }}>{monthLabel}</span>
          <button className="btn-cancel" style={{ padding: '0.3rem 0.6rem' }} onClick={nextMonth}>▶</button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        {DAYS.map(d => (
          <div key={d} style={{ padding: 'var(--sp-2)', textAlign: 'center', fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--gray-50)', textTransform: 'uppercase' }}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} style={{ background: 'var(--card)', minHeight: 80 }} />
          const ds = dateStr(day)
          const dayPosts = postsByDate[ds] || []
          const isToday = ds === todayStr
          const isSelected = selectedDay === day
          return (
            <div
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              style={{
                background: isSelected ? 'var(--brand-subtle)' : 'var(--card)',
                minHeight: 80, padding: 'var(--sp-1)', cursor: 'pointer',
                borderLeft: isToday ? '3px solid var(--blue)' : undefined,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--gray-50)' }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'var(--card)' }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--blue)' : 'var(--text-muted)', marginBottom: 2 }}>{day}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {dayPosts.slice(0, 3).map(p => (
                  <div key={p.id} style={{ fontSize: '0.65rem', padding: '1px 4px', borderRadius: 3, background: `${STATUS_COLORS[p.status]}18`, color: STATUS_COLORS[p.status], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.platform_icon || PLATFORM_ICONS[p.platform] || '📝'} {p.title || p.body?.slice(0, 20)}
                  </div>
                ))}
                {dayPosts.length > 3 && <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>+{dayPosts.length - 3} more</div>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Day Detail */}
      {selectedDay && (
        <div style={{ marginTop: 'var(--sp-4)' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: 'var(--sp-3)' }}>
            {new Date(year, mo, selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 'var(--sp-2)' }}>({selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''})</span>
          </h4>
          {selectedPosts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No posts on this day.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              {selectedPosts.map(p => {
                const eng = typeof p.engagement_data === 'string' ? JSON.parse(p.engagement_data || '{}') : (p.engagement_data || {})
                return (
                  <div key={p.id} className="home-card" style={{ padding: 'var(--sp-3)', display: 'flex', gap: 'var(--sp-3)', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.3rem' }}>{p.platform_icon || PLATFORM_ICONS[p.platform] || '📝'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.platform || 'Unknown'}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{p.handle || '—'}</span>
                        <span className="badge" style={{ background: `${STATUS_COLORS[p.status]}22`, color: STATUS_COLORS[p.status], fontSize: '0.7rem' }}>{p.status}</span>
                      </div>
                      {p.title && <div style={{ fontWeight: 500, fontSize: '0.85rem', marginBottom: 2 }}>{p.title}</div>}
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0, whiteSpace: 'pre-wrap' }}>{p.body?.slice(0, 200)}{p.body?.length > 200 ? '...' : ''}</p>
                      {(eng.likes || eng.shares || eng.comments) ? (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          👍 {eng.likes || 0} · 🔄 {eng.shares || 0} · 💬 {eng.comments || 0}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
