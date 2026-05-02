import { useState, useEffect } from 'react'
import { tipsApi } from '../../services/contentManagementApi'

const CATEGORIES = ['General', 'Grading', 'Storage', 'Buying', 'Selling', 'Investing']
const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const EMOJI_OPTIONS = ['💡', '🏆', '💰', '📦', '🎯', '⭐', '🔥', '📈', '🛠️', '📚', '🎓', '💎', '🚀', '✨', '🎪', '🌟']

const EMPTY = { title: '', body: '', category: 'General', difficulty: 'Beginner', emoji: '💡', isFeatured: false, relatedUrl: '' }

export default function TipsManager() {
  const [tips, setTips] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load tips on mount
  useEffect(() => {
    loadTips()
  }, [])

  async function loadTips() {
    try {
      setLoading(true)
      setError(null)
      const data = await tipsApi.getAll()
      setTips(data)
    } catch (err) {
      console.error('Failed to load tips:', err)
      setError('Failed to load tips. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) return
    
    try {
      setLoading(true)
      setError(null)
      
      if (editId) {
        await tipsApi.update(editId, {
          ...form,
          updatedBy: 'admin'
        })
        setEditId(null)
      } else {
        await tipsApi.create({
          ...form,
          createdBy: 'admin'
        })
      }
      
      // Reload tips
      await loadTips()
      setForm(EMPTY)
      setShowEmojiPicker(false)
    } catch (err) {
      console.error('Failed to save tip:', err)
      setError('Failed to save tip. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(tip) {
    setEditId(tip.id)
    setForm({ 
      title: tip.title, 
      body: tip.body, 
      category: tip.category,
      difficulty: tip.difficulty || 'Beginner',
      emoji: tip.emoji || '💡',
      isFeatured: tip.is_featured || false,
      relatedUrl: tip.related_url || ''
    })
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this tip?')) return
    
    try {
      setLoading(true)
      setError(null)
      await tipsApi.delete(id, 'admin')
      await loadTips()
    } catch (err) {
      console.error('Failed to delete tip:', err)
      setError('Failed to delete tip. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    setEditId(null)
    setForm(EMPTY)
    setShowEmojiPicker(false)
  }

  // Filter tips by difficulty level
  const [filterDifficulty, setFilterDifficulty] = useState(null)
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)

  const filteredTips = tips.filter(tip => {
    const matchesDifficulty = !filterDifficulty || tip.difficulty === filterDifficulty
    const matchesFeatured = !showFeaturedOnly || tip.isFeatured
    return matchesDifficulty && matchesFeatured
  })

  // Sort featured tips to top
  const sortedTips = [...filteredTips].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1
    if (!a.isFeatured && b.isFeatured) return 1
    return 0
  })

  const difficultyColor = {
    'Beginner': 'rgba(76,175,80,0.1)',
    'Intermediate': 'rgba(255,152,0,0.1)',
    'Advanced': 'rgba(244,67,54,0.1)'
  }

  const difficultyTextColor = {
    'Beginner': 'var(--green)',
    'Intermediate': 'var(--orange)',
    'Advanced': 'var(--red)'
  }

  return (
    <div className="opp-section">
      <div className="opp-header"><h3>💡 Tips Management</h3></div>

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
          <select className="opp-filter" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="opp-filter" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
            {DIFFICULTY_LEVELS.map(d => <option key={d}>{d}</option>)}
          </select>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{
                fontSize: '1.5rem',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--card)'}
              title="Select emoji"
            >
              {form.emoji}
            </button>
            {showEmojiPicker && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.75rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.5rem',
                marginTop: '0.5rem',
                zIndex: 100,
                boxShadow: 'var(--shadow-lg)'
              }}>
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setForm(f => ({ ...f, emoji }))
                      setShowEmojiPicker(false)
                    }}
                    style={{
                      fontSize: '1.5rem',
                      background: form.emoji === emoji ? 'var(--brand)' : 'transparent',
                      border: form.emoji === emoji ? '2px solid var(--brand)' : '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (form.emoji !== emoji) e.currentTarget.style.background = 'var(--gray-50)'
                    }}
                    onMouseLeave={(e) => {
                      if (form.emoji !== emoji) e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Featured ⭐</span>
          </label>
        </div>
        <textarea
          className="opp-search"
          placeholder="Tip body..."
          rows={3}
          value={form.body}
          onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          style={{ resize: 'vertical' }}
        />
        <input
          className="opp-search"
          type="url"
          placeholder="Related URL (optional) - e.g., https://example.com/guide"
          value={form.relatedUrl}
          onChange={e => setForm(f => ({ ...f, relatedUrl: e.target.value }))}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn-save">{editId ? 'Update Tip' : 'Add Tip'}</button>
          {editId && <button type="button" className="btn-cancel" onClick={handleCancel}>Cancel</button>}
        </div>
      </form>

      {/* Filter Controls */}
      <div style={{ padding: '1rem 1.5rem', background: 'var(--gray-50)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter by Difficulty:</span>
          <button
            onClick={() => setFilterDifficulty(null)}
            style={{
              padding: '0.4rem 0.8rem',
              background: filterDifficulty === null ? 'var(--brand)' : 'var(--card)',
              color: filterDifficulty === null ? 'white' : 'var(--text)',
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
          {DIFFICULTY_LEVELS.map(level => (
            <button
              key={level}
              onClick={() => setFilterDifficulty(filterDifficulty === level ? null : level)}
              style={{
                padding: '0.4rem 0.8rem',
                background: filterDifficulty === level ? difficultyTextColor[level] : 'var(--card)',
                color: filterDifficulty === level ? 'white' : 'var(--text)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              {level}
            </button>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showFeaturedOnly}
            onChange={e => setShowFeaturedOnly(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Featured Only ⭐</span>
        </label>
      </div>

      {sortedTips.length === 0 && <div className="opp-empty">No tips yet. Add one above.</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', padding: '1.25rem 1.5rem' }}>
        {sortedTips.map(tip => (
          <div key={tip.id} className="home-card" style={{ 
            padding: '1rem',
            borderLeft: tip.isFeatured ? '4px solid var(--orange)' : '4px solid transparent',
            position: 'relative'
          }}>
            {tip.isFeatured && (
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
                ⭐ Featured
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flex: 1 }}>
                <span style={{ fontSize: '1.5rem' }}>{tip.emoji}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tip.title}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                    <span className="badge" style={{ background: 'rgba(2,113,235,0.1)', color: 'var(--blue)' }}>{tip.category}</span>
                    <span className="badge" style={{ background: difficultyColor[tip.difficulty], color: difficultyTextColor[tip.difficulty] }}>
                      {tip.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="icon-btn" onClick={() => handleEdit(tip)} aria-label={`Edit tip: ${tip.title}`}>✏️</button>
                <button className="icon-btn" onClick={() => handleDelete(tip.id)} aria-label={`Delete tip: ${tip.title}`}>🗑️</button>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{tip.body}</p>
            {tip.relatedUrl && (
              <a 
                href={tip.relatedUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginTop: '0.75rem',
                  padding: '0.4rem 0.8rem',
                  background: 'rgba(2,113,235,0.1)',
                  color: 'var(--blue)',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(2,113,235,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(2,113,235,0.1)'}
              >
                🔗 Learn More
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
