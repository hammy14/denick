import { SkeletonTable } from '../../../components/Skeleton'

export default function ContentLifecycleAnalytics({ data, isLoading }) {
  if (isLoading && !data) {
    return (
      <div className="lifecycle-container">
        <h2 className="section-title">Content Lifecycle Analytics</h2>
        <SkeletonTable rows={4} cols={2} />
      </div>
    )
  }

  const lifecycleData = data || {}

  return (
    <div className="lifecycle-container">
      <h2 className="section-title">Content Lifecycle Analytics</h2>

      {/* Summary Cards */}
      <div className="lifecycle-summary">
        <div className="lifecycle-card">
          <div className="lifecycle-label">Active Content</div>
          <div className="lifecycle-value">{lifecycleData.activeCount || 0}</div>
          <div className="lifecycle-icon">📝</div>
        </div>
        <div className="lifecycle-card">
          <div className="lifecycle-label">Archived Content</div>
          <div className="lifecycle-value">{lifecycleData.archivedCount || 0}</div>
          <div className="lifecycle-icon">📦</div>
        </div>
        <div className="lifecycle-card">
          <div className="lifecycle-label">Deleted Content</div>
          <div className="lifecycle-value">{lifecycleData.deletedCount || 0}</div>
          <div className="lifecycle-icon">🗑️</div>
        </div>
        <div className="lifecycle-card">
          <div className="lifecycle-label">Avg Lifespan</div>
          <div className="lifecycle-value">
            {lifecycleData.averageLifespan ? `${Math.round(lifecycleData.averageLifespan)} days` : 'N/A'}
          </div>
          <div className="lifecycle-icon">⏱️</div>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="lifecycle-funnel">
        <h3>Content Progression Funnel</h3>
        <div className="funnel-chart">
          <div className="funnel-item" style={{ width: '100%' }}>
            <div className="funnel-bar active" />
            <div className="funnel-label">
              Active: {lifecycleData.activeCount || 0}
            </div>
          </div>
          <div
            className="funnel-item"
            style={{
              width: `${
                lifecycleData.activeCount
                  ? ((lifecycleData.archivedCount || 0) / lifecycleData.activeCount) * 100
                  : 0
              }%`,
            }}
          >
            <div className="funnel-bar archived" />
            <div className="funnel-label">
              Archived: {lifecycleData.archivedCount || 0}
            </div>
          </div>
          <div
            className="funnel-item"
            style={{
              width: `${
                lifecycleData.activeCount
                  ? ((lifecycleData.deletedCount || 0) / lifecycleData.activeCount) * 100
                  : 0
              }%`,
            }}
          >
            <div className="funnel-bar deleted" />
            <div className="funnel-label">
              Deleted: {lifecycleData.deletedCount || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {lifecycleData.timeline && lifecycleData.timeline.length > 0 && (
        <div className="lifecycle-timeline">
          <h3>Content Status Timeline</h3>
          <table className="timeline-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Active</th>
                <th>Archived</th>
                <th>Deleted</th>
              </tr>
            </thead>
            <tbody>
              {lifecycleData.timeline.slice(0, 10).map((item, i) => (
                <tr key={i}>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td className="cell-number">{item.activeCount}</td>
                  <td className="cell-number">{item.archivedCount}</td>
                  <td className="cell-number">{item.deletedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
