import { useState } from 'react'
import { SkeletonTable } from '../../../components/Skeleton'
import EmptyState from '../../../components/EmptyState'

export default function CategoryPerformanceBreakdown({
  data,
  isLoading,
  filters,
  onFilterChange,
}) {
  const [selectedCategory, setSelectedCategory] = useState(filters?.category || null)
  const [sortBy, setSortBy] = useState('engagementRate')

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    onFilterChange?.({
      ...filters,
      category,
    })
  }

  if (isLoading && !data) {
    return (
      <div className="category-breakdown-container">
        <h2 className="section-title">Category Performance Breakdown</h2>
        <SkeletonTable rows={8} cols={5} />
      </div>
    )
  }

  const categories = data?.categories || []

  if (categories.length === 0) {
    return (
      <div className="category-breakdown-container">
        <h2 className="section-title">Category Performance Breakdown</h2>
        <EmptyState
          icon="📂"
          title="No category data"
          message="No tips found for the selected time period."
        />
      </div>
    )
  }

  // Find top and bottom performers
  const sorted = [...categories].sort((a, b) => {
    if (sortBy === 'engagementRate') {
      return (b.averageEngagementRate || 0) - (a.averageEngagementRate || 0)
    }
    return b[sortBy] - a[sortBy]
  })

  const topPerformer = sorted[0]
  const bottomPerformer = sorted[sorted.length - 1]

  return (
    <div className="category-breakdown-container">
      <h2 className="section-title">Category Performance Breakdown</h2>

      {/* Top and Bottom Performers */}
      <div className="performers-grid">
        <div className="performer-card top">
          <div className="performer-label">Top Performer</div>
          <div className="performer-name">{topPerformer?.category}</div>
          <div className="performer-metric">
            {(topPerformer?.averageEngagementRate || 0).toFixed(1)}% engagement rate
          </div>
        </div>
        <div className="performer-card bottom">
          <div className="performer-label">Lowest Performer</div>
          <div className="performer-name">{bottomPerformer?.category}</div>
          <div className="performer-metric">
            {(bottomPerformer?.averageEngagementRate || 0).toFixed(1)}% engagement rate
          </div>
        </div>
      </div>

      {/* Category Table */}
      <div className="category-table-wrapper">
        <div className="table-controls">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort categories by"
          >
            <option value="engagementRate">Engagement Rate</option>
            <option value="tipCount">Tip Count</option>
            <option value="totalViews">Total Views</option>
            <option value="totalEngagements">Total Engagements</option>
          </select>
        </div>

        <table className="category-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Tip Count</th>
              <th>Total Views</th>
              <th>Total Engagements</th>
              <th>Avg Engagement Rate</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((category) => (
              <tr
                key={category.category}
                onClick={() => handleCategoryChange(category.category)}
                role="button"
                tabIndex={0}
                className={`category-row ${selectedCategory === category.category ? 'selected' : ''}`}
              >
                <td className="category-name">
                  {category.category}
                  {category.category === topPerformer?.category && (
                    <span className="badge badge-success">Top</span>
                  )}
                  {category.category === bottomPerformer?.category && (
                    <span className="badge badge-warning">Low</span>
                  )}
                </td>
                <td className="cell-number">{category.tipCount}</td>
                <td className="cell-number">{category.totalViews.toLocaleString()}</td>
                <td className="cell-number">{category.totalEngagements.toLocaleString()}</td>
                <td className="cell-number">
                  {(category.averageEngagementRate || 0).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
