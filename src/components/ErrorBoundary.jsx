import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Log to console — swap for a real logging service (e.g. Sentry) later
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack)
    this.setState({ info })
  }

  handleReset() {
    this.setState({ error: null, info: null })
  }

  render() {
    if (!this.state.error) return this.props.children

    const msg = this.state.error?.message ?? 'Unknown error'

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg, #f8f9fa)',
        padding: '2rem',
      }}>
        <div style={{
          maxWidth: 520,
          width: '100%',
          background: 'var(--card, #fff)',
          border: '1px solid var(--border, #e2e8f0)',
          borderRadius: 12,
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text, #1a202c)' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #718096)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            An unexpected error occurred. You can try reloading the page or returning to the home screen.
          </p>

          <details style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <summary style={{ fontSize: '0.8rem', color: 'var(--text-muted, #718096)', cursor: 'pointer', marginBottom: '0.5rem' }}>
              Error details
            </summary>
            <pre style={{
              fontSize: '0.75rem',
              background: 'var(--gray-50, #f7fafc)',
              border: '1px solid var(--border, #e2e8f0)',
              borderRadius: 6,
              padding: '0.75rem',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: 'var(--red, #e53e3e)',
            }}>
              {msg}
            </pre>
          </details>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={() => this.handleReset()}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: 8,
                border: '1px solid var(--border, #e2e8f0)',
                background: 'var(--card, #fff)',
                color: 'var(--text, #1a202c)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: 8,
                border: 'none',
                background: 'var(--blue, #0271eb)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    )
  }
}
