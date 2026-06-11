import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { setPassword } from '../services/authService'

const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return detail[0]?.msg ?? fallback
  }

  return error?.message ?? fallback
}

export default function SetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const token = useMemo(
    () => new URLSearchParams(location.search).get('token') ?? '',
    [location.search],
  )
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSetting, setIsSetting] = useState(false)

  const handleSetPassword = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!token) {
      setError('Invalid or missing token. Please use the link sent to your email.')
      return
    }

    if (!newPassword || !confirmPassword) {
      setError('Please provide a new password and confirm it.')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSetting(true)

    try {
      const data = await setPassword({
        token: token.trim(),
        new_password: newPassword,
      })
      setMessage(data.message)
      setNewPassword('')
      setConfirmPassword('')

      window.setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Unable to set password. Your link might be expired or invalid.',
        ),
      )
    } finally {
      setIsSetting(false)
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
          <h1>Welcome!</h1>
          <p>Please set your password to activate your account and access the platform.</p>
        </div>

        <div className="login-form">
          <div className="form-heading">
            <h2>Set password</h2>
            <p>Create a strong password for your new account.</p>
          </div>

          <form className="auth-stacked-form" onSubmit={handleSetPassword}>
            <label htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
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

            <button type="submit" disabled={isSetting}>
              {isSetting ? 'Setting password...' : 'Set password'}
            </button>
          </form>

          {error ? <p className="login-error">{error}</p> : null}
          {message ? <p className="auth-success">{message}</p> : null}

          <p className="auth-switch">
            Already have an active account? <Link to="/login">Login</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
