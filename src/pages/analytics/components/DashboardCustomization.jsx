import { useState } from 'react'

const WIDGET_LABELS = {
  kpiCards: 'KPI Cards',
  performanceTable: 'Performance Table',
  trendsChart: 'Engagement Trends',
  segmentAnalytics: 'Audience Segments',
  categoryBreakdown: 'Category Performance',
  lifecycleAnalytics: 'Content Lifecycle',
  pinnedFeaturedAnalytics: 'Pinned & Featured',
  auditLogAnalytics: 'Audit Log',
}

export default function DashboardCustomization({
  visibleWidgets,
  onWidgetVisibilityChange,
  onResetLayout,
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="customization-container">
      <button
        className="btn btn-secondary"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open dashboard customization"
        aria-expanded={isOpen}
      >
        ⚙️ Customize
      </button>

      {isOpen && (
        <div className="customization-panel">
          <div className="customization-header">
            <h3>Dashboard Customization</h3>
            <button
              className="close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close customization panel"
            >
              ✕
            </button>
          </div>

          <div className="customization-content">
            <div className="widget-list">
              {Object.entries(WIDGET_LABELS).map(([key, label]) => (
                <div key={key} className="widget-toggle">
                  <label htmlFor={`widget-${key}`}>
                    <input
                      id={`widget-${key}`}
                      type="checkbox"
                      checked={visibleWidgets[key] || false}
                      onChange={(e) =>
                        onWidgetVisibilityChange?.(key, e.target.checked)
                      }
                      aria-label={`Toggle ${label} visibility`}
                    />
                    <span>{label}</span>
                  </label>
                </div>
              ))}
            </div>

            <div className="customization-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  onResetLayout?.()
                  setIsOpen(false)
                }}
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
