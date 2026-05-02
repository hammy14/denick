import { useState, useEffect, useCallback, useRef } from 'react'
import { contentPerformanceApi } from '../services/analyticsApi'

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * useContentPerformance - Fetch and cache content performance metrics
 * 
 * Handles loading, error, and success states for content performance data.
 * Supports filtering, sorting, and pagination.
 * Caches data to avoid unnecessary API calls.
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.timePeriod - Time period for metrics
 * @param {string} options.startDate - Start date for custom range
 * @param {string} options.endDate - End date for custom range
 * @param {string} options.contentType - Filter by content type (announcement/tip)
 * @param {string} options.audienceSegment - Filter by audience segment
 * @param {number} options.page - Current page (default: 1)
 * @param {number} options.pageSize - Items per page (default: 20)
 * @param {string} options.sortBy - Sort column (default: createdAt)
 * @param {string} options.sortOrder - Sort order (asc/desc, default: desc)
 * @param {boolean} options.autoRefresh - Enable auto-refresh (default: true)
 * @param {number} options.refreshInterval - Refresh interval in ms
 * 
 * @returns {Object} { data, loading, error, refetch, lastRefreshTime }
 */
export function useContentPerformance(options = {}) {
  const {
    timePeriod = 'Last 30 days',
    startDate = null,
    endDate = null,
    contentType = null,
    audienceSegment = null,
    page = 1,
    pageSize = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
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
      contentType,
      audienceSegment,
      page,
      pageSize,
      sortBy,
      sortOrder
    })
  }, [timePeriod, startDate, endDate, contentType, audienceSegment, page, pageSize, sortBy, sortOrder])

  // Check if cache is still valid
  const isCacheValid = useCallback(() => {
    const currentKey = getCacheKey()
    if (!cacheRef.current.data || !cacheRef.current.timestamp || cacheRef.current.key !== currentKey) {
      return false
    }
    return Date.now() - cacheRef.current.timestamp < CACHE_TTL
  }, [getCacheKey])

  // Fetch content performance data
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
      const result = await contentPerformanceApi.get({
        timePeriod,
        startDate,
        endDate,
        contentType,
        audienceSegment,
        page,
        pageSize,
        sortBy,
        sortOrder
      })
      cacheRef.current = { data: result, timestamp: Date.now(), key: getCacheKey() }
      setData(result)
      setLastRefreshTime(new Date())
    } catch (err) {
      setError(err.message || 'Failed to fetch content performance data')
      console.error('Content performance fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [timePeriod, startDate, endDate, contentType, audienceSegment, page, pageSize, sortBy, sortOrder, isCacheValid, getCacheKey])

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
