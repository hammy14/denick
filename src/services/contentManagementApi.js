/**
 * Content Management API Service
 * Handles all API calls to the content management backend
 * Tasks: 157, 158, 159, 160, 161
 */

import { API_BASE } from '../config/api'
import { authFetch } from '../context/AuthContext'

const API_BASE_URL = `${API_BASE}/api`

// ============================================================================
// ANNOUNCEMENTS
// ============================================================================

export const announcementsApi = {
  /**
   * Get all announcements with optional filters
   * @param {Object} filters - { search, priority, audience, includeDeleted, includeScheduled, status }
   * @returns {Promise<Array>}
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.priority) params.append('priority', filters.priority)
    if (filters.audience) params.append('audience', filters.audience)
    if (filters.includeDeleted) params.append('includeDeleted', 'true')
    if (filters.includeScheduled) params.append('includeScheduled', 'true')
    if (filters.status) params.append('status', filters.status) // 'active', 'scheduled', 'expired'

    const response = await authFetch(`${API_BASE_URL}/announcements?${params}`)
    if (!response.ok) throw new Error('Failed to fetch announcements')
    return response.json()
  },

  /**
   * Get a single announcement by ID
   * @param {number} id
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    const response = await authFetch(`${API_BASE_URL}/announcements/${id}`)
    if (!response.ok) throw new Error('Failed to fetch announcement')
    return response.json()
  },

  /**
   * Create a new announcement
   * @param {Object} data - { title, body, priority, isPinned, pinDuration, targetAudience, richText, createdBy, startDate, endDate }
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    const response = await authFetch(`${API_BASE_URL}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create announcement')
    return response.json()
  },

  /**
   * Update an announcement
   * @param {number} id
   * @param {Object} data - { title, body, priority, isPinned, pinDuration, targetAudience, richText, updatedBy, startDate, endDate }
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    const response = await authFetch(`${API_BASE_URL}/announcements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update announcement')
    return response.json()
  },

  /**
   * Soft delete an announcement
   * @param {number} id
   * @param {string} deletedBy
   * @returns {Promise<Object>}
   */
  delete: async (id, deletedBy = 'system') => {
    const response = await authFetch(`${API_BASE_URL}/announcements/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deletedBy })
    })
    if (!response.ok) throw new Error('Failed to delete announcement')
    return response.json()
  },

  /**
   * Restore a soft-deleted announcement
   * @param {number} id
   * @param {string} restoredBy
   * @returns {Promise<Object>}
   */
  restore: async (id, restoredBy = 'system') => {
    const response = await authFetch(`${API_BASE_URL}/announcements/${id}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restoredBy })
    })
    if (!response.ok) throw new Error('Failed to restore announcement')
    return response.json()
  }
}

// ============================================================================
// TIPS
// ============================================================================

export const tipsApi = {
  /**
   * Get all tips with optional filters
   * @param {Object} filters - { search, category, difficulty, featured, includeDeleted }
   * @returns {Promise<Array>}
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.category) params.append('category', filters.category)
    if (filters.difficulty) params.append('difficulty', filters.difficulty)
    if (filters.featured) params.append('featured', 'true')
    if (filters.includeDeleted) params.append('includeDeleted', 'true')

    const response = await authFetch(`${API_BASE_URL}/tips?${params}`)
    if (!response.ok) throw new Error('Failed to fetch tips')
    return response.json()
  },

  /**
   * Get a single tip by ID with related tips
   * @param {number} id
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    const response = await authFetch(`${API_BASE_URL}/tips/${id}`)
    if (!response.ok) throw new Error('Failed to fetch tip')
    return response.json()
  },

  /**
   * Create a new tip
   * @param {Object} data - { title, body, category, difficulty, emoji, isFeatured, relatedUrl, createdBy }
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    const response = await authFetch(`${API_BASE_URL}/tips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create tip')
    return response.json()
  },

  /**
   * Update a tip
   * @param {number} id
   * @param {Object} data - { title, body, category, difficulty, emoji, isFeatured, relatedUrl, updatedBy }
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    const response = await authFetch(`${API_BASE_URL}/tips/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update tip')
    return response.json()
  },

  /**
   * Soft delete a tip
   * @param {number} id
   * @param {string} deletedBy
   * @returns {Promise<Object>}
   */
  delete: async (id, deletedBy = 'system') => {
    const response = await authFetch(`${API_BASE_URL}/tips/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deletedBy })
    })
    if (!response.ok) throw new Error('Failed to delete tip')
    return response.json()
  },

  /**
   * Restore a soft-deleted tip
   * @param {number} id
   * @param {string} restoredBy
   * @returns {Promise<Object>}
   */
  restore: async (id, restoredBy = 'system') => {
    const response = await authFetch(`${API_BASE_URL}/tips/${id}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restoredBy })
    })
    if (!response.ok) throw new Error('Failed to restore tip')
    return response.json()
  }
}

