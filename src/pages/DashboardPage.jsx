import { useState, useEffect } from 'react'
import { authFetch } from '../context/AuthContext'
import { API_BASE } from '../config/api'
import { useSite } from '../context/SiteContext'
import { siteUrl } from '../utils/siteApi'
import { formatRelative } from '../utils/formatDate'

const API = `${API_BASE}/api`

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { activeSite, sites } = useSite()

  useEffect(() => {
    async function load() {
      try {
        const sid = activeSite?.id
        const [projects, social, health, notifications] = await Promise.all([
          authFetch(siteUrl('/pt/projects', sid)).then(r => r.ok ? r.json() : []),
          authFetch(siteUrl('/social/analytics', sid)).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`${API}/health`).then(r => r.ok ? r.json() : null).catch(() => null),
          authFetch(`${API}/notifications?owner=Eric`).then(r => r.ok ? r.json() : []).catch(() => []),
        ])

        const allProjects = Array.isArray(projects) ? projects : []
        const activeProjects = allProjects.filter(p => p.status === 'Active')
        const totalTasks = allProjects.reduce((s, p) => s + Number(p.task_count || 0), 0)
        const doneTasks = allProjects.reduce((s, p) => s + Number(p.done_count || 0), 0)

        setData({
          projects: allProjects.length,
          activeProjects: activeProjects.length,
          totalTasks,
          doneTasks,
          openTasks: totalTasks - doneTasks,
          socialPosts: social?.posts?.total || 0,
          socialPublished: social?.posts?.published || 0,
          socialAccounts: social?.accounts?.filter(a => a.is_active)?.length || 0,
          dbHealth: health?.ok ? 'Healthy' : 'Unknown',
          dbActive: health?.totalActive || 0,
          dbLimit: health?.totalLimit || 0,
          recentActivity: Array.isArray(notifications) ? notifications.slice(0, 8) : [],
          topProjects: activeProjects.slice(0, 5),
        })
      } catch {}
      setLoading(false)
    }
    load()
  }, [activeSite?.id])

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading dashboard...</div>
  if (!data) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Could not load dashboard data.</div>

  return (
    <div>
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
          {activeSite?.icon} {activeSite?.name || 'Dashboard'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {activeSite?.domain || 'Overview of all managed systems'}
          {sites.length > 1 && <span style={{ marginLeft: '0.5rem' }}>· {sites.length} sites managed</span>}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: 'var(--sp-6)' }}>
        <div className="kpi-card">
          <div className="kpi-accent" style={{ background: 'var(--blue)' }} />
          <div className="kpi-content">
            <span className="kpi-value">{data.activeProjects}</span>
            <span className="kpi-label">Active Projects</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-accent" style={{ background: 'var(--orange)' }} />
          <div className="kpi-content">
            <span className="kpi-value">{data.openTasks}</span>
            <span className="kpi-label">Open Tasks</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-accent" style={{ background: 'var(--green)' }} />
          <div className="kpi-content">
            <span className="kpi-value">{data.doneTasks}/{data.totalTasks}</span>
            <span className="kpi-label">Tasks Done</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-accent" style={{ background: 'var(--purple)' }} />
          <div className="kpi-content">
            <span className="kpi-value">{data.socialPublished}</span>
            <span className="kpi-label">Posts Published</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-accent" style={{ background: 'var(--green)' }} />
          <div className="kpi-content">
            <span className="kpi-value">{data.socialAccounts}</span>
            <span className="kpi-label">Social Accounts</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-accent" style={{ background: data.dbHealth === 'Healthy' ? 'var(--green)' : 'var(--red)' }} />
          <div className="kpi-content">
            <span className="kpi-value">{data.dbHealth}</span>
            <span className="kpi-label">System ({data.dbActive}/{data.dbLimit} conn)</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
        {/* Active Projects */}
        <div className="opp-section">
          <div className="opp-header"><h3>📋 Active Projects</h3></div>
          {data.topProjects.length === 0 ? (
            <p style={{ padding: 'var(--sp-3)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active projects.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {data.topProjects.map(p => {
                const total = Number(p.task_count || 0)
                const done = Number(p.done_count || 0)
                const pct = total ? Math.round((done / total) * 100) : 0
                return (
                  <div key={p.id} style={{ padding: 'var(--sp-3) var(--sp-4)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginRight: '0.3rem' }}>#{p.id}</span>{p.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{done}/{total} tasks · {p.shirt_size}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                      <div style={{ width: 60, height: 6, background: 'var(--gray-100)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green)', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 30 }}>{pct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="opp-section">
          <div className="opp-header"><h3>🔔 Recent Activity</h3></div>
          {data.recentActivity.length === 0 ? (
            <p style={{ padding: 'var(--sp-3)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent activity.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {data.recentActivity.map(n => (
                <div key={n.id} style={{ padding: 'var(--sp-2) var(--sp-4)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.82rem' }}>{n.message}</div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 'var(--sp-2)' }}>{formatRelative(n.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
