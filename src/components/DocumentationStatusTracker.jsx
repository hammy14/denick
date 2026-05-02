import React, { useState, useEffect } from 'react'
import { authFetch } from '../context/AuthContext'
import { useToast } from './Toast'

/**
 * DocumentationStatusTracker Component
 * Track documentation status with review history
 * Task 23.7: Implement documentation status tracking
 */
export function DocumentationStatusTracker({ docPath, projectId }) {
  const [status, setStatus] = useState('up-to-date')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const showToast = useToast()

  useEffect(() => {
    loadDocStatus()
  }, [docPath, projectId])

  async function loadDocStatus() {
    setLoading(true)
    try {
      const res = await authFetch(`/api/pt/documentation/${docPath}/status`)
      const data = await res.json()
      setStatus(data.status || 'up-to-date')
      setHistory(Array.isArray(data.history) ? data.history : [])
    } catch (err) {
      console.error('Error loading documentation status:', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(newStatus) {
    try {
      const res = await authFetch(`/api/pt/documentation/${docPath}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: reviewNotes,
          reviewedBy: 'current-user',
          reviewedAt: new Date().toISOString(),
        }),
      })

      if (res.ok) {
        setStatus(newStatus)
        setReviewNotes('')
        showToast(`Documentation marked as ${newStatus}`, 'success')
        loadDocStatus()
      } else {
        showToast('Failed to update status', 'error')
      }
    } catch (err) {
      console.error('Error updating status:', err)
      showToast('Error updating status', 'error')
    }
  }

  const statusColors = {
    'up-to-date': { bg: 'var(--green)22', color: 'var(--green)', label: '✓ Up to Date' },
    'needs-review': { bg: 'var(--orange)22', color: 'var(--orange)', label: '⚠ Needs Review' },
    'deprecated': { bg: 'var(--red)22', color: 'var(--red)', label: '✕ Deprecated' },
  }

  const currentStyle = statusColors[status] || statusColors['up-to-date']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 6 }}>
      {/* Current Status */}
      <div>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
          📋 DOCUMENTATION STATUS
        </h4>
        <div
          style={{
            display: 'inline-block',
            padding: '0.5rem 0.75rem',
            background: currentStyle.bg,
            color: currentStyle.color,
            borderRadius: 4,
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {currentStyle.label}
        </div>
      </div>

      {/* Status Update Controls */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {Object.entries(statusColors).map(([statusKey, styleObj]) => (
          <button
            key={statusKey}
            onClick={() => updateStatus(statusKey)}
            disabled={status === statusKey}
            style={{
              padding: '0.5rem 0.75rem',
              background: status === statusKey ? styleObj.bg : 'white',
              color: status === statusKey ? styleObj.color : 'var(--text)',
              border: `1px solid ${status === statusKey ? styleObj.color : 'var(--border)'}`,
              borderRadius: 4,
              fontSize: '0.8rem',
              cursor: status === statusKey ? 'default' : 'pointer',
              opacity: status === statusKey ? 1 : 0.7,
              transition: 'all 0.2s',
            }}
          >
            {styleObj.label}
          </button>
        ))}
      </div>

      {/* Review Notes */}
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
          Review Notes
        </label>
        <textarea
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.target.value)}
          placeholder="Add notes about this documentation review..."
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid var(--border)',
            borderRadius: 4,
            fontSize: '0.85rem',
            fontFamily: 'inherit',
            minHeight: '60px',
            resize: 'vertical',
          }}
        />
      </div>

      {/* Review History */}
      <div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--blue)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            padding: 0,
          }}
        >
          {showHistory ? '▼' : '▶'} Review History ({history.length})
        </button>

        {showHistory && (
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {history.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No review history yet</div>
            ) : (
              history.map((entry, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.5rem',
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: 3,
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    {entry.status} by {entry.reviewedBy}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    {new Date(entry.reviewedAt).toLocaleString()}
                  </div>
                  {entry.notes && (
                    <div style={{ color: 'var(--text)', marginTop: '0.25rem' }}>
                      {entry.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Last Updated */}
      {history.length > 0 && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
          Last updated: {new Date(history[0].reviewedAt).toLocaleString()}
        </div>
      )}
    </div>
  )
}

export default DocumentationStatusTracker
