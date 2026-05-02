/**
 * Analytics API Service
 * Handles all analytics calculations and API calls for the Content Analytics Dashboard
 * Tasks: 2.1, 2.3, 2.4, 2.6, 2.8, 2.10, 2.12, 2.14, 2.16, 2.18, 2.19, 2.20, 2.21
 */

import { API_BASE } from '../config/api'
import { authFetch } from '../context/AuthContext'

const API_BASE_URL = `${API_BASE}/api`

// ============================================================================
// METRIC CALCULATION FUNCTIONS (Task 2.1)
// ============================================================================

/**
 * Calculate percentage change between two values
 * Handles zero-value edge cases
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage change, or 0 if previous is 0
 * **Validates: Requirements 1.2, 9.4**
 */
export function calculatePercentageChange(current, previous) {
  if (previous === 0 || previous === null || previous === undefined) {
    return current === 0 ? 0 : 100
  }
  return ((current - previous) / previous) * 100
}

/**
 * Calculate engagement rate
 * Handles edge cases where views or engagements are 0
 * @param {number} engagements - Total engagement count
 * @param {number} views - Total view count
 * @returns {number} Engagement rate as percentage (0-100)
 * **Validates: Requirements 1.2, 9.4, 6.3**
 */
export function calculateEngagementRate(engagements, views) {
  if (views === 0 || views === null || views === undefined) {
    return 0
  }
  return (engagements / views) * 100
}

/**
 * Calculate average lifespan of content
 * @param {Array} items - Array of content items with created_at and deleted_at/archived_at
 * @returns {number} Average lifespan in days
 * **Validates: Requirements 6.3**
 */
export function calculateAverageLifespan(items) {
  if (!items || items.length === 0) return 0

  const lifespans = items
    .filter(item => item.deleted_at || item.archived_at)
    .map(item => {
      const createdDate = new Date(item.created_at)
      const deletedDate = new Date(item.deleted_at || item.archived_at)
      return Math.floor((deletedDate - createdDate) / (1000 * 60 * 60 * 24))
    })

  if (lifespans.length === 0) return 0
  return Math.round(lifespans.reduce((a, b) => a + b, 0) / lifespans.length)
}

// ============================================================================
// TIME PERIOD FILTERING (Task 2.19)
// ============================================================================

/**
 * Parse time period and return start and end dates
 * @param {string} timePeriod - Predefined period or 'custom'
 * @param {string} startDate - Start date (YYYY-MM-DD) for custom periods
 * @param {string} endDate - End date (YYYY-MM-DD) for custom periods
 * @returns {Object} { startDate, endDate } or null if invalid
 * **Validates: Requirements 9.1, 9.2, 9.3**
 */
export function parseTimePeriod(timePeriod, startDate, endDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let start, end

  switch (timePeriod) {
    case 'Last 7 days':
      end = new Date(today)
      start = new Date(today)
      start.setDate(start.getDate() - 7)
      break
    case 'Last 30 days':
      end = new Date(today)
      start = new Date(today)
      start.setDate(start.getDate() - 30)
      break
    case 'Last 90 days':
      end = new Date(today)
      start = new Date(today)
      start.setDate(start.getDate() - 90)
      break
    case 'Last year':
      end = new Date(today)
      start = new Date(today)
      start.setFullYear(start.getFullYear() - 1)
      break
    case 'custom':
      if (!startDate || !endDate) return null
      start = new Date(startDate)
      end = new Date(endDate)
      break
    default:
      return null
  }

  // Validate date range
  if (end < start) return null

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0]
  }
}

/**
 * Get previous period dates for comparison
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Object} { prevStartDate, prevEndDate }
 */
export function getPreviousPeriod(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const periodLength = Math.floor((end - start) / (1000 * 60 * 60 * 24))

  const prevEnd = new Date(start)
  prevEnd.setDate(prevEnd.getDate() - 1)

  const prevStart = new Date(prevEnd)
  prevStart.setDate(prevStart.getDate() - periodLength)

  return {
    prevStartDate: prevStart.toISOString().split('T')[0],
    prevEndDate: prevEnd.toISOString().split('T')[0]
  }
}

// ============================================================================
// CACHE MANAGEMENT (Task 2.20)
// ============================================================================

/**
 * Generate cache key from parameters
 * @param {string} cacheType - Type of cache (kpi, performance, etc.)
 * @param {Object} params - Parameters to include in key
 * @returns {string} Cache key
 */
export function generateCacheKey(cacheType, params) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('|')
  return `${cacheType}:${sortedParams}`
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * Helper function to get Authorization header with JWT token
 */
