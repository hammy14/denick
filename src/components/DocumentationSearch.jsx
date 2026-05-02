import React, { useState, useEffect } from 'react'
import { authFetch } from '../context/AuthContext'
import { useToast } from './Toast'

/**
 * DocumentationSearch Component
 * Cross-project documentation search with filters
 * Task 23.8: Create documentation search interface
 */
export function DocumentationSearch({ onSelectDoc }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    project: 'all',
    category: 'all',
    status: 'all',
    tags: [],
  })
  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState([])
  const showToast = useToast()

  useEffect(() => {
    loadFilterOptions()
  }, [])

  useEffect(() => {
    if (searchQuery.length > 2) {
      performSearch()
    } else {
      setResults([])
    }
  }, [searchQuery, filters])

  async function loadFilterOptions() {
    try {
      const projectsRes = await authFetch('/api/pt/projects')
      const projectsData = await projectsRes.json()
      setProjects(Array.isArray(projectsData) ? projectsData : [])

      const categoriesRes = await authFetch('/api/pt/documentation/categories')
      const categoriesData = await categoriesRes.json()
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (err) {
      console.error('Error loading filter options:', err)
    }
  }

  async function performSearch() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        project: filters.project,
        category: filters.category,
        status: filters.status,
        tags: filters.tags.join(','),
      })

      const res = await authFetch(`/api/pt/documentation/search?${params}`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error searching documentation:', err)
      showToast('Search failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  function handleFilterChange(filterName, value) {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }))
  }

  function handleTagToggle(tag) {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '1px solid var(--border)',
            borderRadius: 6,
            fontSize: '0.95rem',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        <select
          value={filters.project}
          onChange={(e) => handleFilterChange('project', e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid var(--border)',
            borderRadius: 4,
            fontSize: '0.85rem',
            background: 'white',
          }}
        >
          <option value="all">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid var(--border)',
            borderRadius: 4,
            fontSize: '0.85rem',
            background: 'white',
          }}
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid var(--border)',
            borderRadius: 4,
            fontSize: '0.85rem',
            background: 'white',
          }}
        >
          <option value="all">All Status</option>
          <option value="up-to-date">Up to Date</option>
          <option value="needs-review">Needs Review</option>
          <option value="deprecated">Deprecated</option>
        </select>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: '2rem' }}>
            Searching...
          </div>
        ) : results.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: '2rem' }}>
            {searchQuery.length > 2 ? 'No results found' : 'Enter at least 3 characters to search'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {results.map(result => (
              <div
                key={result.doc_path}
                onClick={() => onSelectDoc && onSelectDoc(result)}
                style={{
                  padding: '1rem',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: 'white',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  {result.doc_path.split('/').pop()}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  {result.doc_path}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.4rem',
                      background: result.status === 'up-to-date' ? 'var(--green)22' : 'var(--orange)22',
                      color: result.status === 'up-to-date' ? 'var(--green)' : 'var(--orange)',
                      borderRadius: 3,
                    }}
                  >
                    {result.status}
                  </span>
                  {result.project_name && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.2rem 0.4rem',
                        background: 'var(--blue)22',
                        color: 'var(--blue)',
                        borderRadius: 3,
                      }}
                    >
                      {result.project_name}
                    </span>
                  )}
                  {result.tags && result.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.25rem', marginLeft: 'auto' }}>
                      {result.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '0.65rem',
                            padding: '0.15rem 0.3rem',
                            background: 'var(--gray-50)',
                            border: '1px solid var(--border)',
                            borderRadius: 2,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      {result.tags.length > 2 && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          +{result.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentationSearch
