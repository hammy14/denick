import { useState } from 'react'

const SEED_KEYWORDS = [
  { keyword: 'sports card values', volume: 'High', difficulty: 'High', intent: 'Informational', page: '/learn' },
  { keyword: 'baseball card price guide', volume: 'High', difficulty: 'High', intent: 'Transactional', page: '/research' },
  { keyword: 'how to grade sports cards', volume: 'Medium', difficulty: 'Medium', intent: 'Informational', page: '/learn' },
  { keyword: 'card collecting for beginners', volume: 'Medium', difficulty: 'Low', intent: 'Informational', page: '/learn' },
  { keyword: 'pokemon card value checker', volume: 'High', difficulty: 'High', intent: 'Transactional', page: '/research' },
  { keyword: 'sports card portfolio tracker', volume: 'Medium', difficulty: 'Low', intent: 'Transactional', page: '/my-cards' },
  { keyword: 'rookie card investment', volume: 'Medium', difficulty: 'Medium', intent: 'Informational', page: '/learn' },
  { keyword: 'PSA grading cost', volume: 'High', difficulty: 'Medium', intent: 'Informational', page: '/learn' },
  { keyword: 'card collection management app', volume: 'Low', difficulty: 'Low', intent: 'Transactional', page: '/' },
  { keyword: 'best sports cards to invest in 2025', volume: 'Medium', difficulty: 'Medium', intent: 'Informational', page: '/learn' },
  { keyword: 'football card checklist', volume: 'Medium', difficulty: 'Medium', intent: 'Informational', page: '/research' },
  { keyword: 'how to store trading cards', volume: 'Medium', difficulty: 'Low', intent: 'Informational', page: '/learn' },
  { keyword: 'card show near me', volume: 'High', difficulty: 'High', intent: 'Local', page: '/learn' },
  { keyword: 'basketball card database', volume: 'Low', difficulty: 'Low', intent: 'Transactional', page: '/research' },
  { keyword: 'magic the gathering card prices', volume: 'High', difficulty: 'High', intent: 'Transactional', page: '/research' },
  { keyword: 'yugioh card value lookup', volume: 'High', difficulty: 'High', intent: 'Transactional', page: '/research' },
  { keyword: 'funko pop price guide', volume: 'Medium', difficulty: 'Medium', intent: 'Transactional', page: '/research' },
  { keyword: 'card grading companies comparison', volume: 'Medium', difficulty: 'Medium', intent: 'Informational', page: '/learn' },
  { keyword: 'how to sell sports cards online', volume: 'Medium', difficulty: 'Medium', intent: 'Informational', page: '/learn' },
  { keyword: 'card collection insurance', volume: 'Low', difficulty: 'Low', intent: 'Informational', page: '/learn' },
]

const COMPETITORS = [
  { name: 'PriceCharting', url: 'pricecharting.com', strengths: 'Massive price database, API access, market trends', weaknesses: 'No collection management, no educational content', opportunity: 'CardSparky has collection tracking + education' },
  { name: 'Beckett', url: 'beckett.com', strengths: 'Brand authority, grading service, price guides', weaknesses: 'Expensive subscriptions, dated UI', opportunity: 'Free tier with modern UI' },
  { name: 'COMC', url: 'comc.com', strengths: 'Marketplace + consignment, large inventory', weaknesses: 'No portfolio tracking, no analytics', opportunity: 'Portfolio analytics + research tools' },
  { name: 'TCGPlayer', url: 'tcgplayer.com', strengths: 'Dominant in gaming cards, marketplace', weaknesses: 'Sports cards secondary, no collection tools', opportunity: 'Multi-sport + gaming in one platform' },
  { name: 'CardLadder', url: 'cardladder.com', strengths: 'Investment analytics, market data', weaknesses: 'Paid only, limited sports coverage', opportunity: 'Free research across 23 sports/categories' },
  { name: 'SportCardsPro', url: 'sportcardspro.com', strengths: 'Price tracking, portfolio management', weaknesses: 'Sports only, no gaming/non-sports', opportunity: 'Broader category coverage' },
]

const CONTENT_GAPS = [
  { topic: 'Card Grading Guide (PSA vs BGS vs SGC)', status: 'Covered', page: '/learn', priority: '—' },
  { topic: 'Beginner Collecting Guide', status: 'Covered', page: '/learn', priority: '—' },
  { topic: 'Card Storage & Protection', status: 'Covered', page: '/learn', priority: '—' },
  { topic: 'Investment Strategy Blog Posts', status: 'Missing', page: '—', priority: 'High' },
  { topic: 'Monthly Market Reports', status: 'Missing', page: '—', priority: 'High' },
  { topic: 'Sport-Specific Buying Guides', status: 'Missing', page: '—', priority: 'Medium' },
  { topic: 'Card Authentication Deep Dive', status: 'Covered', page: '/learn', priority: '—' },
  { topic: 'Selling Guide (eBay, COMC, shows)', status: 'Partial', page: '/learn', priority: 'Medium' },
  { topic: 'Set Completion Strategies', status: 'Missing', page: '—', priority: 'Low' },
  { topic: 'Grading ROI Calculator', status: 'Covered', page: '/learn', priority: '—' },
]

