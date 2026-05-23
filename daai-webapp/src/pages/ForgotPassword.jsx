import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { requestPasswordReset, resetPassword } from '../services/authService'

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

export default function ForgotPassword() {
  const location = useLocation()
  const initialToken = useMemo(
    () => new URLSearchParams(location.search).get('token') ?? '',
    [location.search],
  )
  const [email, setEmail] = useState('')
  const [token, setToken] = useState(initialToken)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isRequesting, setIsRequesting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const handleRequestReset = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!email.trim()) {
      setError('Enter your account email.')
      return
    }

    setIsRequesting(true)

    try {
      const data = await requestPasswordReset({ email: email.trim() })
      setMessage(data.message)

      if (data.reset_token) {
        setToken(data.reset_token)
      }
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          'Unable to start password reset. Please try again.',
        ),
      )
    } finally {
      setIsRequesting(false)
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!email.trim() || !token.trim() || !newPassword || !confirmPassword) {
      setError('Email, reset token, and new password are required.')
      return
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsResetting(true)

    try {
      const data = await resetPassword({
        email: email.trim(),
        token: token.trim(),
        new_password: newPassword,
      })
      setMessage(data.message)
      setNewPassword('')
      setConfirmPassword('')
    } catch (resetError) {
      setError(
        getErrorMessage(
          resetError,
          'Unable to reset password. Please check your token and try again.',
        ),
      )
    } finally {
      setIsResetting(false)
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
          <h1>Reset access</h1>
          <p>Request a reset token and create a new password for your account.</p>
        </div>

        <div className="login-form">
          <div className="form-heading">
            <h2>Forgot password</h2>
            <p>Use the email connected to your DAAI account.</p>
          </div>

          <form className="auth-stacked-form" onSubmit={handleRequestReset}>
            <label htmlFor="resetEmail">Email</label>
            <input
              id="resetEmail"
              name="resetEmail"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <button type="submit" disabled={isRequesting}>
              {isRequesting ? 'Sending...' : 'Request reset token'}
            </button>
          </form>

          <form className="auth-stacked-form auth-reset-form" onSubmit={handleResetPassword}>
            <label htmlFor="resetToken">Reset token</label>
            <input
              id="resetToken"
              name="resetToken"
              type="text"
              autoComplete="one-time-code"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              required
            />

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

            <button type="submit" disabled={isResetting}>
              {isResetting ? 'Resetting...' : 'Reset password'}
            </button>
          </form>

          {error ? <p className="login-error">{error}</p> : null}
          {message ? <p className="auth-success">{message}</p> : null}

          <p className="auth-switch">
            Remembered your password? <Link to="/login">Login</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
