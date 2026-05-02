import { useState, useEffect, useCallback, useRef } from 'react'
import { kpiApi } from '../services/analyticsApi'

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * useAnalyticsKPI - Fetch and cache KPI metrics
 * 
 * Handles loading, error, and success states for KPI data.
 * Supports auto-refresh and manual refresh.
 * Caches data to avoid unnecessary API calls.
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.timePeriod - Time period for metrics (e.g., 'Last 30 days')
 * @param {string} options.startDate - Start date for custom range (YYYY-MM-DD)
 * @param {string} options.endDate - End date for custom range (YYYY-MM-DD)
 * @param {boolean} options.autoRefresh - Enable auto-refresh (default: true)
 * @param {number} options.refreshInterval - Refresh interval in ms (default: 5 minutes)
 * 
 * @returns {Object} { data, loading, error, refetch, lastRefreshTime }
 */
export function useAnalyticsKPI(options = {}) {
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

  // Fetch KPI data
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
      const result = await kpiApi.get(timePeriod, startDate, endDate)
      cacheRef.current = { data: result, timestamp: Date.now() }
      setData(result)
      setLastRefreshTime(new Date())
    } catch (err) {
      setError(err.message || 'Failed to fetch KPI data')
      console.error('KPI fetch error:', err)
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
