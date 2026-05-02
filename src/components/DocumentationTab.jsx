import React, { useState, useEffect } from 'react'
import { authFetch } from '../context/AuthContext'
import { useToast } from './Toast'

/**
 * DocumentationTab Component
 * Displays linked documentation for a project with preview capability
 * Task 23.3: Add Documentation tab to project details
 */
export function DocumentationTab({ projectId }) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [preview, setPreview] = useState('')
  const showToast = useToast()

  useEffect(() => {
    loadProjectDocs()
  }, [projectId])

  async function loadProjectDocs() {
    setLoading(true)
    try {
      const res = await authFetch(`/api/pt/projects/${projectId}/documentation`)
      const data = await res.json()
      setDocs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading documentation:', err)
      showToast('Failed to load documentation', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function loadDocPreview(docPath) {
    try {
      const res = await authFetch(`/api/pt/documentation/${docPath}`)
      const content = await res.text()
      setPreview(content)
      setSelectedDoc(docPath)
    } catch (err) {
      console.error('Error loading preview:', err)
      showToast('Failed to load preview', 'error')
    }
  }

  async function unlinkDoc(docPath) {
    try {
      await authFetch(`/api/pt/projects/${projectId}/documentation/${docPath}`, {
        method: 'DELETE'
      })
      showToast('Documentation unlinked', 'success')
      loadProjectDocs()
    } catch (err) {
      console.error('Error unlinking documentation:', err)
      showToast('Failed to unlink documentation', 'error')
    }
  }

  return (
    <div style={{ display: 'flex', gap: '1rem', height: '100%' }}>
      {/* Documentation List */}
      <div style={{ flex: '0 0 300px', borderRight: '1px solid var(--border)', paddingRight: '1rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
          📚 LINKED DOCUMENTATION
        </h3>
        
        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</div>
        ) : docs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No documentation linked yet. Use the linking interface to add docs.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {docs.map(doc => (
              <div
                key={doc.doc_path}
                style={{
                  padding: '0.75rem',
                  background: selectedDoc === doc.doc_path ? 'var(--blue)22' : 'var(--gray-50)',
                  border: `1px solid ${selectedDoc === doc.doc_path ? 'var(--blue)' : 'var(--border)'}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => loadDocPreview(doc.doc_path)}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  {doc.doc_path.split('/').pop()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  {doc.doc_path}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
                      marginLeft: 'auto',
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {selectedDoc ? (
          <div style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              📄 {selectedDoc}
            </div>
            <pre
              style={{
                background: 'var(--gray-50)',
                padding: '1rem',
                borderRadius: 6,
                overflow: 'auto',
                maxHeight: '400px',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
              }}
            >
              {preview}
            </pre>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: '2rem' }}>
            Select a documentation file to preview
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentationTab
