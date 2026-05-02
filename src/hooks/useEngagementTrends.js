import { useState, useEffect, useCallback, useRef } from 'react'
import { engagementTrendsApi } from '../services/analyticsApi'

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * useEngagementTrends - Fetch and cache engagement trends data
 * 
 * Handles loading, error, and success states for engagement trends.
 * Supports metric selection and time grouping.
 * Caches data to avoid unnecessary API calls.
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.timePeriod - Time period for metrics
 * @param {string} options.startDate - Start date for custom range
 * @param {string} options.endDate - End date for custom range
 * @param {string} options.metric - Metric to display (views/engagements/engagement_rate)
 * @param {string} options.groupBy - Time grouping (day/week/month)
 * @param {boolean} options.autoRefresh - Enable auto-refresh (default: true)
 * @param {number} options.refreshInterval - Refresh interval in ms
 * 
 * @returns {Object} { data, loading, error, refetch, lastRefreshTime }
 */
export function useEngagementTrends(options = {}) {
  const {
    timePeriod = 'Last 30 days',
    startDate = null,
    endDate = null,
    metric = 'views',
    groupBy = 'day',
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000
  } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastRefreshTime, setLastRefreshTime] = useState(null)

  const cacheRef = useRef({ data: null, timestamp: null, key: null })
  const refreshTimeoutRef = useRef(null)

  // Generate cache key from parameters
  const getCacheKey = useCallback(() => {
    return JSON.stringify({
      timePeriod,
      startDate,
      endDate,
      metric,
      groupBy
    })
  }, [timePeriod, startDate, endDate, metric, groupBy])

  // Check if cache is still valid
  const isCacheValid = useCallback(() => {
    const currentKey = getCacheKey()
    if (!cacheRef.current.data || !cacheRef.current.timestamp || cacheRef.current.key !== currentKey) {
      return false
    }
    return Date.now() - cacheRef.current.timestamp < CACHE_TTL
  }, [getCacheKey])

  // Fetch engagement trends data
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
      const result = await engagementTrendsApi.get({
        timePeriod,
        startDate,
        endDate,
        metric,
        groupBy
      })
      cacheRef.current = { data: result, timestamp: Date.now(), key: getCacheKey() }
      setData(result)
      setLastRefreshTime(new Date())
    } catch (err) {
      setError(err.message || 'Failed to fetch engagement trends')
      console.error('Engagement trends fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [timePeriod, startDate, endDate, metric, groupBy, isCacheValid, getCacheKey])

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
