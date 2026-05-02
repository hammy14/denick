import { useState } from 'react'
import { parseTimePeriod } from '../../../services/analyticsApi'

const PREDEFINED_PERIODS = [
  { label: 'Last 7 days', value: 'Last 7 days' },
  { label: 'Last 30 days', value: 'Last 30 days' },
  { label: 'Last 90 days', value: 'Last 90 days' },
  { label: 'Last year', value: 'Last year' },
]

export default function TimePeriodSelector({ selectedPeriod, onPeriodChange }) {
  const [showCustom, setShowCustom] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const handlePredefinedChange = (period) => {
    const range = parseTimePeriod(period)
    onPeriodChange?.(period, range)
    setShowCustom(false)
  }

  const handleCustomChange = () => {
    if (customStart && customEnd) {
      const start = new Date(customStart)
      const end = new Date(customEnd)
      if (start < end) {
        onPeriodChange?.('Custom', { start, end })
      }
    }
  }

  return (
    <div className="time-period-selector">
      <div className="period-buttons">
        {PREDEFINED_PERIODS.map((period) => (
          <button
            key={period.value}
            className={`period-btn ${selectedPeriod === period.value ? 'active' : ''}`}
            onClick={() => handlePredefinedChange(period.value)}
          >
            {period.label}
          </button>
        ))}
        <button
          className={`period-btn ${showCustom ? 'active' : ''}`}
          onClick={() => setShowCustom(!showCustom)}
        >
          Custom
        </button>
      </div>

      {showCustom && (
        <div className="custom-date-picker">
          <div className="date-input-group">
            <label htmlFor="start-date">Start Date:</label>
            <input
              id="start-date"
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              aria-label="Custom start date"
            />
          </div>
          <div className="date-input-group">
            <label htmlFor="end-date">End Date:</label>
            <input
              id="end-date"
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              aria-label="Custom end date"
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleCustomChange}
            disabled={!customStart || !customEnd}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  )
}
