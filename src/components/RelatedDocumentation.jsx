import React, { useState, useEffect } from 'react'
import { authFetch } from '../context/AuthContext'
import { useToast } from './Toast'

/**
 * RelatedDocumentation Component
 * Displays documentation linked to a specific task with inline preview
 * Task 23.4: Add Related Documentation section to task details
 */
export function RelatedDocumentation({ taskId, projectId }) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedDoc, setExpandedDoc] = useState(null)
  const [previews, setPreviews] = useState({})
  const showToast = useToast()

  useEffect(() => {
    loadTaskDocs()
  }, [taskId])

  async function loadTaskDocs() {
    setLoading(true)
    try {
      const res = await authFetch(`/api/pt/tasks/${taskId}/documentation`)
      const data = await res.json()
      setDocs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading task documentation:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadDocPreview(docPath) {
    if (previews[docPath]) {
      setExpandedDoc(expandedDoc === docPath ? null : docPath)
      return
    }

    try {
      const res = await authFetch(`/api/pt/documentation/${docPath}`)
      const content = await res.text()
      setPreviews(prev => ({ ...prev, [docPath]: content }))
      setExpandedDoc(docPath)
    } catch (err) {
      console.error('Error loading preview:', err)
      showToast('Failed to load preview', 'error')
    }
  }

  async function unlinkDoc(docPath) {
    try {
      await authFetch(`/api/pt/tasks/${taskId}/documentation/${docPath}`, {
        method: 'DELETE'
      })
      showToast('Documentation unlinked', 'success')
      loadTaskDocs()
    } catch (err) {
      console.error('Error unlinking documentation:', err)
      showToast('Failed to unlink documentation', 'error')
    }
  }

  if (loading) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading documentation...</div>
  }

  if (docs.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
        No related documentation linked to this task.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {docs.map(doc => (
        <div
          key={doc.doc_path}
          style={{
            border: '1px solid var(--border)',
            borderRadius: 6,
            overflow: 'hidden',
            background: 'var(--card)',
          }}
        >
          {/* Header */}
          <div
            onClick={() => loadDocPreview(doc.doc_path)}
            style={{
              padding: '0.75rem',
              background: expandedDoc === doc.doc_path ? 'var(--blue)11' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'background 0.2s',
            }}
          >
            <span style={{ fontSize: '1rem' }}>
              {expandedDoc === doc.doc_path ? '▼' : '▶'}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                📄 {doc.doc_path.split('/').pop()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {doc.doc_path}
              </div>
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '0.2rem 0.4rem',
                background: doc.status === 'up-to-date' ? 'var(--green)22' : 'var(--orange)22',
                color: doc.status === 'up-to-date' ? 'var(--green)' : 'var(--orange)',
                borderRadius: 3,
              }}
            >
              {doc.status}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                unlinkDoc(doc.doc_path)
              }}
              style={{
                padding: '0.2rem 0.4rem',
                fontSize: '0.7rem',
                background: 'var(--red)22',
                color: 'var(--red)',
                border: 'none',
                borderRadius: 3,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          {/* Preview */}
          {expandedDoc === doc.doc_path && previews[doc.doc_path] && (
            <div
              style={{
                padding: '0.75rem',
                borderTop: '1px solid var(--border)',
                background: 'var(--gray-50)',
                fontSize: '0.8rem',
                lineHeight: 1.5,
                maxHeight: '300px',
                overflow: 'auto',
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {previews[doc.doc_path].substring(0, 500)}
                {previews[doc.doc_path].length > 500 && '...'}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default RelatedDocumentation
