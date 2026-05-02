import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import useLoadingBtn from '../hooks/useLoadingBtn'
import DenickLogo from '../components/DenickLogo'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const [signing, handleSubmit] = useLoadingBtn(async (e) => {
    e.preventDefault()
    const result = await login(email, password)
    if (result.error) setError(result.error)
  })

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <DenickLogo size={44} variant="stacked" />
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>Admin Portal</p>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="text" placeholder="email@example.com" value={email} onChange={e => { setEmail(e.target.value); setError('') }} />
          <label>Password</label>
          <input type="password" placeholder="Password" value={password} onChange={e => { setPassword(e.target.value); setError('') }} />
          {error && <p style={{ color: 'var(--red)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{error}</p>}
          <button type="submit" disabled={signing} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {signing && <span className="btn-spinner" />}
            {signing ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
