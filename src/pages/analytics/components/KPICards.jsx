import { SkeletonKpis } from '../../../components/Skeleton'

function KPICard({ label, value, change, isLoading, onClick, icon }) {
  const isPositive = change >= 0
  const changeColor = isPositive ? 'var(--green)' : 'var(--red)'

  if (isLoading) {
    return <div className="kpi-card skeleton" />
  }

  return (
    <div
      className="kpi-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
      aria-label={`${label}: ${value}, change: ${change}%`}
    >
      <div className="kpi-card-header">
        <h3 className="kpi-card-label">{label}</h3>
        {icon && <span className="kpi-card-icon">{icon}</span>}
      </div>
      <div className="kpi-card-value">{value}</div>
      <div className="kpi-card-change" style={{ color: changeColor }}>
        <span className="change-indicator">
          {isPositive ? '↑' : '↓'}
        </span>
        <span className="change-value">{Math.abs(change).toFixed(1)}%</span>
        <span className="change-label">vs previous period</span>
      </div>
    </div>
  )
}

export default function KPICards({ data, isLoading, onCardClick }) {
  if (isLoading && !data) {
    return (
      <div className="kpi-cards-container">
        <SkeletonKpis count={5} />
      </div>
    )
  }

  const kpis = [
    {
      key: 'announcements',
      label: 'Total Announcements',
      value: data?.totalAnnouncements || 0,
      change: data?.percentageChanges?.announcements || 0,
      icon: '📢',
    },
    {
      key: 'tips',
      label: 'Total Tips',
      value: data?.totalTips || 0,
      change: data?.percentageChanges?.tips || 0,
      icon: '💡',
    },
    {
      key: 'views',
      label: 'Total Views',
      value: (data?.totalViews || 0).toLocaleString(),
      change: data?.percentageChanges?.views || 0,
      icon: '👁️',
    },
    {
      key: 'engagements',
      label: 'Total Engagements',
      value: (data?.totalEngagements || 0).toLocaleString(),
      change: data?.percentageChanges?.engagements || 0,
      icon: '💬',
    },
    {
      key: 'engagementRate',
      label: 'Avg Engagement Rate',
      value: `${(data?.averageEngagementRate || 0).toFixed(1)}%`,
      change: data?.percentageChanges?.engagementRate || 0,
      icon: '📈',
    },
  ]

  return (
    <div className="kpi-cards-container">
      <h2 className="section-title">Key Performance Indicators</h2>
      <div className="kpi-cards-grid">
        {kpis.map((kpi) => (
          <KPICard
            key={kpi.key}
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            isLoading={isLoading}
            icon={kpi.icon}
            onClick={() => onCardClick?.(kpi.key)}
          />
        ))}
      </div>
    </div>
  )
}
