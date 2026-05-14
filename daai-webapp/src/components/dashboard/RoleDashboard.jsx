import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function RoleDashboard({ eyebrow, title, description, children }) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <main className="app-home">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            D
          </span>
          <span>
            <strong>DAAI</strong>
            <small>Fellowship</small>
          </span>
        </div>

        <div className="auth-actions">
          <Link className="secondary-button" to="/profile/settings">
            Profile
          </Link>
          <button type="button" className="secondary-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <section className="welcome-panel">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <p>
          {user?.email
            ? `Signed in as ${user.email}`
            : 'You are signed in and ready to continue.'}
        </p>

        {children}
      </section>
    </main>
  )
}
