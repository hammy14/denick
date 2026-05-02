import { useState, useEffect } from 'react'
import DOMPurify from 'dompurify'
import { announcementsApi } from '../../services/contentManagementApi'
import { getAnnouncementStatus, getStatusBadgeStyle, formatDateForInput, validateSchedulingDates, getStatusLabel } from '../../utils/announcementStatus'

const TARGET_AUDIENCES = ['All', 'Admin', 'User', 'Guest', 'Beginner', 'Intermediate', 'Advanced']

const EMPTY = { 
  title: '', 
  body: '', 
  priority: 'Normal',
  isPinned: false,
  pinDuration: 24,
  targetAudience: 'All',
  richText: false,
  startDate: '',
  endDate: ''
}

export default function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState(null)
  const [filterAudience, setFilterAudience] = useState(null)
  const [filterStatus, setFilterStatus] = useState(null)
  const [showRichTextHelp, setShowRichTextHelp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [schedulingError, setSchedulingError] = useState(null)

  // Load announcements on mount
  useEffect(() => {
    loadAnnouncements()
  }, [])

  async function loadAnnouncements() {
    try {
      setLoading(true)
      setError(null)
      const data = await announcementsApi.getAll()
      setAnnouncements(data)
    } catch (err) {
      console.error('Failed to load announcements:', err)
      setError('Failed to load announcements. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) return
    
    // Validate scheduling dates
    const validation = validateSchedulingDates(form.startDate, form.endDate)
    if (!validation.valid) {
      setSchedulingError(validation.error)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      setSchedulingError(null)
      
      if (editId) {
        await announcementsApi.update(editId, {
          ...form,
          updatedBy: 'admin'
        })
        setEditId(null)
      } else {
        await announcementsApi.create({
          ...form,
          createdBy: 'admin'
        })
      }
      
      // Reload announcements
      await loadAnnouncements()
      setForm(EMPTY)
    } catch (err) {
      console.error('Failed to save announcement:', err)
      setError('Failed to save announcement. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(a) {
    setEditId(a.id)
    setForm({ 
      title: a.title, 
      body: a.body, 
      priority: a.priority,
      isPinned: a.is_pinned || false,
      pinDuration: a.pin_duration || 24,
      targetAudience: a.target_audience || 'All',
      richText: a.rich_text || false,
      startDate: formatDateForInput(a.start_date) || '',
      endDate: formatDateForInput(a.end_date) || ''
    })
    setSchedulingError(null)
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return
    
    try {
      setLoading(true)
      setError(null)
      await announcementsApi.delete(id, 'admin')
      await loadAnnouncements()
    } catch (err) {
      console.error('Failed to delete announcement:', err)
      setError('Failed to delete announcement. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    setEditId(null)
    setForm(EMPTY)
  }

  // Filter and search announcements
  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         a.body.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = !filterPriority || a.priority === filterPriority
    const matchesAudience = !filterAudience || a.targetAudience === filterAudience || a.targetAudience === 'All'
    const status = getAnnouncementStatus(a)
    const matchesStatus = !filterStatus || status === filterStatus
    return matchesSearch && matchesPriority && matchesAudience && matchesStatus
  })

  // Sort: pinned first, then by priority
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    if (a.priority === 'Important' && b.priority !== 'Important') return -1
    if (a.priority !== 'Important' && b.priority === 'Important') return 1
    return 0
  })

  const priorityStyle = p => p === 'Important'
    ? { background: 'rgba(224,92,75,0.1)', color: 'var(--orange)' }
    : { background: 'rgba(2,113,235,0.1)', color: 'var(--blue)' }

  const audienceStyle = a => {
    const colors = {
      'All': 'rgba(100,100,100,0.1)',
      'Admin': 'rgba(244,67,54,0.1)',
      'User': 'rgba(76,175,80,0.1)',
      'Guest': 'rgba(255,152,0,0.1)',
      'Beginner': 'rgba(76,175,80,0.1)',
      'Intermediate': 'rgba(255,152,0,0.1)',
      'Advanced': 'rgba(244,67,54,0.1)'
    }
    const textColors = {
      'All': 'var(--text-muted)',
      'Admin': 'var(--red)',
      'User': 'var(--green)',
      'Guest': 'var(--orange)',
      'Beginner': 'var(--green)',
      'Intermediate': 'var(--orange)',
      'Advanced': 'var(--red)'
    }
    return { background: colors[a], color: textColors[a] }
  }

  const renderRichText = (text) => {
    if (!text) return ''
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
    return html
  }

  return (
    <div className="opp-section">
      <div className="opp-header"><h3>📢 Announcements</h3></div>

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

      {loading && (
        <div style={{
          padding: '0.75rem 1.5rem',
          background: 'rgba(2,113,235,0.1)',
          color: 'var(--blue)',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.9rem'
        }}>
          ⏳ Loading...
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="opp-search"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            style={{ flex: 2, minWidth: 180 }}
          />
          <select className="opp-filter" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
            <option>Normal</option>
            <option>Important</option>
          </select>
          <select className="opp-filter" value={form.targetAudience} onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))}>
            {TARGET_AUDIENCES.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input
              type="checkbox"
              checked={form.isPinned}
              onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Pin 📌</span>
          </label>
          {form.isPinned && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Duration (hours):</label>
              <input
                type="number"
                min="1"
                max="168"
                value={form.pinDuration}
                onChange={e => setForm(f => ({ ...f, pinDuration: parseInt(e.target.value) || 24 }))}
                style={{ width: '60px', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)' }}
              />
            </div>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
            <input
              type="checkbox"
              checked={form.richText}
              onChange={e => setForm(f => ({ ...f, richText: e.target.checked }))}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Rich Text</span>
          </label>
          <button
            type="button"
            onClick={() => setShowRichTextHelp(!showRichTextHelp)}
            style={{ fontSize: '0.85rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.4rem 0.8rem', cursor: 'pointer' }}
          >
            ?
          </button>
        </div>

        {showRichTextHelp && (
          <div style={{ background: 'rgba(2,113,235,0.05)', border: '1px solid rgba(2,113,235,0.2)', borderRadius: '6px', padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <strong>Rich Text Formatting:</strong><br/>
            <code>**bold text**</code> → <strong>bold text</strong><br/>
            <code>*italic text*</code> → <em>italic text</em><br/>
            Line breaks are preserved
          </div>
        )}

        <textarea
          className="opp-search"
          placeholder="Announcement body..."
          rows={3}
          value={form.body}
          onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          style={{ resize: 'vertical', fontFamily: form.richText ? 'monospace' : 'inherit' }}
        />

        {/* Scheduling Section */}
        <div style={{ background: 'rgba(255,152,0,0.05)', border: '1px solid rgba(255,152,0,0.2)', borderRadius: '6px', padding: '0.75rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⏰ Scheduling (Optional)
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={e => {
                  setForm(f => ({ ...f, startDate: e.target.value }))
                  setSchedulingError(null)
                }}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                End Date & Time
              </label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={e => {
                  setForm(f => ({ ...f, endDate: e.target.value }))
                  setSchedulingError(null)
                }}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
              />
            </div>
          </div>
          {schedulingError && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--red)', background: 'rgba(244,67,54,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
              ⚠️ {schedulingError}
            </div>
          )}
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Leave both empty for always-active announcements
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn-save">{editId ? 'Update' : 'Post Announcement'}</button>
          {editId && <button type="button" className="btn-cancel" onClick={handleCancel}>Cancel</button>}
        </div>
      </form>

      {/* Search and Filter Bar */}
      <div style={{ padding: '1rem 1.5rem', background: 'var(--gray-50)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search announcements..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ 
            flex: 1, 
            minWidth: '200px',
            padding: '0.5rem 0.75rem',
            borderRadius: '4px',
            border: '1px solid var(--border)',
            fontSize: '0.9rem'
          }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
          <button
            onClick={() => setFilterStatus(null)}
            style={{
              padding: '0.4rem 0.8rem',
              background: filterStatus === null ? 'var(--brand)' : 'var(--card)',
              color: filterStatus === null ? 'white' : 'var(--text)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            All
          </button>
          {['active', 'scheduled', 'expired'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? null : s)}
              style={{
                padding: '0.4rem 0.8rem',
                background: filterStatus === s ? 'var(--brand)' : 'var(--card)',
                color: filterStatus === s ? 'white' : 'var(--text)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              {getStatusLabel(s)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Priority:</span>
          <button
            onClick={() => setFilterPriority(null)}
            style={{
              padding: '0.4rem 0.8rem',
              background: filterPriority === null ? 'var(--brand)' : 'var(--card)',
              color: filterPriority === null ? 'white' : 'var(--text)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            All
          </button>
          {['Normal', 'Important'].map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(filterPriority === p ? null : p)}
              style={{
                padding: '0.4rem 0.8rem',
                background: filterPriority === p ? (p === 'Important' ? 'var(--orange)' : 'var(--blue)') : 'var(--card)',
                color: filterPriority === p ? 'white' : 'var(--text)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Audience:</span>
          <button
            onClick={() => setFilterAudience(null)}
            style={{
              padding: '0.4rem 0.8rem',
              background: filterAudience === null ? 'var(--brand)' : 'var(--card)',
              color: filterAudience === null ? 'white' : 'var(--text)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            All
          </button>
          {TARGET_AUDIENCES.map(a => (
            <button
              key={a}
              onClick={() => setFilterAudience(filterAudience === a ? null : a)}
              style={{
                padding: '0.4rem 0.8rem',
                background: filterAudience === a ? 'var(--brand)' : 'var(--card)',
                color: filterAudience === a ? 'white' : 'var(--text)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {sortedAnnouncements.length === 0 && <div className="opp-empty">No announcements found.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem 1.5rem' }}>
        {sortedAnnouncements.map(a => {
          const status = getAnnouncementStatus(a)
          const statusStyle = getStatusBadgeStyle(status)
          return (
            <div key={a.id} className="home-card" style={{ 
              padding: '1rem',
              borderTop: a.isPinned ? '3px solid var(--orange)' : 'none',
              position: 'relative'
            }}>
              {a.isPinned && (
                <div style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  background: 'var(--orange)',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  📌 Pinned
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.title}</span>
                    <span className="badge" style={priorityStyle(a.priority)}>{a.priority}</span>
                    <span className="badge" style={audienceStyle(a.targetAudience)}>{a.targetAudience}</span>
                    <span className="badge" style={{ background: statusStyle.background, color: statusStyle.color }}>
                      {statusStyle.emoji} {getStatusLabel(status)}
                    </span>
                  </div>
                  <div 
                    style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.4rem' }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(a.richText ? renderRichText(a.body) : a.body) }}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    {a.date}
                  </div>
                  {(a.start_date || a.end_date) && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {a.start_date && <div>📅 Starts: {new Date(a.start_date).toLocaleString()}</div>}
                      {a.end_date && <div>📅 Ends: {new Date(a.end_date).toLocaleString()}</div>}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', marginLeft: '1rem' }}>
                  <button className="icon-btn" onClick={() => handleEdit(a)} aria-label={`Edit announcement: ${a.title}`}>✏️</button>
                  <button className="icon-btn" onClick={() => handleDelete(a.id)} aria-label={`Delete announcement: ${a.title}`}>🗑️</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
