import { useState } from 'react'
import { SkeletonTable } from '../../../components/Skeleton'
import EmptyState from '../../../components/EmptyState'

const SEGMENTS = ['All', 'Admin', 'User', 'Guest', 'Beginner', 'Intermediate', 'Advanced']

export default function AudienceSegmentAnalytics({
  data,
  isLoading,
  filters,
  onFilterChange,
}) {
  const [selectedSegment, setSelectedSegment] = useState(filters?.audienceSegment || null)

  const handleSegmentChange = (segment) => {
    setSelectedSegment(segment)
    onFilterChange?.({
      ...filters,
      audienceSegment: segment,
    })
  }

  if (isLoading && !data) {
    return (
      <div className="segment-analytics-container">
        <h2 className="section-title">Audience Segment Analytics</h2>
        <SkeletonTable rows={7} cols={4} />
      </div>
    )
  }

  const segments = data?.segments || []

  if (segments.length === 0) {
    return (
      <div className="segment-analytics-container">
        <h2 className="section-title">Audience Segment Analytics</h2>
        <EmptyState
          icon="👥"
          title="No segment data"
          message="No content found for the selected time period."
        />
      </div>
    )
  }

  return (
    <div className="segment-analytics-container">
      <h2 className="section-title">Audience Segment Analytics</h2>

      <div className="segment-selector">
        <label>Filter by segment:</label>
        <div className="segment-buttons">
          <button
            className={`segment-btn ${selectedSegment === null ? 'active' : ''}`}
            onClick={() => handleSegmentChange(null)}
          >
            All Segments
          </button>
          {SEGMENTS.map((segment) => (
            <button
              key={segment}
              className={`segment-btn ${selectedSegment === segment ? 'active' : ''}`}
              onClick={() => handleSegmentChange(segment)}
            >
              {segment}
            </button>
          ))}
        </div>
      </div>

      <div className="segment-table-wrapper">
        <table className="segment-table">
          <thead>
            <tr>
              <th>Segment</th>
              <th>Content Count</th>
              <th>Total Views</th>
              <th>Total Engagements</th>
              <th>Avg Engagement Rate</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((segment) => (
              <tr key={segment.segment}>
                <td className="segment-name">{segment.segment}</td>
                <td className="cell-number">{segment.contentCount}</td>
                <td className="cell-number">{segment.totalViews.toLocaleString()}</td>
                <td className="cell-number">{segment.totalEngagements.toLocaleString()}</td>
                <td className="cell-number">
                  {(segment.averageEngagementRate || 0).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Simple bar chart visualization */}
      <div className="segment-chart">
        <h3 style={{ marginBottom: '1rem' }}>Engagement Rate by Segment</h3>
        <div className="bar-chart">
          {segments.map((segment) => (
            <div key={segment.segment} className="bar-item">
              <div className="bar-label">{segment.segment}</div>
              <div className="bar-container">
                <div
                  className="bar-fill"
                  style={{
                    width: `${Math.min(100, (segment.averageEngagementRate || 0) * 10)}%`,
                  }}
                />
              </div>
              <div className="bar-value">{(segment.averageEngagementRate || 0).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
