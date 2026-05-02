import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authFetch } from './AuthContext'
import { API_BASE } from '../config/api'

const SiteContext = createContext(null)
const SITE_KEY = 'denick_active_site'

function loadCached() {
  try { return JSON.parse(localStorage.getItem(SITE_KEY)) ?? null }
  catch { return null }
}

export function SiteProvider({ children }) {
  const [sites, setSites] = useState([])
  const [activeSite, setActiveSiteRaw] = useState(loadCached)

  const loadSites = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/sites`)
      if (!res.ok) return
      const data = await res.json()
      const list = Array.isArray(data) ? data : []
      setSites(list)
      // If nothing cached or cached site gone, pick first
      const cached = loadCached()
      if (list.length && (!cached || !list.find(s => s.id === cached.id))) {
        setActiveSite(list[0])
      } else if (cached) {
        // Refresh cached data with latest from server
        const fresh = list.find(s => s.id === cached.id)
        if (fresh) setActiveSite(fresh)
      }
    } catch {}
  }, [])

  function setActiveSite(site) {
    setActiveSiteRaw(site)
    localStorage.setItem(SITE_KEY, JSON.stringify(site))
  }

  return (
    <SiteContext.Provider value={{ sites, activeSite, setActiveSite, loadSites }}>
      {children}
    </SiteContext.Provider>
  )
}

export function useSite() {
  return useContext(SiteContext)
}