// ============================================================================
// RELATED TIPS
// ============================================================================

export const relatedTipsApi = {
  /**
   * Add a related tip
   * @param {number} tipId
   * @param {number} relatedTipId
   * @returns {Promise<Object>}
   */
  add: async (tipId, relatedTipId) => {
    const response = await authFetch(`${API_BASE_URL}/tips/${tipId}/related`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relatedTipId })
    })
    if (!response.ok) throw new Error('Failed to add related tip')
    return response.json()
  },

  /**
   * Remove a related tip
   * @param {number} tipId
   * @param {number} relatedTipId
   * @returns {Promise<Object>}
   */
  remove: async (tipId, relatedTipId) => {
    const response = await authFetch(`${API_BASE_URL}/tips/${tipId}/related/${relatedTipId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to remove related tip')
    return response.json()
  }
}

// ============================================================================
// AUDIT LOG
// ============================================================================

export const auditLogApi = {
  /**
   * Get audit log entries
   * @param {Object} filters - { entityType, entityId, action, limit }
   * @returns {Promise<Array>}
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.entityType) params.append('entityType', filters.entityType)
    if (filters.entityId) params.append('entityId', filters.entityId)
    if (filters.action) params.append('action', filters.action)
    if (filters.limit) params.append('limit', filters.limit)

    const response = await authFetch(`${API_BASE_URL}/audit-log?${params}`)
    if (!response.ok) throw new Error('Failed to fetch audit log')
    return response.json()
  }
}

// ============================================================================
// ARCHIVE
// ============================================================================

export const archiveApi = {
  /**
   * Get archived items
   * @param {Object} filters - { entityType, limit }
   * @returns {Promise<Array>}
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.entityType) params.append('entityType', filters.entityType)
    if (filters.limit) params.append('limit', filters.limit)

    const response = await authFetch(`${API_BASE_URL}/archive?${params}`)
    if (!response.ok) throw new Error('Failed to fetch archive')
    return response.json()
  }
}

// ============================================================================
// ADMIN PERMISSIONS
// ============================================================================

export const adminPermissionsApi = {
  /**
   * Get admin permissions
   * @param {string} adminId
   * @returns {Promise<Object>}
   */
  get: async (adminId) => {
    const response = await authFetch(`${API_BASE_URL}/admin-permissions/${adminId}`)
    if (!response.ok) throw new Error('Failed to fetch admin permissions')
    return response.json()
  },

  /**
   * Update admin permissions
   * @param {string} adminId
   * @param {Object} permissions
   * @returns {Promise<Object>}
   */
  update: async (adminId, permissions) => {
    const response = await authFetch(`${API_BASE_URL}/admin-permissions/${adminId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(permissions)
    })
    if (!response.ok) throw new Error('Failed to update admin permissions')
    return response.json()
  }
}

export default {
  announcements: announcementsApi,
  tips: tipsApi,
  relatedTips: relatedTipsApi,
  auditLog: auditLogApi,
  archive: archiveApi,
  adminPermissions: adminPermissionsApi
}
