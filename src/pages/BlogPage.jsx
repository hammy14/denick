import { useState } from 'react'
import { Link, Routes, Route, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/MainLayout'
import SchemaMarkup from '../../components/SchemaMarkup'
import { SocialShareButtons } from '../../components/SocialShareButtons'
import { articleSchema } from '../../utils/schemaMarkup'
import { formatDate } from '../../utils/formatDate'

const ARTICLES = [
  {
    slug: 'card-collecting-beginners-guide-2025',
    title: 'Card Collecting for Beginners: The Complete 2025 Guide',
    excerpt: 'Everything you need to know to start your card collection — from choosing your first cards to understanding values and storage.',
    category: 'Getting Started',
    date: '2025-06-15',
    readTime: '8 min',
    keywords: ['card collecting for beginners', 'how to start collecting cards', 'sports card beginner guide'],
    content: [
      { heading: 'Why Start Collecting Cards?', body: 'Card collecting has exploded in popularity. Whether you\'re drawn to the nostalgia of baseball cards, the thrill of pulling a rare Pokémon, or the investment potential of rookie cards, there\'s never been a better time to start. The global trading card market is valued at over $13 billion and continues to grow.' },
      { heading: 'Choose Your Focus', body: 'The biggest mistake beginners make is trying to collect everything. Pick one sport or category to start: Baseball, Basketball, Football, Pokémon, or Yu-Gi-Oh are the most popular. Within that, decide if you want to collect a specific team, player, set, or era. Having a focus makes collecting more rewarding and your budget goes further.' },
      { heading: 'Understanding Card Types', body: 'Base cards are the most common and affordable. Parallel cards are variations with different colors or finishes. Insert cards are special cards randomly inserted into packs. Rookie cards (RC) are a player\'s first officially licensed card — these tend to hold the most value. Autograph and memorabilia cards contain real signatures or jersey pieces.' },
      { heading: 'Where to Buy Cards', body: 'Retail stores (Target, Walmart) sell sealed packs at MSRP. Local card shops (LCS) offer singles, packs, and expert advice. Online marketplaces like eBay, COMC, and TCGPlayer have the widest selection. Card shows are great for finding deals and meeting other collectors. Start with singles of cards you actually want rather than ripping packs hoping for hits.' },
      { heading: 'Protecting Your Collection', body: 'Always use penny sleeves and top loaders for valuable cards. Store bulk cards in card boxes. Keep everything away from direct sunlight, humidity, and extreme temperatures. For cards worth $50+, consider professional grading from PSA, BGS, or SGC — a high grade can multiply a card\'s value significantly.' },
      { heading: 'Tracking Your Collection', body: 'Use a collection management tool like CardSparky to track what you own, what you\'ve spent, and what your collection is worth. This helps you make smarter buying decisions and understand your portfolio over time. You can track cards across 23 different sports and categories all in one place.' },
    ],
  },
  {
    slug: 'psa-bgs-sgc-grading-comparison',
    title: 'PSA vs BGS vs SGC: Which Card Grading Company Should You Use?',
    excerpt: 'A detailed comparison of the three major card grading companies — pricing, turnaround times, and which is best for your cards.',
    category: 'Grading',
    date: '2025-06-10',
    readTime: '6 min',
    keywords: ['card grading companies comparison', 'PSA grading cost', 'BGS vs PSA'],
    content: [
      { heading: 'Why Grade Your Cards?', body: 'Professional grading authenticates your card, protects it in a tamper-proof case, and assigns a numerical grade that directly impacts value. A PSA 10 Gem Mint card can be worth 5-20x more than the same card ungraded. Grading also makes cards easier to sell since buyers trust the grade.' },
      { heading: 'PSA (Professional Sports Authenticator)', body: 'PSA is the most recognized grading company with the largest market share. Their 1-10 scale is the industry standard. Pros: highest resale premiums, most trusted brand, largest population reports. Cons: longer turnaround times (often 3-6 months for economy), higher prices ($25-150+ per card depending on tier). Best for: high-value sports cards you plan to sell.' },
      { heading: 'BGS (Beckett Grading Services)', body: 'BGS uses a unique sub-grade system — they grade centering, corners, edges, and surface separately, then give an overall grade. A BGS 9.5 Gem Mint with all four sub-grades at 9.5+ earns the coveted "Quad" label. Pros: sub-grades add transparency, Black Label 10s command huge premiums. Cons: lower resale than PSA for most cards, more complex grading. Best for: modern cards with perfect centering.' },
      { heading: 'SGC (Sportscard Guaranty Corporation)', body: 'SGC has gained significant market share with faster turnaround and competitive pricing. Their tuxedo-style slabs are popular with vintage collectors. Pros: fastest turnaround (often 2-4 weeks), most affordable ($22-30 per card), excellent for vintage. Cons: lower resale premiums than PSA, smaller market share. Best for: vintage cards and budget-conscious grading.' },
      { heading: 'When to Grade', body: 'Only grade cards worth at least 5-10x the grading cost in their current ungraded state. Use CardSparky\'s research tools to check set values before submitting. Cards with visible centering issues, corner dings, or surface scratches are unlikely to get high grades — save your money on those.' },
      { heading: 'The Bottom Line', body: 'For maximum resale value on modern sports cards: PSA. For transparent sub-grades on pristine modern cards: BGS. For vintage cards or fast/affordable grading: SGC. Many serious collectors use all three depending on the card.' },
    ],
  },
  {
    slug: 'sports-card-investment-strategies',
    title: '5 Sports Card Investment Strategies That Actually Work',
    excerpt: 'Proven approaches to building a card portfolio that grows in value — from rookie card investing to set completion.',
    category: 'Investment',
    date: '2025-06-05',
    readTime: '7 min',
    keywords: ['rookie card investment', 'best sports cards to invest in', 'card collecting investment'],
    content: [
      { heading: '1. The Rookie Card Strategy', body: 'Buy rookie cards of promising young players before they break out. Focus on players in their first or second professional season. Look for cards from premium products (Prizm, Optic, Select for basketball/football; Bowman Chrome for baseball). The key is buying before the hype — once a player has a breakout game, prices spike immediately.' },
      { heading: '2. The Graded Gem Strategy', body: 'Buy raw cards in excellent condition, submit them for grading, and sell the PSA 10s or BGS 9.5s at a premium. This works best with cards that have a large price gap between raw and graded. Use CardSparky to compare ungraded vs graded values across sets to find the best ROI opportunities.' },
      { heading: '3. The Set Completion Strategy', body: 'Complete full sets of popular products. Complete sets are worth more than the sum of individual cards because collectors pay a premium for the convenience. Focus on iconic sets: Topps flagship baseball, Panini Prizm basketball, or classic vintage sets. Track your progress with CardSparky\'s research tools.' },
      { heading: '4. The Buy-the-Dip Strategy', body: 'When a player gets injured or has a slump, their card prices drop. If you believe in the player\'s long-term potential, this is a buying opportunity. The same applies to off-season dips — football card prices typically drop in spring, basketball in summer. Track market trends and buy when others are selling.' },
      { heading: '5. The Diversification Strategy', body: 'Don\'t put all your money into one player or sport. Spread across multiple sports, eras, and card types. Include some vintage cards (pre-1980) as a stable store of value, modern rookies for growth potential, and gaming cards (Pokémon, Magic) for category diversification. Use CardSparky\'s portfolio tracking to monitor your allocation.' },
      { heading: 'Risk Management', body: 'Never invest more than you can afford to lose. Card values can drop as quickly as they rise. Keep records of every purchase — cost basis, date, condition. CardSparky tracks all of this automatically. Set a budget and stick to it. The best collectors treat it as a hobby first and an investment second.' },
    ],
  },
]

export { ARTICLES }

function ArticlePage() {
  const { slug } = useParams()
  const article = ARTICLES.find(a => a.slug === slug)

  if (!article) return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Article Not Found</h1>
      <Link to="/blog" className="btn-save" style={{ textDecoration: 'none' }}>← Back to Blog</Link>
    </div>
  )

  const schema = articleSchema({
    title: article.title,
    description: article.excerpt,
    datePublished: article.date,
    url: `${import.meta.env.VITE_BLOG_URL || 'https://cardsparky.com'}/blog/${article.slug}`,
    author: 'CardSparky',
  })

  return (
    <article style={{ maxWidth: 720, margin: '0 auto' }}>
      <SchemaMarkup schema={schema} />
      <Link to="/blog" style={{ fontSize: '0.85rem', color: 'var(--blue)', textDecoration: 'none', display: 'inline-block', marginBottom: 'var(--sp-4)' }}>← Back to Blog</Link>
      <div style={{ marginBottom: 'var(--sp-2)', display: 'flex', gap: 'var(--sp-2)', alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="badge" style={{ background: 'rgba(27,42,107,0.1)', color: 'var(--blue)' }}>{article.category}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(article.date)}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>· {article.readTime} read</span>
      </div>
      <h1 style={{ fontSize: '1.8rem', lineHeight: 1.3, marginBottom: 'var(--sp-4)' }}>{article.title}</h1>
      <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 'var(--sp-6)' }}>{article.excerpt}</p>
      {article.content.map((section, i) => (
        <section key={i} style={{ marginBottom: 'var(--sp-6)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--sp-2)' }}>{section.heading}</h2>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-muted)' }}>{section.body}</p>
        </section>
      ))}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--sp-4)', marginTop: 'var(--sp-6)', display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
        {article.keywords.map(k => (
          <span key={k} className="badge" style={{ background: 'var(--gray-100)', fontSize: '0.75rem' }}>{k}</span>
        ))}
      </div>
      <div style={{ marginTop: 'var(--sp-4)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--border)' }}>
        <SocialShareButtons page="blog" variant="buttons" />
      </div>
      <div style={{ marginTop: 'var(--sp-6)', padding: 'var(--sp-4)', background: 'var(--brand-subtle)', borderRadius: 'var(--radius)' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 'var(--sp-2)' }}>📊 Track Your Collection with CardSparky</h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 'var(--sp-3)' }}>Manage your cards across 23 sports and categories. Track values, costs, and portfolio performance — all free.</p>
        <Link to="/my-cards" className="btn-save" style={{ textDecoration: 'none' }}>Start Tracking →</Link>
      </div>
    </article>
  )
}