const VOL_COLORS = { High: 'var(--green)', Medium: 'var(--orange)', Low: 'var(--text-muted)' }
const DIFF_COLORS = { High: 'var(--red)', Medium: 'var(--orange)', Low: 'var(--green)' }

export default function SeoResearch() {
  const [tab, setTab] = useState('keywords')
  const [kwFilter, setKwFilter] = useState('')

  const filteredKw = SEED_KEYWORDS.filter(k =>
    !kwFilter || k.keyword.toLowerCase().includes(kwFilter.toLowerCase()) || k.intent.toLowerCase().includes(kwFilter.toLowerCase())
  )

  return (
    <div className="opp-section">
      <div className="opp-header">
        <h3>🔍 SEO Research</h3>
      </div>

      <nav className="sub-tabs" style={{ marginBottom: 'var(--sp-4)' }}>
        <button className={`sub-tab ${tab === 'keywords' ? 'sub-tab-active' : ''}`} onClick={() => setTab('keywords')}>Keywords ({SEED_KEYWORDS.length})</button>
        <button className={`sub-tab ${tab === 'competitors' ? 'sub-tab-active' : ''}`} onClick={() => setTab('competitors')}>Competitors ({COMPETITORS.length})</button>
        <button className={`sub-tab ${tab === 'gaps' ? 'sub-tab-active' : ''}`} onClick={() => setTab('gaps')}>Content Gaps ({CONTENT_GAPS.length})</button>
      </nav>

      {tab === 'keywords' && (
        <>
          <div className="opp-toolbar" style={{ marginBottom: 'var(--sp-3)' }}>
            <input className="opp-search" placeholder="Filter keywords..." value={kwFilter} onChange={e => setKwFilter(e.target.value)} />
          </div>
          <div className="opp-table-wrap">
            <table className="opp-table">
              <thead><tr><th>Keyword</th><th>Volume</th><th>Difficulty</th><th>Intent</th><th>Target Page</th></tr></thead>
              <tbody>
                {filteredKw.map(k => (
                  <tr key={k.keyword}>
                    <td style={{ fontWeight: 500 }}>{k.keyword}</td>
                    <td><span style={{ color: VOL_COLORS[k.volume], fontWeight: 600, fontSize: '0.8rem' }}>{k.volume}</span></td>
                    <td><span style={{ color: DIFF_COLORS[k.difficulty], fontWeight: 600, fontSize: '0.8rem' }}>{k.difficulty}</span></td>
                    <td><span className="badge" style={{ background: 'var(--gray-100)', fontSize: '0.75rem' }}>{k.intent}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{k.page}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 'var(--sp-3)' }}>
            💡 Use these seed keywords in SEMrush or Ahrefs to find long-tail variations. Focus on Low difficulty + Medium/High volume first.
          </p>
        </>
      )}

      {tab === 'competitors' && (
        <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
          {COMPETITORS.map(c => (
            <div key={c.name} className="home-card" style={{ padding: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-2)' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{c.name}</h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{c.url}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-3)', fontSize: '0.82rem' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--green)', marginBottom: 2 }}>Strengths</div>
                  <div style={{ color: 'var(--text-muted)' }}>{c.strengths}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--red)', marginBottom: 2 }}>Weaknesses</div>
                  <div style={{ color: 'var(--text-muted)' }}>{c.weaknesses}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--blue)', marginBottom: 2 }}>Our Opportunity</div>
                  <div style={{ color: 'var(--text-muted)' }}>{c.opportunity}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'gaps' && (
        <div className="opp-table-wrap">
          <table className="opp-table">
            <thead><tr><th>Content Topic</th><th>Status</th><th>Page</th><th>Priority</th></tr></thead>
            <tbody>
              {CONTENT_GAPS.map(g => (
                <tr key={g.topic}>
                  <td style={{ fontWeight: 500 }}>{g.topic}</td>
                  <td>
                    <span className="badge" style={{
                      background: g.status === 'Covered' ? 'rgba(3,194,82,0.1)' : g.status === 'Partial' ? 'rgba(245,158,11,0.1)' : 'rgba(229,62,62,0.1)',
                      color: g.status === 'Covered' ? 'var(--green)' : g.status === 'Partial' ? 'var(--orange)' : 'var(--red)',
                    }}>{g.status}</span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{g.page}</td>
                  <td>{g.priority !== '—' ? <span style={{ fontWeight: 600, color: g.priority === 'High' ? 'var(--red)' : g.priority === 'Medium' ? 'var(--orange)' : 'var(--text-muted)', fontSize: '0.8rem' }}>{g.priority}</span> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
