import { useEffect, useState } from 'react'

export default function RefreshIndicator({
  isLoading,
  lastRefreshTime,
  isAutoRefreshEnabled,
  onToggleAutoRefresh,
  onManualRefresh,
  error,
  onRetry,
}) {
  const [timeAgo, setTimeAgo] = useState('')

  useEffect(() => {
    if (!lastRefreshTime) return

    const updateTimeAgo = () => {
      const now = new Date()
      const diff = now - lastRefreshTime
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)

      if (seconds < 60) {
        setTimeAgo('just now')
      } else if (minutes < 60) {
        setTimeAgo(`${minutes}m ago`)
      } else if (hours < 24) {
        setTimeAgo(`${hours}h ago`)
      } else {
        setTimeAgo('1d+ ago')
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [lastRefreshTime])

  return (
    <div className="refresh-indicator">
      {error && (
        <div className="refresh-error" role="alert">
          <span className="error-message">{error}</span>
          <button
            className="btn btn-sm"
            onClick={onRetry}
            aria-label="Retry refresh"
          >
            Retry
          </button>
        </div>
      )}

      <div className="refresh-controls">
        <button
          className={`btn btn-secondary ${isLoading ? 'loading' : ''}`}
          onClick={onManualRefresh}
          disabled={isLoading}
          aria-label="Manually refresh data"
        >
          {isLoading ? '⏳ Refreshing...' : '🔄 Refresh'}
        </button>

        <label className="auto-refresh-toggle">
          <input
            type="checkbox"
            checked={isAutoRefreshEnabled}
            onChange={(e) => onToggleAutoRefresh?.(e.target.checked)}
            aria-label="Toggle auto-refresh"
          />
          <span>Auto-refresh</span>
        </label>

        {lastRefreshTime && (
          <div className="last-refresh" aria-live="polite">
            Last updated: {timeAgo}
          </div>
        )}
      </div>
    </div>
  )
}
