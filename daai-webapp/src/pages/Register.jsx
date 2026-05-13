import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegister } from '../hooks/useRegister'

export default function Register() {
  const navigate = useNavigate()
  const { register, error, success, isLoading } = useRegister()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setValidationError('')

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setValidationError('All fields are required.')
      return
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.')
      return
    }

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      })

      window.setTimeout(() => {
        navigate('/login')
      }, 900)
    } catch {
      // Error state is handled by useRegister.
    }
  }

  const visibleError = validationError || error

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
          <h1>Join the platform</h1>
          <p>Create a fellow account to begin using the DAAI Fellowship Platform.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <h2>Register</h2>
            <p>Create your DAAI account.</p>
          </div>

          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />

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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />

          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            required
          />

          {visibleError ? <p className="login-error">{visibleError}</p> : null}
          {success ? <p className="auth-success">{success}</p> : null}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Register'}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </section>
    </main>
  )
}
