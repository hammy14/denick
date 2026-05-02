import { SkeletonTable } from '../../../components/Skeleton'

function ComparisonCard({ label, value, icon }) {
  return (
    <div className="comparison-card">
      <div className="comparison-icon">{icon}</div>
      <div className="comparison-label">{label}</div>
      <div className="comparison-value">{value}</div>
    </div>
  )
}

export default function PinnedFeaturedAnalytics({ data, isLoading }) {
  if (isLoading && !data) {
    return (
      <div className="pinned-featured-container">
        <h2 className="section-title">Pinned & Featured Content Analytics</h2>
        <SkeletonTable rows={4} cols={4} />
      </div>
    )
  }

  const pinnedData = data?.pinnedAnnouncements || {}
  const unpinnedData = data?.unpinnedAnnouncements || {}
  const featuredData = data?.featuredTips || {}
  const unfeaturedData = data?.unfeaturedTips || {}

  return (
    <div className="pinned-featured-container">
      <h2 className="section-title">Pinned & Featured Content Analytics</h2>

      {/* Pinned vs Unpinned Announcements */}
      <div className="comparison-section">
        <h3>Announcements: Pinned vs Unpinned</h3>
        <div className="comparison-grid">
          <div className="comparison-group">
            <h4>📌 Pinned Announcements</h4>
            <div className="metrics-grid">
              <ComparisonCard
                label="Count"
                value={pinnedData.count || 0}
                icon="📊"
              />
              <ComparisonCard
                label="Avg Views"
                value={(pinnedData.averageViews || 0).toLocaleString()}
                icon="👁️"
              />
              <ComparisonCard
                label="Avg Engagement Rate"
                value={`${(pinnedData.averageEngagementRate || 0).toFixed(1)}%`}
                icon="📈"
              />
              <ComparisonCard
                label="Avg Duration"
                value={`${Math.round(pinnedData.averageDuration || 0)} days`}
                icon="⏱️"
              />
            </div>
          </div>

          <div className="comparison-group">
            <h4>📄 Unpinned Announcements</h4>
            <div className="metrics-grid">
              <ComparisonCard
                label="Count"
                value={unpinnedData.count || 0}
                icon="📊"
              />
              <ComparisonCard
                label="Avg Views"
                value={(unpinnedData.averageViews || 0).toLocaleString()}
                icon="👁️"
              />
              <ComparisonCard
                label="Avg Engagement Rate"
                value={`${(unpinnedData.averageEngagementRate || 0).toFixed(1)}%`}
                icon="📈"
              />
              <ComparisonCard
                label="Avg Duration"
                value={`${Math.round(unpinnedData.averageDuration || 0)} days`}
                icon="⏱️"
              />
            </div>
          </div>
        </div>

        {/* Comparison Summary */}
        <div className="comparison-summary">
          <div className="summary-item">
            <span className="summary-label">Views Improvement:</span>
            <span className="summary-value">
              {pinnedData.averageViews && unpinnedData.averageViews
                ? `+${(
                    ((pinnedData.averageViews - unpinnedData.averageViews) /
                      unpinnedData.averageViews) *
                    100
                  ).toFixed(1)}%`
                : 'N/A'}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Engagement Improvement:</span>
            <span className="summary-value">
              {pinnedData.averageEngagementRate && unpinnedData.averageEngagementRate
                ? `+${(
                    ((pinnedData.averageEngagementRate - unpinnedData.averageEngagementRate) /
                      unpinnedData.averageEngagementRate) *
                    100
                  ).toFixed(1)}%`
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Featured vs Unfeatured Tips */}
      <div className="comparison-section">
        <h3>Tips: Featured vs Unfeatured</h3>
        <div className="comparison-grid">
          <div className="comparison-group">
            <h4>⭐ Featured Tips</h4>
            <div className="metrics-grid">
              <ComparisonCard
                label="Count"
                value={featuredData.count || 0}
                icon="📊"
              />
              <ComparisonCard
                label="Avg Views"
                value={(featuredData.averageViews || 0).toLocaleString()}
                icon="👁️"
              />
              <ComparisonCard
                label="Avg Engagement Rate"
                value={`${(featuredData.averageEngagementRate || 0).toFixed(1)}%`}
                icon="📈"
              />
              <ComparisonCard
                label="Avg Duration"
                value={`${Math.round(featuredData.averageDuration || 0)} days`}
                icon="⏱️"
              />
            </div>
          </div>

          <div className="comparison-group">
            <h4>💡 Unfeatured Tips</h4>
            <div className="metrics-grid">
              <ComparisonCard
                label="Count"
                value={unfeaturedData.count || 0}
                icon="📊"
              />
              <ComparisonCard
                label="Avg Views"
                value={(unfeaturedData.averageViews || 0).toLocaleString()}
                icon="👁️"
              />
              <ComparisonCard
                label="Avg Engagement Rate"
                value={`${(unfeaturedData.averageEngagementRate || 0).toFixed(1)}%`}
                icon="📈"
              />
              <ComparisonCard
                label="Avg Duration"
                value={`${Math.round(unfeaturedData.averageDuration || 0)} days`}
                icon="⏱️"
              />
            </div>
          </div>
        </div>

        {/* Comparison Summary */}
        <div className="comparison-summary">
          <div className="summary-item">
            <span className="summary-label">Views Improvement:</span>
            <span className="summary-value">
              {featuredData.averageViews && unfeaturedData.averageViews
                ? `+${(
                    ((featuredData.averageViews - unfeaturedData.averageViews) /
                      unfeaturedData.averageViews) *
                    100
                  ).toFixed(1)}%`
                : 'N/A'}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Engagement Improvement:</span>
            <span className="summary-value">
              {featuredData.averageEngagementRate && unfeaturedData.averageEngagementRate
                ? `+${(
                    ((featuredData.averageEngagementRate - unfeaturedData.averageEngagementRate) /
                      unfeaturedData.averageEngagementRate) *
                    100
                  ).toFixed(1)}%`
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
