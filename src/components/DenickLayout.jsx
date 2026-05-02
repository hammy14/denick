import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSite } from '../context/SiteContext'
import DenickLogo, { DenickIcon } from './DenickLogo'

const ALL_NAV_GROUPS = [
  { label: 'OVERVIEW', sites: 'all', items: [
    { key: 'dashboard', path: '/', label: 'Dashboard', icon: '🏠' },
  ]},
  { label: 'PROJECTS', sites: 'all', items: [
    { key: 'projects', path: '/projects', label: 'Project Tracker', icon: '📋' },
  ]},
  { label: 'CONTENT', sites: [1, 2, 4], items: [
    { key: 'announcements', path: '/content/announcements', label: 'Announcements', icon: '📢' },
    { key: 'tips', path: '/content/tips', label: 'Tips', icon: '💡' },
    { key: 'affiliates', path: '/content/affiliates', label: 'Affiliates', icon: '🔗' },
  ]},
  { label: 'SOCIAL MEDIA', sites: [1, 2, 4], items: [
    { key: 'social-accounts', path: '/social/accounts', label: 'Accounts', icon: '📱' },
    { key: 'social-posts', path: '/social/posts', label: 'Posts', icon: '✍️' },
    { key: 'social-calendar', path: '/social/calendar', label: 'Calendar', icon: '📅' },
    { key: 'social-analytics', path: '/social/analytics', label: 'Analytics', icon: '📊' },
  ]},
  { label: 'PITCH PASSPORT', sites: [4], items: [
    { key: 'pp-leagues', path: '/pp/leagues', label: 'Leagues', icon: '🏆' },
    { key: 'pp-teams', path: '/pp/teams', label: 'Teams', icon: '👕' },
    { key: 'pp-matches', path: '/pp/matches', label: 'Matches', icon: '⚽' },
    { key: 'pp-articles', path: '/pp/articles', label: 'Articles', icon: '📰' },
  ]},
  { label: 'SEO', sites: [1, 2, 4], items: [
    { key: 'seo-research', path: '/seo/research', label: 'Research', icon: '🎯' },
    { key: 'seo-audit', path: '/seo/audit', label: 'Audit', icon: '🔍' },
  ]},
  { label: 'ANALYTICS', sites: [1, 2, 4], items: [
    { key: 'analytics', path: '/analytics', label: 'Content Analytics', icon: '📈' },
  ]},
  { label: 'SITE MANAGEMENT', sites: 'all', items: [
    { key: 'users', path: '/manage/users', label: 'Users', icon: '👥' },
    { key: 'databases', path: '/manage/databases', label: 'Databases', icon: '🗄️' },
    { key: 'login-history', path: '/manage/login-history', label: 'Login History', icon: '🔐' },
    { key: 'permissions', path: '/manage/permissions', label: 'Permissions', icon: '🛡️' },
    { key: 'sites', path: '/manage/sites', label: 'Sites', icon: '🌐' },
    { key: 'data-migration', path: '/manage/data-migration', label: 'Data Migration', icon: '🔄' },
  ]},
]

export default function DenickLayout({ topbarRight, children }) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { sites, activeSite, setActiveSite } = useSite()

  // Filter nav groups based on active site
  const NAV_GROUPS = ALL_NAV_GROUPS.filter(g => g.sites === 'all' || (activeSite && g.sites.includes(activeSite.id)))

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  return (
    <div className="layout">
      <header className="layout-topbar" role="banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <button className="sidebar-collapse-btn hide-mobile" onClick={() => setCollapsed(c => !c)} aria-label={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? '▶' : '◀'}
          </button>
          <button className="sidebar-collapse-btn show-mobile" onClick={() => setMobileOpen(o => !o)} aria-label={mobileOpen ? 'Close' : 'Open'}>
            {mobileOpen ? '✕' : '☰'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DenickLogo size={30} showText={!collapsed} />
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div className="layout-topbar-right" style={{ flexShrink: 0 }}>{topbarRight}</div>
      </header>

      <div className="layout-body">
        {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}

        <nav id="main-sidebar" className={['layout-sidebar', collapsed ? 'layout-sidebar-collapsed' : '', mobileOpen ? 'layout-sidebar-mobile-open' : ''].join(' ')} aria-label="Admin navigation">
          {/* Site Switcher */}
          {!collapsed && sites.length > 0 && (
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>SITE</div>
              <select
                value={activeSite?.id || ''}
                onChange={e => { const s = sites.find(s => String(s.id) === e.target.value); if (s) setActiveSite(s) }}
                style={{ width: '100%', padding: '0.4rem 0.5rem', background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                {sites.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
              </select>
            </div>
          )}
          {collapsed && activeSite && (
            <div style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0', fontSize: '1.2rem' }} title={activeSite.name}>
              {activeSite.icon || '🌐'}
            </div>
          )}
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              {!collapsed && (
                <div style={{ padding: '0.75rem 1rem 0.25rem', fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {group.label}
                </div>
              )}
              {group.items.map(item => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                return (
                  <Link
                    key={item.key}
                    to={item.path}
                    className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                    title={collapsed ? item.label : undefined}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
                    {!collapsed && <span className="sidebar-label">{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <main className="layout-main" id="main-content" tabIndex={-1}>
          {children}
          <footer className="layout-footer" role="contentinfo">
            <div className="layout-footer-text">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DenickIcon size={16} />
                  <span>Denick Admin · {new Date().getFullYear()}</span>
                </div>
                {activeSite && (
                  <span style={{ fontSize: '0.7rem', color: '#6b6b80' }}>Managing: {activeSite.icon} {activeSite.name}</span>
                )}
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
