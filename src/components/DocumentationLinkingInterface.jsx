import React, { useState, useEffect } from 'react'
import { authFetch } from '../context/AuthContext'
import { useToast } from './Toast'

/**
 * DocumentationLinkingInterface Component
 * Drag-and-drop interface for linking documentation to projects/tasks
 * Task 23.5: Create documentation linking interface
 */
export function DocumentationLinkingInterface({ projectId, taskId, onLinked }) {
  const [allDocs, setAllDocs] = useState([])
  const [linkedDocs, setLinkedDocs] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDocs, setSelectedDocs] = useState([])
  const [loading, setLoading] = useState(false)
  const [draggedDoc, setDraggedDoc] = useState(null)
  const showToast = useToast()

  useEffect(() => {
    loadAvailableDocs()
    loadLinkedDocs()
  }, [projectId, taskId])

  async function loadAvailableDocs() {
    try {
      const res = await authFetch('/api/pt/documentation')
      const data = await res.json()
      setAllDocs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading documentation:', err)
    }
  }

  async function loadLinkedDocs() {
    try {
      const endpoint = taskId
        ? `/api/pt/tasks/${taskId}/documentation`
        : `/api/pt/projects/${projectId}/documentation`
      const res = await authFetch(endpoint)
      const data = await res.json()
      setLinkedDocs(Array.isArray(data) ? data.map(d => d.doc_path) : [])
    } catch (err) {
      console.error('Error loading linked docs:', err)
    }
  }

  const filteredDocs = allDocs.filter(doc =>
    doc.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !linkedDocs.includes(doc)
  )

  async function linkDoc(docPath) {
    setLoading(true)
    try {
      const endpoint = taskId
        ? `/api/pt/tasks/${taskId}/documentation`
        : `/api/pt/projects/${projectId}/documentation`
      
      await authFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc_path: docPath, status: 'up-to-date' })
      })
      
      showToast('Documentation linked', 'success')
      loadLinkedDocs()
      onLinked?.()
    } catch (err) {
      console.error('Error linking documentation:', err)
      showToast('Failed to link documentation', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function bulkLink() {
    if (selectedDocs.length === 0) {
      showToast('Select documentation to link', 'info')
      return
    }

    setLoading(true)
    try {
      for (const docPath of selectedDocs) {
        const endpoint = taskId
          ? `/api/pt/tasks/${taskId}/documentation`
          : `/api/pt/projects/${projectId}/documentation`
        
        await authFetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doc_path: docPath, status: 'up-to-date' })
        })
      }
      
      showToast(`${selectedDocs.length} documentation files linked`, 'success')
      setSelectedDocs([])
      loadLinkedDocs()
      onLinked?.()
    } catch (err) {
      console.error('Error bulk linking:', err)
      showToast('Failed to link some documentation', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="🔍 Search documentation..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--border)',
            borderRadius: 6,
            fontSize: '0.85rem',
            background: 'var(--card)',
            color: 'var(--text)',
          }}
        />
      </div>

      {/* Available Documentation */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          📚 AVAILABLE DOCUMENTATION ({filteredDocs.length})
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.5rem',
            maxHeight: '300px',
            overflow: 'auto',
            padding: '0.5rem',
            background: 'var(--gray-50)',
            borderRadius: 6,
            border: '1px solid var(--border)',
          }}
        >
          {filteredDocs.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>
              No available documentation
            </div>
          ) : (
            filteredDocs.map(doc => (
              <div
                key={doc}
                draggable
                onDragStart={() => setDraggedDoc(doc)}
                onDragEnd={() => setDraggedDoc(null)}
                onClick={() => setSelectedDocs(prev =>
                  prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]
                )}
                style={{
                  padding: '0.5rem',
                  background: selectedDocs.includes(doc) ? 'var(--blue)22' : 'var(--card)',
                  border: `1px solid ${selectedDocs.includes(doc) ? 'var(--blue)' : 'var(--border)'}`,
                  borderRadius: 4,
                  cursor: 'grab',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s',
                  opacity: draggedDoc === doc ? 0.5 : 1,
                }}
              >
                {doc.split('/').pop()}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={bulkLink}
          disabled={selectedDocs.length === 0 || loading}
          style={{
            flex: 1,
            padding: '0.5rem 0.75rem',
            background: selectedDocs.length === 0 ? 'var(--gray-300)' : 'var(--blue)',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: selectedDocs.length === 0 ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Linking...' : `Link ${selectedDocs.length} Selected`}
        </button>
      </div>

      {/* Linked Documentation */}
      {linkedDocs.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            ✅ LINKED DOCUMENTATION ({linkedDocs.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {linkedDocs.map(doc => (
              <span
                key={doc}
                style={{
                  padding: '0.4rem 0.6rem',
                  background: 'var(--green)22',
                  color: 'var(--green)',
                  borderRadius: 4,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                ✓ {doc.split('/').pop()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentationLinkingInterface
