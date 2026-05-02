export default function PlaceholderPage({ title, phase }) {
  return (
    <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{title}</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Coming in {phase}. This page will be migrated from CardSparky.</p>
    </div>
  )
}
