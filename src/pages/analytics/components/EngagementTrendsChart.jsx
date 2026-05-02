import { useState } from 'react'
import { SkeletonTable } from '../../../components/Skeleton'

const METRICS = ['views', 'engagements', 'engagementRate']
const GROUPING_OPTIONS = ['day', 'week', 'month']

function SimpleLineChart({ data, metric, height = 300 }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>No data available</p>
      </div>
    )
  }

  // Find min and max values for scaling
  const values = data.map((d) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue || 1

  // Calculate SVG dimensions
  const width = 800
  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  // Calculate points for the line
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * chartWidth
    const y = padding + chartHeight - ((d.value - minValue) / range) * chartHeight
    return { x, y, ...d }
  })

  // Create path string
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div className="chart-container">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + chartHeight * (1 - ratio)
          return (
            <line
              key={`grid-${ratio}`}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="var(--border)"
              strokeDasharray="4"
              opacity="0.5"
            />
          )
        })}

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={`point-${i}`}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="var(--brand)"
            className="chart-point"
          />
        ))}

        {/* Axes */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="var(--text-muted)"
          strokeWidth="1"
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="var(--text-muted)"
          strokeWidth="1"
        />
      </svg>
    </div>
  )
}

export default function EngagementTrendsChart({ data, isLoading }) {
  const [selectedMetric, setSelectedMetric] = useState('views')
  const [selectedGrouping, setSelectedGrouping] = useState('day')
  const [hoveredPoint, setHoveredPoint] = useState(null)

  if (isLoading && !data) {
    return (
      <div className="engagement-trends-container">
        <h2 className="section-title">Engagement Trends</h2>
        <SkeletonTable rows={1} cols={1} />
      </div>
    )
  }

  const chartData = data?.data || []

  return (
    <div className="engagement-trends-container">
      <div className="chart-header">
        <h2 className="section-title">Engagement Trends</h2>
        <div className="chart-controls">
          <div className="control-group">
            <label htmlFor="metric-select">Metric:</label>
            <select
              id="metric-select"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              aria-label="Select metric to display"
            >
              {METRICS.map((metric) => (
                <option key={metric} value={metric}>
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="grouping-select">Group by:</label>
            <select
              id="grouping-select"
              value={selectedGrouping}
              onChange={(e) => setSelectedGrouping(e.target.value)}
              aria-label="Select grouping period"
            >
              {GROUPING_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="chart-wrapper">
        <SimpleLineChart data={chartData} metric={selectedMetric} />
      </div>

      {/* Data table as fallback */}
      {chartData.length > 0 && (
        <div className="chart-data-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {chartData.slice(0, 10).map((item, i) => (
                <tr key={i}>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>{item.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {chartData.length > 10 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '1rem' }}>
              Showing 10 of {chartData.length} data points
            </p>
          )}
        </div>
      )}
    </div>
  )
}
