import { useState, useEffect, useCallback, useRef } from 'react'
import { auditSummaryApi } from '../services/analyticsApi'

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * useAuditLogAnalytics - Fetch and cache audit log analytics
 * 
 * Handles loading, error, and success states for audit log data.
 * Caches data to avoid unnecessary API calls.
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.timePeriod - Time period for metrics
 * @param {string} options.startDate - Start date for custom range
 * @param {string} options.endDate - End date for custom range
 * @param {boolean} options.autoRefresh - Enable auto-refresh (default: true)
 * @param {number} options.refreshInterval - Refresh interval in ms
 * 
 * @returns {Object} { data, loading, error, refetch, lastRefreshTime }
 */
export function useAuditLogAnalytics(options = {}) {
  const {
    timePeriod = 'Last 30 days',
    startDate = null,
    endDate = null,
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000
  } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastRefreshTime, setLastRefreshTime] = useState(null)

  const cacheRef = useRef({ data: null, timestamp: null })
  const refreshTimeoutRef = useRef(null)

  // Check if cache is still valid
  const isCacheValid = useCallback(() => {
    if (!cacheRef.current.data || !cacheRef.current.timestamp) return false
    return Date.now() - cacheRef.current.timestamp < CACHE_TTL
  }, [])

  // Fetch audit log analytics data
  const fetchData = useCallback(async () => {
    // Return cached data if valid
    if (isCacheValid()) {
      setData(cacheRef.current.data)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await auditSummaryApi.get(timePeriod, startDate, endDate)
      cacheRef.current = { data: result, timestamp: Date.now() }
      setData(result)
      setLastRefreshTime(new Date())
    } catch (err) {
      setError(err.message || 'Failed to fetch audit log analytics')
      console.error('Audit log analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [timePeriod, startDate, endDate, isCacheValid])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return

    refreshTimeoutRef.current = setInterval(() => {
      fetchData()
    }, refreshInterval)

    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current)
      }
    }
  }, [autoRefresh, refreshInterval, fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    lastRefreshTime
  }
}
