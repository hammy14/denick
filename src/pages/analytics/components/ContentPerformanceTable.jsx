import { useState, useCallback } from 'react'
import { SkeletonTable } from '../../../components/Skeleton'
import EmptyState from '../../../components/EmptyState'

const CONTENT_TYPES = ['announcement', 'tip']
const AUDIENCE_SEGMENTS = ['All', 'Admin', 'User', 'Guest', 'Beginner', 'Intermediate', 'Advanced']
const PAGE_SIZES = [10, 20, 50]

function SortableHeader({ label, sortKey, currentSort, onSort, isSortable = true }) {
  const isActive = currentSort?.key === sortKey
  const isAsc = currentSort?.order === 'asc'

  if (!isSortable) {
    return <th>{label}</th>
  }

  return (
    <th
      onClick={() => {
        if (isActive) {
          onSort(sortKey, isAsc ? 'desc' : 'asc')
        } else {
          onSort(sortKey, 'asc')
        }
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (isActive) {
            onSort(sortKey, isAsc ? 'desc' : 'asc')
          } else {
            onSort(sortKey, 'asc')
          }
        }
      }}
      className={`sortable-header ${isActive ? 'active' : ''}`}
      aria-label={`Sort by ${label}${isActive ? `, currently ${isAsc ? 'ascending' : 'descending'}` : ''}`}
    >
      {label}
      {isActive && <span className="sort-indicator">{isAsc ? ' ↑' : ' ↓'}</span>}
    </th>
  )
}

export default function ContentPerformanceTable({
  data,
  isLoading,
  filters,
  onFilterChange,
  onRowClick,
}) {
  const [sort, setSort] = useState({ key: 'createdAt', order: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [localFilters, setLocalFilters] = useState(filters || {})

  const handleSort = useCallback((key, order) => {
    setSort({ key, order })
    setCurrentPage(1)
  }, [])

  const handleFilterChange = useCallback((newFilters) => {
    setLocalFilters(newFilters)
    onFilterChange?.(newFilters)
    setCurrentPage(1)
  }, [onFilterChange])

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  if (isLoading && !data) {
    return (
      <div className="content-performance-table-container">
        <h2 className="section-title">Content Performance</h2>
        <SkeletonTable rows={8} cols={7} />
      </div>
    )
  }

  const items = data?.items || []
  const total = data?.total || 0

  if (items.length === 0) {
    return (
      <div className="content-performance-table-container">
        <h2 className="section-title">Content Performance</h2>
        <EmptyState
          icon="📊"
          title="No content found"
          message="Try adjusting your filters or time period to see content performance data."
        />
      </div>
    )
  }

  const totalPages = Math.ceil(total / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, total)

  return (
    <div className="content-performance-table-container">
      <div className="table-header">
        <h2 className="section-title">Content Performance</h2>
        <div className="table-controls">
          <div className="filter-group">
            <label htmlFor="content-type-filter">Content Type:</label>
            <select
              id="content-type-filter"
              value={localFilters.contentType || ''}
              onChange={(e) =>
                handleFilterChange({
                  ...localFilters,
                  contentType: e.target.value || null,
                })
              }
              aria-label="Filter by content type"
            >
              <option value="">All Types</option>
              {CONTENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="segment-filter">Audience Segment:</label>
            <select
              id="segment-filter"
              value={localFilters.audienceSegment || ''}
              onChange={(e) =>
                handleFilterChange({
                  ...localFilters,
                  audienceSegment: e.target.value || null,
                })
              }
              aria-label="Filter by audience segment"
            >
              <option value="">All Segments</option>
              {AUDIENCE_SEGMENTS.map((segment) => (
                <option key={segment} value={segment}>
                  {segment}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="page-size-select">Items per page:</label>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              aria-label="Select items per page"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="content-table" role="grid" aria-label="Content performance metrics">
          <thead>
            <tr>
              <SortableHeader
                label="Title"
                sortKey="title"
                currentSort={sort}
                onSort={handleSort}
              />
              <SortableHeader
                label="Type"
                sortKey="type"
                currentSort={sort}
                onSort={handleSort}
              />
              <SortableHeader
                label="Created"
                sortKey="createdAt"
                currentSort={sort}
                onSort={handleSort}
              />
              <SortableHeader
                label="Views"
                sortKey="views"
                currentSort={sort}
                onSort={handleSort}
              />
              <SortableHeader
                label="Engagements"
                sortKey="engagements"
                currentSort={sort}
                onSort={handleSort}
              />
              <SortableHeader
                label="Engagement Rate"
                sortKey="engagementRate"
                currentSort={sort}
                onSort={handleSort}
              />
              <SortableHeader
                label="Last Updated"
                sortKey="updatedAt"
                currentSort={sort}
                onSort={handleSort}
              />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onRowClick?.(item)
                  }
                }}
                role="button"
                tabIndex={0}
                className="table-row-clickable"
              >
                <td className="cell-title">{item.title}</td>
                <td className="cell-type">
                  <span className="badge">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                </td>
                <td className="cell-date">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td className="cell-number">{item.views.toLocaleString()}</td>
                <td className="cell-number">{item.engagements.toLocaleString()}</td>
                <td className="cell-number">
                  {(item.engagementRate || 0).toFixed(1)}%
                </td>
                <td className="cell-date">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="pagination-info">
          Showing {startIndex + 1} to {endIndex} of {total} items
        </div>
        <div className="pagination-controls">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ← Previous
          </button>
          <span className="page-indicator">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
