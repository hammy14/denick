/**
 * Announcement Status Utilities
 * Handles calculation and display of announcement scheduling status
 */

/**
 * Calculate announcement status based on dates
 * @param {Object} announcement - Announcement object with start_date and end_date
 * @returns {string} - 'active', 'scheduled', or 'expired'
 */
export function getAnnouncementStatus(announcement) {
  if (!announcement.start_date && !announcement.end_date) {
    return 'active' // No scheduling = always active
  }

  const now = new Date()
  const startDate = announcement.start_date ? new Date(announcement.start_date) : null
  const endDate = announcement.end_date ? new Date(announcement.end_date) : null

  // Not started yet
  if (startDate && now < startDate) {
    return 'scheduled'
  }

  // Expired
  if (endDate && now > endDate) {
    return 'expired'
  }

  // Active
  return 'active'
}

/**
 * Get status badge color
 * @param {string} status - 'active', 'scheduled', or 'expired'
 * @returns {Object} - { background, color, emoji }
 */
export function getStatusBadgeStyle(status) {
  const styles = {
    active: {
      background: 'rgba(76,175,80,0.1)',
      color: 'var(--green)',
      emoji: '✅'
    },
    scheduled: {
      background: 'rgba(255,152,0,0.1)',
      color: 'var(--orange)',
      emoji: '⏰'
    },
    expired: {
      background: 'rgba(244,67,54,0.1)',
      color: 'var(--red)',
      emoji: '⏱️'
    }
  }
  return styles[status] || styles.active
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
export function formatDate(dateString) {
  if (!dateString) return 'Not set'
  const date = new Date(dateString)
  return date.toLocaleString()
}

/**
 * Format date for input field
 * @param {string} dateString - ISO date string
 * @returns {string} - Date in YYYY-MM-DDTHH:mm format
 */
export function formatDateForInput(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Validate scheduling dates
 * @param {string} startDate - Start date ISO string
 * @param {string} endDate - End date ISO string
 * @returns {Object} - { valid: boolean, error: string }
 */
export function validateSchedulingDates(startDate, endDate) {
  if (!startDate && !endDate) {
    return { valid: true, error: null }
  }

  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end <= start) {
      return { valid: false, error: 'End date must be after start date' }
    }
  }

  return { valid: true, error: null }
}

/**
 * Get status label
 * @param {string} status - 'active', 'scheduled', or 'expired'
 * @returns {string} - Human-readable status
 */
export function getStatusLabel(status) {
  const labels = {
    active: 'Active',
    scheduled: 'Scheduled',
    expired: 'Expired'
  }
  return labels[status] || 'Unknown'
}

/**
 * Get scheduling info text
 * @param {Object} announcement - Announcement object
 * @returns {string} - Human-readable scheduling info
 */
export function getSchedulingInfo(announcement) {
  if (!announcement.start_date && !announcement.end_date) {
    return 'No scheduling'
  }

  let info = ''
  if (announcement.start_date) {
    info += `Starts: ${formatDate(announcement.start_date)}`
  }
  if (announcement.end_date) {
    if (info) info += ' | '
    info += `Ends: ${formatDate(announcement.end_date)}`
  }
  return info
}