function getAuthHeaders() {
  const token = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('cs_token') 
    : null
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

/**
 * GET /api/analytics/kpi
 * Fetch KPI metrics with percentage changes
 * **Validates: Requirements 1.1, 1.3, 11.1**
 */
export const kpiApi = {
  get: async (timePeriod = 'Last 30 days', startDate = null, endDate = null) => {
    const params = new URLSearchParams()
    params.append('timePeriod', timePeriod)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const token = typeof localStorage !== 'undefined' 
      ? localStorage.getItem('cs_token') 
      : null
    const response = await authFetch(`${API_BASE_URL}/analytics/kpi?${params}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
    if (!response.ok) throw new Error('Failed to fetch KPI data')
    return response.json()
  }
}

/**
 * GET /api/analytics/content-performance
 * Fetch content performance metrics with filtering, sorting, and pagination
 * **Validates: Requirements 2.1, 2.2, 2.4, 2.5**
 */
export const contentPerformanceApi = {
  get: async (options = {}) => {
    const {
      timePeriod = 'Last 30 days',
      startDate = null,
      endDate = null,
      contentType = null,
      audienceSegment = null,
      page = 1,
      pageSize = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options

    const params = new URLSearchParams()
    params.append('timePeriod', timePeriod)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (contentType) params.append('contentType', contentType)
    if (audienceSegment) params.append('audienceSegment', audienceSegment)
    params.append('page', page)
    params.append('pageSize', pageSize)
    params.append('sortBy', sortBy)
    params.append('sortOrder', sortOrder)

    const response = await authFetch(`${API_BASE_URL}/analytics/content-performance?${params}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch content performance data')
    return response.json()
  }
}

/**
 * GET /api/analytics/engagement-trends
 * Fetch engagement trends over time with grouping options
 * **Validates: Requirements 3.1, 3.2, 3.4**
 */
export const engagementTrendsApi = {
  get: async (options = {}) => {
    const {
      timePeriod = 'Last 30 days',
      startDate = null,
      endDate = null,
      metric = 'views',
      groupBy = 'day'
    } = options

    const params = new URLSearchParams()
    params.append('timePeriod', timePeriod)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    params.append('metric', metric)
    params.append('groupBy', groupBy)

    const response = await authFetch(`${API_BASE_URL}/analytics/engagement-trends?${params}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch engagement trends')
    return response.json()
  }
}

/**
 * GET /api/analytics/segments
 * Fetch engagement metrics by audience segment
 * **Validates: Requirements 4.1, 4.3, 4.5**
 */
export const segmentsApi = {
  get: async (timePeriod = 'Last 30 days', startDate = null, endDate = null) => {
    const params = new URLSearchParams()
    params.append('timePeriod', timePeriod)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await authFetch(`${API_BASE_URL}/analytics/segments?${params}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch segment analytics')
    return response.json()
  }
}

/**
 * GET /api/analytics/categories
 * Fetch performance metrics by content category
 * **Validates: Requirements 5.1, 5.2, 5.4**
 */
export const categoriesApi = {
  get: async (timePeriod = 'Last 30 days', startDate = null, endDate = null) => {
    const params = new URLSearchParams()
    params.append('timePeriod', timePeriod)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await authFetch(`${API_BASE_URL}/analytics/categories?${params}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch category analytics')
    return response.json()
  }
}

/**
 * GET /api/analytics/lifecycle
 * Fetch content lifecycle metrics
 * **Validates: Requirements 6.1, 6.2, 6.3**
 */
export const lifecycleApi = {
  get: async (timePeriod = 'Last 30 days', startDate = null, endDate = null) => {
    const params = new URLSearchParams()
    params.append('timePeriod', timePeriod)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await authFetch(`${API_BASE_URL}/analytics/lifecycle?${params}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch lifecycle analytics')
    return response.json()
  }
}

/**
 * GET /api/analytics/pinned-featured
 * Fetch metrics for pinned and featured content
 * **Validates: Requirements 7.1, 7.2, 7.3, 7.4**
 */
export const pinnedFeaturedApi = {
  get: async (timePeriod = 'Last 30 days', startDate = null, endDate = null) => {
    const params = new URLSearchParams()
    params.append('timePeriod', timePeriod)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await authFetch(`${API_BASE_URL}/analytics/pinned-featured?${params}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch pinned/featured analytics')
    return response.json()
  }
}

/**
 * GET /api/analytics/audit-summary
 * Fetch audit log analytics and summary
 * **Validates: Requirements 8.1, 8.2, 8.4**
 */
export const auditSummaryApi = {
  get: async (timePeriod = 'Last 30 days', startDate = null, endDate = null) => {
    const params = new URLSearchParams()
    params.append('timePeriod', timePeriod)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await authFetch(`${API_BASE_URL}/analytics/audit-summary?${params}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch audit summary')
    return response.json()
  }
}

/**
 * POST /api/analytics/export
 * Export analytics data in CSV format
 * **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**
 */
export const exportApi = {
  post: async (options = {}) => {
    const {
      format = 'csv',
      timePeriod = 'Last 30 days',
      startDate = null,
      endDate = null,
      filters = {}
    } = options

    const response = await authFetch(`${API_BASE_URL}/analytics/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({
        format,
        timePeriod,
        startDate,
        endDate,
        filters
      })
    })

    if (!response.ok) throw new Error('Failed to export analytics data')
    return response.blob()
  }
}

/**
 * POST /api/analytics/refresh
 * Manually refresh analytics cache
 * **Validates: Requirements 11.1, 11.2, 11.3**
 */
export const refreshApi = {
  post: async () => {
    const response = await authFetch(`${API_BASE_URL}/analytics/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
    })

    if (!response.ok) throw new Error('Failed to refresh analytics cache')
    return response.json()
  }
}

// ============================================================================
// CONVENIENCE WRAPPER METHODS
// ============================================================================

/**
 * Convenience wrapper for KPI data fetching
 */
async function getKPI(options = {}) {
  const { timePeriod = 'Last 30 days', startDate = null, endDate = null } = options
  return kpiApi.get(timePeriod, startDate, endDate)
}

/**
 * Convenience wrapper for content performance data fetching
 */
async function getContentPerformance(options = {}) {
  return contentPerformanceApi.get(options)
}

/**
 * Convenience wrapper for engagement trends data fetching
 */
async function getEngagementTrends(options = {}) {
  return engagementTrendsApi.get(options)
}

/**
 * Convenience wrapper for segment analytics data fetching
 */
async function getSegments(options = {}) {
  const { timePeriod = 'Last 30 days', startDate = null, endDate = null } = options
  return segmentsApi.get(timePeriod, startDate, endDate)
}

/**
 * Convenience wrapper for category analytics data fetching
 */
async function getCategories(options = {}) {
  const { timePeriod = 'Last 30 days', startDate = null, endDate = null } = options
  return categoriesApi.get(timePeriod, startDate, endDate)
}

/**
 * Convenience wrapper for lifecycle analytics data fetching
 */
async function getLifecycle(options = {}) {
  const { timePeriod = 'Last 30 days', startDate = null, endDate = null } = options
  return lifecycleApi.get(timePeriod, startDate, endDate)
}

/**
 * Convenience wrapper for pinned/featured analytics data fetching
 */
async function getPinnedFeatured(options = {}) {
  const { timePeriod = 'Last 30 days', startDate = null, endDate = null } = options
  return pinnedFeaturedApi.get(timePeriod, startDate, endDate)
}

/**
 * Convenience wrapper for audit summary data fetching
 */
async function getAuditSummary(options = {}) {
  const { timePeriod = 'Last 30 days', startDate = null, endDate = null } = options
  return auditSummaryApi.get(timePeriod, startDate, endDate)
}

/**
 * Convenience wrapper for export functionality
 */
async function exportData(options = {}) {
  return exportApi.post(options)
}

/**
 * Convenience wrapper for manual refresh
 */
async function refreshCache() {
  return refreshApi.post()
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Metric calculations
  calculatePercentageChange,
  calculateEngagementRate,
  calculateAverageLifespan,

  // Time period utilities
  parseTimePeriod,
  getPreviousPeriod,

  // Cache utilities
  generateCacheKey,

  // API endpoints
  kpi: kpiApi,
  contentPerformance: contentPerformanceApi,
  engagementTrends: engagementTrendsApi,
  segments: segmentsApi,
  categories: categoriesApi,
  lifecycle: lifecycleApi,
  pinnedFeatured: pinnedFeaturedApi,
  auditSummary: auditSummaryApi,
  export: exportApi,
  refresh: refreshApi,

  // Convenience wrappers
  getKPI,
  getContentPerformance,
  getEngagementTrends,
  getSegments,
  getCategories,
  getLifecycle,
  getPinnedFeatured,
  getAuditSummary,
  exportData,
  refreshCache
}

// Export convenience wrappers for direct import
export {
  getKPI,
  getContentPerformance,
  getEngagementTrends,
  getSegments,
  getCategories,
  getLifecycle,
  getPinnedFeatured,
  getAuditSummary,
  exportData,
  refreshCache
}
