import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useAnalyticsPrefs } from '../../hooks/useAnalyticsPrefs'
import { useAnalyticsKPI } from '../../hooks/useAnalyticsKPI'
import { useContentPerformance } from '../../hooks/useContentPerformance'
import { useEngagementTrends } from '../../hooks/useEngagementTrends'
import { useSegmentAnalytics } from '../../hooks/useSegmentAnalytics'
import { useCategoryPerformance } from '../../hooks/useCategoryPerformance'
import { useLifecycleAnalytics } from '../../hooks/useLifecycleAnalytics'
import { usePinnedFeaturedAnalytics } from '../../hooks/usePinnedFeaturedAnalytics'
import { useAuditLogAnalytics } from '../../hooks/useAuditLogAnalytics'
import KPICards from './components/KPICards'
import ContentPerformanceTable from './components/ContentPerformanceTable'
import EngagementTrendsChart from './components/EngagementTrendsChart'
import AudienceSegmentAnalytics from './components/AudienceSegmentAnalytics'
import CategoryPerformanceBreakdown from './components/CategoryPerformanceBreakdown'
import ContentLifecycleAnalytics from './components/ContentLifecycleAnalytics'
import PinnedFeaturedAnalytics from './components/PinnedFeaturedAnalytics'
import AuditLogAnalytics from './components/AuditLogAnalytics'
import TimePeriodSelector from './components/TimePeriodSelector'
import ExportButton from './components/ExportButton'
import DashboardCustomization from './components/DashboardCustomization'
import RefreshIndicator from './components/RefreshIndicator'
import { parseTimePeriod } from '../../services/analyticsApi'
import './AnalyticsDashboard.css'

const DEFAULT_WIDGETS = {
  kpiCards: true,
  performanceTable: true,
  trendsChart: true,
  segmentAnalytics: true,
  categoryBreakdown: true,
  lifecycleAnalytics: true,
  pinnedFeaturedAnalytics: true,
  auditLogAnalytics: true,
}

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes in milliseconds

