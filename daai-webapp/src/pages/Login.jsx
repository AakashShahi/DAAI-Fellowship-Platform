import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../hooks/useLogin'

export default function Login() {
  const navigate = useNavigate()
  const { login, error, isLoading } = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      await login({ email, password })
      navigate('/')
    } catch {
      // Error state is handled by useLogin.
    }
  }

  return (
    <main className="login-page">
      <section className="auth-shell">
        <div className="auth-brand-panel" aria-label="DAAI Fellowship">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">
              D
            </span>
            <span>
              <strong>DAAI</strong>
              <small>Fellowship</small>
            </span>
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to continue managing the fellowship platform.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <h2>Login</h2>
            <p>Use your DAAI account credentials.</p>
          </div>

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error ? <p className="login-error">{error}</p> : null}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </section>
    </main>
  )
}
