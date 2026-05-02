import { useState } from 'react'
import { SkeletonTable } from '../../../components/Skeleton'
import EmptyState from '../../../components/EmptyState'

export default function AuditLogAnalytics({
  data,
  isLoading,
  filters,
  onFilterChange,
}) {
  const [expandedUser, setExpandedUser] = useState(null)

  if (isLoading && !data) {
    return (
      <div className="audit-log-container">
        <h2 className="section-title">Audit Log Analytics</h2>
        <SkeletonTable rows={8} cols={3} />
      </div>
    )
  }

  const auditData = data || {}
  const actionsByType = auditData.actionsByType || {}
  const actionsByUser = auditData.actionsByUser || []
  const recentActions = auditData.recentActions || []

  if (!auditData.totalActions) {
    return (
      <div className="audit-log-container">
        <h2 className="section-title">Audit Log Analytics</h2>
        <EmptyState
          icon="📋"
          title="No audit data"
          message="No content management actions found for the selected time period."
        />
      </div>
    )
  }

  return (
    <div className="audit-log-container">
      <h2 className="section-title">Audit Log Analytics</h2>

      {/* Summary Stats */}
      <div className="audit-summary">
        <div className="audit-stat">
          <div className="stat-label">Total Actions</div>
          <div className="stat-value">{auditData.totalActions || 0}</div>
        </div>
      </div>

      {/* Actions by Type */}
      <div className="audit-section">
        <h3>Actions by Type</h3>
        <div className="action-types-grid">
          {Object.entries(actionsByType).map(([action, count]) => (
            <div key={action} className="action-type-card">
              <div className="action-type-label">{action}</div>
              <div className="action-type-count">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Most Active Content Managers */}
      <div className="audit-section">
        <h3>Most Active Content Managers</h3>
        <div className="managers-list">
          {actionsByUser.slice(0, 10).map((user) => (
            <div key={user.user} className="manager-item">
              <div className="manager-header">
                <button
                  className="manager-name"
                  onClick={() =>
                    setExpandedUser(expandedUser === user.user ? null : user.user)
                  }
                  aria-expanded={expandedUser === user.user}
                >
                  {user.user}
                  <span className="expand-icon">
                    {expandedUser === user.user ? '▼' : '▶'}
                  </span>
                </button>
                <span className="manager-count">{user.actionCount} actions</span>
              </div>

              {expandedUser === user.user && (
                <div className="manager-details">
                  <div className="action-breakdown">
                    {Object.entries(user.actions || {}).map(([action, count]) => (
                      <div key={action} className="action-item">
                        <span className="action-name">{action}</span>
                        <span className="action-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Actions Timeline */}
      <div className="audit-section">
        <h3>Recent Actions</h3>
        <div className="recent-actions-list">
          {recentActions.slice(0, 20).map((action, i) => (
            <div key={i} className="action-timeline-item">
              <div className="action-time">
                {new Date(action.createdAt).toLocaleString()}
              </div>
              <div className="action-details">
                <span className="action-user">{action.changedBy}</span>
                <span className="action-verb">{action.action}</span>
                <span className="action-entity">
                  {action.entityType} #{action.entityId}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