export default function AnalyticsDashboard() {
  const { currentUser } = useAuth()
  const { prefs, updatePrefs, setWidgetsVisibility, resetPrefs } = useAnalyticsPrefs()
  
  // State management
  const [timePeriod, setTimePeriod] = useState(prefs?.defaultTimePeriod || 'Last 30 days')
  const [dateRange, setDateRange] = useState(null)
  const [filters, setFilters] = useState({
    contentType: null,
    audienceSegment: null,
    category: null,
  })
  const [visibleWidgets, setVisibleWidgets] = useState(prefs?.dashboardWidgets || DEFAULT_WIDGETS)
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true)
  const [dataDiscrepancy, setDataDiscrepancy] = useState(null)
  const [lastRefreshTime, setLastRefreshTime] = useState(null)

  // Parse time period to get date range
  useEffect(() => {
    const parsed = parseTimePeriod(timePeriod, dateRange?.start, dateRange?.end)
    if (parsed) {
      setDateRange(parsed)
    }
  }, [timePeriod])

  // Fetch data using custom hooks
  const kpiHook = useAnalyticsKPI({
    timePeriod,
    startDate: dateRange?.startDate,
    endDate: dateRange?.endDate,
    autoRefresh: isAutoRefreshEnabled,
    refreshInterval: AUTO_REFRESH_INTERVAL
  })

  const performanceHook = useContentPerformance({
    timePeriod,
    startDate: dateRange?.startDate,
    endDate: dateRange?.endDate,
    contentType: filters.contentType,
    audienceSegment: filters.audienceSegment,
    page: 1,
    pageSize: 20,
    autoRefresh: isAutoRefreshEnabled,
    refreshInterval: AUTO_REFRESH_INTERVAL
  })

  const trendsHook = useEngagementTrends({
    timePeriod,
    startDate: dateRange?.startDate,
    endDate: dateRange?.endDate,
    metric: 'views',
    groupBy: 'day',
    autoRefresh: isAutoRefreshEnabled,
    refreshInterval: AUTO_REFRESH_INTERVAL
  })

  const segmentHook = useSegmentAnalytics({
    timePeriod,
    startDate: dateRange?.startDate,
    endDate: dateRange?.endDate,
    autoRefresh: isAutoRefreshEnabled,
    refreshInterval: AUTO_REFRESH_INTERVAL
  })

  const categoryHook = useCategoryPerformance({
    timePeriod,
    startDate: dateRange?.startDate,
    endDate: dateRange?.endDate,
    autoRefresh: isAutoRefreshEnabled,
    refreshInterval: AUTO_REFRESH_INTERVAL
  })

  const lifecycleHook = useLifecycleAnalytics({
    timePeriod,
    startDate: dateRange?.startDate,
    endDate: dateRange?.endDate,
    autoRefresh: isAutoRefreshEnabled,
    refreshInterval: AUTO_REFRESH_INTERVAL
  })

  const pinnedFeaturedHook = usePinnedFeaturedAnalytics({
    timePeriod,
    startDate: dateRange?.startDate,
    endDate: dateRange?.endDate,
    autoRefresh: isAutoRefreshEnabled,
    refreshInterval: AUTO_REFRESH_INTERVAL
  })

  const auditHook = useAuditLogAnalytics({
    timePeriod,
    startDate: dateRange?.startDate,
    endDate: dateRange?.endDate,
    autoRefresh: isAutoRefreshEnabled,
    refreshInterval: AUTO_REFRESH_INTERVAL
  })

  // Check if any hook has an error
  const hasError = [kpiHook, performanceHook, trendsHook, segmentHook, categoryHook, lifecycleHook, pinnedFeaturedHook, auditHook].some(hook => hook.error)
  const isLoading = [kpiHook, performanceHook, trendsHook, segmentHook, categoryHook, lifecycleHook, pinnedFeaturedHook, auditHook].some(hook => hook.loading)

  // Update last refresh time when any hook refreshes
  useEffect(() => {
    if (kpiHook.lastRefreshTime) {
      setLastRefreshTime(kpiHook.lastRefreshTime)
    }
  }, [kpiHook.lastRefreshTime])

  // Handle time period change
  const handleTimePeriodChange = (period, range) => {
    setTimePeriod(period)
    if (range) {
      setDateRange(range)
    }
    // Persist to user preferences
    updatePrefs({ defaultTimePeriod: period })
  }

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  // Handle widget visibility change
  const handleWidgetVisibilityChange = (widgetKey, isVisible) => {
    const updated = { ...visibleWidgets, [widgetKey]: isVisible }
    setVisibleWidgets(updated)
    // Persist to user preferences
    setWidgetsVisibility(updated)
  }

  // Handle reset to default layout
  const handleResetLayout = () => {
    setVisibleWidgets(DEFAULT_WIDGETS)
    resetPrefs()
  }

  // Handle manual refresh
  const handleManualRefresh = () => {
    kpiHook.refetch()
    performanceHook.refetch()
    trendsHook.refetch()
    segmentHook.refetch()
    categoryHook.refetch()
    lifecycleHook.refetch()
    pinnedFeaturedHook.refetch()
    auditHook.refetch()
  }

  // Handle data reconciliation
  const handleReconciliation = () => {
    setDataDiscrepancy(null)
    handleManualRefresh()
  }

  // Check for permission to view analytics
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'user')) {
    return (
      <div className="analytics-dashboard analytics-no-access">
        <div className="alert alert-error">
          <span>You do not have permission to view the analytics dashboard.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-dashboard">
      {/* Header with controls */}
      <div className="analytics-header">
        <div className="analytics-header-left">
          <h1>Content Analytics Dashboard</h1>
          <p className="text-muted">Track content performance and engagement metrics</p>
        </div>
        <div className="analytics-header-right">
          <TimePeriodSelector
            selectedPeriod={timePeriod}
            onPeriodChange={handleTimePeriodChange}
          />
          <ExportButton
            data={{
              kpi: kpiHook.data,
              performance: performanceHook.data,
              trends: trendsHook.data,
              segments: segmentHook.data,
              categories: categoryHook.data,
              lifecycle: lifecycleHook.data,
              pinnedFeatured: pinnedFeaturedHook.data,
              audit: auditHook.data,
            }}
            filters={filters}
            timePeriod={timePeriod}
            dateRange={dateRange}
          />
          <DashboardCustomization
            visibleWidgets={visibleWidgets}
            onWidgetVisibilityChange={handleWidgetVisibilityChange}
            onResetLayout={handleResetLayout}
          />
          <RefreshIndicator
            isLoading={isLoading}
            lastRefreshTime={lastRefreshTime}
            isAutoRefreshEnabled={isAutoRefreshEnabled}
            onToggleAutoRefresh={setIsAutoRefreshEnabled}
            onManualRefresh={handleManualRefresh}
            error={hasError ? 'Failed to load some analytics data' : null}
            onRetry={handleManualRefresh}
          />
        </div>
      </div>

      {/* Data discrepancy warning */}
      {dataDiscrepancy && (
        <div className="alert alert-warning" role="alert">
          <span>⚠️ Data discrepancy detected. Some metrics may not match source data.</span>
          <button onClick={handleReconciliation} className="btn btn-sm">Reconcile Data</button>
        </div>
      )}

      {/* Error message */}
      {hasError && (
        <div className="alert alert-error" role="alert">
          <span>Failed to load some analytics data. Please try again.</span>
          <button onClick={handleManualRefresh} className="btn btn-sm">Retry</button>
        </div>
      )}

      {/* Dashboard content */}
      <div className="analytics-content">
        {/* KPI Cards */}
        {visibleWidgets.kpiCards && (
          <section className="analytics-section analytics-section-full">
            <KPICards
              data={kpiHook.data}
              isLoading={kpiHook.loading}
              onCardClick={(metric) => {
                // Navigate to detailed view for metric
                console.log('Navigate to detail view for:', metric)
              }}
            />
          </section>
        )}

        {/* Engagement Trends Chart */}
        {visibleWidgets.trendsChart && (
          <section className="analytics-section analytics-section-full">
            <EngagementTrendsChart
              data={trendsHook.data}
              isLoading={trendsHook.loading}
            />
          </section>
        )}

        {/* Content Performance Table */}
        {visibleWidgets.performanceTable && (
          <section className="analytics-section analytics-section-full">
            <ContentPerformanceTable
              data={performanceHook.data}
              isLoading={performanceHook.loading}
              filters={filters}
              onFilterChange={handleFilterChange}
              onRowClick={(item) => {
                // Navigate to detail panel for content item
                console.log('Navigate to detail panel for:', item)
              }}
            />
          </section>
        )}

        {/* Two-column layout for segment and category analytics */}
        <div className="analytics-row">
          {/* Audience Segment Analytics */}
          {visibleWidgets.segmentAnalytics && (
            <section className="analytics-section analytics-section-half">
              <AudienceSegmentAnalytics
                data={segmentHook.data}
                isLoading={segmentHook.loading}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </section>
          )}

          {/* Category Performance Breakdown */}
          {visibleWidgets.categoryBreakdown && (
            <section className="analytics-section analytics-section-half">
              <CategoryPerformanceBreakdown
                data={categoryHook.data}
                isLoading={categoryHook.loading}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </section>
          )}
        </div>

        {/* Two-column layout for lifecycle and pinned/featured analytics */}
        <div className="analytics-row">
          {/* Content Lifecycle Analytics */}
          {visibleWidgets.lifecycleAnalytics && (
            <section className="analytics-section analytics-section-half">
              <ContentLifecycleAnalytics
                data={lifecycleHook.data}
                isLoading={lifecycleHook.loading}
              />
            </section>
          )}

          {/* Pinned/Featured Analytics */}
          {visibleWidgets.pinnedFeaturedAnalytics && (
            <section className="analytics-section analytics-section-half">
              <PinnedFeaturedAnalytics
                data={pinnedFeaturedHook.data}
                isLoading={pinnedFeaturedHook.loading}
              />
            </section>
          )}
        </div>

        {/* Audit Log Analytics */}
        {visibleWidgets.auditLogAnalytics && (
          <section className="analytics-section analytics-section-full">
            <AuditLogAnalytics
              data={auditHook.data}
              isLoading={auditHook.loading}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </section>
        )}
      </div>
    </div>
  )
}
