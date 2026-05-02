import { useState, useCallback } from 'react'

const ANALYTICS_PREFS_KEY = 'cs_analytics_prefs'

const DEFAULT_PREFS = {
  defaultTimePeriod: 'Last 30 days',
  dashboardWidgets: {
    kpiCards: true,
    performanceTable: true,
    trendsChart: true,
    segmentAnalytics: true,
    categoryBreakdown: true,
    lifecycleAnalytics: true,
    pinnedFeaturedAnalytics: true,
    auditLogAnalytics: true,
  },
  dashboardLayout: {
    order: [1, 2, 3, 4, 5, 6, 7, 8]
  }
}

/**
 * Load preferences from localStorage
 * @param {string} key - Storage key
 * @param {any} fallback - Fallback value if not found
 * @returns {any} Loaded value or fallback
 */
function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

/**
 * Save preferences to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to save
 */
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error('Failed to save preferences:', err)
  }
}

/**
 * useAnalyticsPrefs - Manage analytics dashboard preferences
 * 
 * Persists user preferences for:
 * - Default time period selection
 * - Widget visibility (show/hide)
 * - Dashboard layout order
 * 
 * @returns {Object} { prefs, updatePrefs, resetPrefs }
 */
export function useAnalyticsPrefs() {
  const [prefs, setPrefs] = useState(() => {
    const stored = load(ANALYTICS_PREFS_KEY, null)
    if (!stored) return DEFAULT_PREFS
    
    // Merge with defaults to handle new preferences added in future versions
    return {
      defaultTimePeriod: stored.defaultTimePeriod ?? DEFAULT_PREFS.defaultTimePeriod,
      dashboardWidgets: {
        ...DEFAULT_PREFS.dashboardWidgets,
        ...stored.dashboardWidgets
      },
      dashboardLayout: stored.dashboardLayout ?? DEFAULT_PREFS.dashboardLayout
    }
  })

  /**
   * Update one or more preferences
   * @param {Object} updates - Partial preferences object to update
   */
  const updatePrefs = useCallback((updates) => {
    setPrefs(prev => {
      const updated = { ...prev, ...updates }
      save(ANALYTICS_PREFS_KEY, updated)
      return updated
    })
  }, [])

  /**
   * Update time period preference
   * @param {string} timePeriod - Time period value
   */
  const setTimePeriod = useCallback((timePeriod) => {
    updatePrefs({ defaultTimePeriod: timePeriod })
  }, [updatePrefs])

  /**
   * Update widget visibility
   * @param {string} widgetKey - Widget identifier
   * @param {boolean} isVisible - Whether widget should be visible
   */
  const setWidgetVisibility = useCallback((widgetKey, isVisible) => {
    setPrefs(prev => {
      const updated = {
        ...prev,
        dashboardWidgets: {
          ...prev.dashboardWidgets,
          [widgetKey]: isVisible
        }
      }
      save(ANALYTICS_PREFS_KEY, updated)
      return updated
    })
  }, [])

  /**
   * Update multiple widget visibilities at once
   * @param {Object} widgets - Widget visibility map
   */
  const setWidgetsVisibility = useCallback((widgets) => {
    setPrefs(prev => {
      const updated = {
        ...prev,
        dashboardWidgets: {
          ...prev.dashboardWidgets,
          ...widgets
        }
      }
      save(ANALYTICS_PREFS_KEY, updated)
      return updated
    })
  }, [])

  /**
   * Update dashboard layout order
   * @param {number[]} order - Array of widget order indices
   */
  const setLayoutOrder = useCallback((order) => {
    updatePrefs({
      dashboardLayout: { order }
    })
  }, [updatePrefs])

  /**
   * Reset all preferences to defaults
   */
  const resetPrefs = useCallback(() => {
    setPrefs(DEFAULT_PREFS)
    save(ANALYTICS_PREFS_KEY, DEFAULT_PREFS)
  }, [])

  return {
    prefs,
    updatePrefs,
    setTimePeriod,
    setWidgetVisibility,
    setWidgetsVisibility,
    setLayoutOrder,
    resetPrefs
  }
}