function BlogIndex() {
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const categories = [...new Set(ARTICLES.map(a => a.category))]
  let filtered = filter ? ARTICLES.filter(a => a.category === filter) : [...ARTICLES]
  if (search) filtered = filtered.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase()))
  if (sort === 'oldest') filtered.sort((a, b) => a.date.localeCompare(b.date))
  else filtered.sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      <PageHeader title="CardSparky Blog" subtitle="Tips, guides, and strategies for card collectors and investors" />
      <div className="opp-toolbar" style={{ marginBottom: 'var(--sp-3)' }}>
        <input className="opp-search" placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="opp-filter" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)', flexWrap: 'wrap' }}>
        <button className={`sub-tab ${!filter ? 'sub-tab-active' : ''}`} onClick={() => setFilter('')}>All</button>
        {categories.map(c => (
          <button key={c} className={`sub-tab ${filter === c ? 'sub-tab-active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--sp-4)' }}>
        {filtered.map(a => (
          <Link key={a.slug} to={`/blog/${a.slug}`} className="home-card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', padding: 'var(--sp-4)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
              <span className="badge" style={{ background: 'rgba(27,42,107,0.1)', color: 'var(--blue)', fontSize: '0.72rem' }}>{a.category}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.readTime}</span>
            </div>
            <h3 style={{ fontSize: '1rem', lineHeight: 1.4, marginBottom: 'var(--sp-2)' }}>{a.title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>{a.excerpt}</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--blue)', fontWeight: 600, marginTop: 'var(--sp-2)' }}>Read more →</span>
          </Link>
        ))}
      </div>
    </>
  )
}

export default function BlogPage() {
  return (
    <Routes>
      <Route index element={<BlogIndex />} />
      <Route path=":slug" element={<ArticlePage />} />
    </Routes>
  )
}
