import { useState } from 'react'
import { technicalSeoAuditConfig } from '../../config/technicalSeoAuditConfig'

const STORAGE_KEY = 'cs_seo_audit'

function loadChecked() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {} }
  catch { return {} }
}

const SEV_COLORS = {
  critical: { bg: 'rgba(229,62,62,0.1)', color: 'var(--red)' },
  high:     { bg: 'rgba(245,158,11,0.1)', color: 'var(--orange)' },
  medium:   { bg: 'rgba(27,42,107,0.1)', color: 'var(--blue)' },
  low:      { bg: 'var(--gray-100)', color: 'var(--text-muted)' },
}

export default function SeoAuditChecklist() {
  const [checked, setChecked] = useState(loadChecked)
  const [expandedCat, setExpandedCat] = useState(null)
  const [tab, setTab] = useState('issues')

  function toggle(id) {
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const { issueCategories, technicalIssues, auditChecklist, bestPractices } = technicalSeoAuditConfig

  // Stats
  const totalIssues = technicalIssues.length
  const resolvedIssues = technicalIssues.filter(i => checked[i.id]).length
  const checklistItems = auditChecklist.flatMap(c => c.items.map((item, j) => `${c.category}_${j}`))
  const resolvedChecklist = checklistItems.filter(id => checked[id]).length
  const bpResolved = bestPractices.filter((_, i) => checked[`bp_${i}`]).length

  return (
    <div className="opp-section">
      <div className="opp-header">
        <h3>🔍 SEO Audit Checklist</h3>
      </div>

      {/* KPI cards */}
      <div className="kpi-grid" style={{ marginBottom: 'var(--sp-6)' }}>
        <div className="kpi-card">
          <div className="kpi-label">Issues Resolved</div>
          <div className="kpi-value">{resolvedIssues}/{totalIssues}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Checklist Done</div>
          <div className="kpi-value">{resolvedChecklist}/{checklistItems.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Best Practices</div>
          <div className="kpi-value">{bpResolved}/{bestPractices.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Overall</div>
          <div className="kpi-value" style={{ color: 'var(--green)' }}>
            {Math.round(((resolvedIssues + resolvedChecklist + bpResolved) / (totalIssues + checklistItems.length + bestPractices.length)) * 100)}%
          </div>
        </div>
      </div>

      {/* Tabs */}
      <nav className="sub-tabs" style={{ marginBottom: 'var(--sp-4)' }}>
        <button className={`sub-tab ${tab === 'issues' ? 'sub-tab-active' : ''}`} onClick={() => setTab('issues')}>Technical Issues ({totalIssues})</button>
        <button className={`sub-tab ${tab === 'checklist' ? 'sub-tab-active' : ''}`} onClick={() => setTab('checklist')}>Audit Checklist ({checklistItems.length})</button>
        <button className={`sub-tab ${tab === 'best' ? 'sub-tab-active' : ''}`} onClick={() => setTab('best')}>Best Practices ({bestPractices.length})</button>
      </nav>

      {/* Technical Issues */}
      {tab === 'issues' && issueCategories.map(cat => {
        const issues = technicalIssues.filter(i => i.category === cat.id)
        const catResolved = issues.filter(i => checked[i.id]).length
        const isOpen = expandedCat === cat.id
        const sev = SEV_COLORS[cat.severity] || SEV_COLORS.low
        return (
          <div key={cat.id} style={{ marginBottom: 'var(--sp-3)' }}>
            <button
              onClick={() => setExpandedCat(isOpen ? null : cat.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--sp-3) var(--sp-4)', background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <span>{isOpen ? '▾' : '▸'}</span>
                <span>{cat.name}</span>
                <span className="badge" style={{ background: sev.bg, color: sev.color, fontSize: '0.7rem' }}>{cat.severity}</span>
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{catResolved}/{issues.length}</span>
            </button>
            {isOpen && (
              <div style={{ padding: 'var(--sp-2) 0' }}>
                {issues.map(issue => (
                  <label key={issue.id} style={{ display: 'flex', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-4)', cursor: 'pointer', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
                    <input type="checkbox" checked={!!checked[issue.id]} onChange={() => toggle(issue.id)} style={{ marginTop: 3 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', textDecoration: checked[issue.id] ? 'line-through' : undefined, opacity: checked[issue.id] ? 0.5 : 1 }}>{issue.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{issue.description}</div>
                      {issue.fix && <div style={{ fontSize: '0.78rem', color: 'var(--green)', marginTop: 2 }}>Fix: {issue.fix}</div>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Audit Checklist */}
      {tab === 'checklist' && auditChecklist.map(cat => (
        <div key={cat.category} style={{ marginBottom: 'var(--sp-4)' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: 'var(--sp-2)', color: 'var(--blue)' }}>{cat.category}</h4>
          {cat.items.map((item, j) => {
            const id = `${cat.category}_${j}`
            return (
              <label key={id} style={{ display: 'flex', gap: 'var(--sp-3)', padding: 'var(--sp-2) var(--sp-4)', cursor: 'pointer', alignItems: 'center' }}>
                <input type="checkbox" checked={!!checked[id]} onChange={() => toggle(id)} />
                <span style={{ fontSize: '0.85rem', textDecoration: checked[id] ? 'line-through' : undefined, opacity: checked[id] ? 0.5 : 1 }}>{item}</span>
              </label>
            )
          })}
        </div>
      ))}

      {/* Best Practices */}
      {tab === 'best' && bestPractices.map((bp, i) => {
        const id = `bp_${i}`
        return (
          <label key={id} style={{ display: 'flex', gap: 'var(--sp-3)', padding: 'var(--sp-2) var(--sp-4)', cursor: 'pointer', alignItems: 'center' }}>
            <input type="checkbox" checked={!!checked[id]} onChange={() => toggle(id)} />
            <span style={{ fontSize: '0.85rem', textDecoration: checked[id] ? 'line-through' : undefined, opacity: checked[id] ? 0.5 : 1 }}>{bp}</span>
          </label>
        )
      })}
    </div>
  )
}
