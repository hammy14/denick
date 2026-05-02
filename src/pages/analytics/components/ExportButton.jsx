import { useState } from 'react'
import analyticsApi from '../../../services/analyticsApi'

export default function ExportButton({
  data,
  filters,
  timePeriod,
  dateRange,
}) {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState(null)

  const handleExport = async () => {
    setIsExporting(true)
    setError(null)

    try {
      const exportData = {
        format: 'csv',
        timePeriod,
        startDate: dateRange?.start,
        endDate: dateRange?.end,
        filters,
        data,
      }

      const csv = await analyticsApi.exportData(exportData)

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      const now = new Date()
      const filename = `analytics-export-${now.toISOString().split('T')[0]}.csv`

      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      setError(err.message || 'Failed to export data')
      console.error('Export error:', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="export-button-container">
      <button
        className="btn btn-secondary"
        onClick={handleExport}
        disabled={isExporting}
        aria-label="Export analytics data as CSV"
      >
        {isExporting ? '⏳ Exporting...' : '📥 Export CSV'}
      </button>
      {error && (
        <div className="export-error" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}
