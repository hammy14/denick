import { API_BASE } from '../config/api'
import { authFetch } from '../context/AuthContext'

/**
 * Build a URL with optional site_id query param
 */
export function siteUrl(path, siteId) {
  const url = `${API_BASE}/api${path}`
  if (!siteId) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}site_id=${siteId}`
}

/**
 * Fetch with site_id automatically appended
 */
export function siteFetch(path, siteId, options = {}) {
  return authFetch(siteUrl(path, siteId), options)
}
