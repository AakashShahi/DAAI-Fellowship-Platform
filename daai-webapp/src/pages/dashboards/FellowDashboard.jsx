import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const fellowActions = [
  {
    title: 'Take Quizzes',
    description: 'Practice QA, Salesforce, and AWS quiz categories.',
    to: '/quizzes',
    cta: 'Start quiz',
    status: 'Available',
  },
  {
    title: 'View Quiz Attempts / Results',
    description: 'Review quiz results after completing an attempt.',
    to: '/quizzes/attempts',
    cta: 'Review results',
    status: 'Available',
  },
  {
    title: 'Learning Progress',
    description: 'Track your fellowship learning milestones.',
    to: '/fellow/dashboard',
    cta: 'Coming soon',
    status: 'Soon',
  },
  {
    title: 'Opportunities',
    description: 'Explore fellowship opportunities and next steps.',
    to: '/fellow/dashboard',
    cta: 'Coming soon',
    status: 'Soon',
  },
]

export default function FellowDashboard() {
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

      <section className="fellow-dashboard">
        <div className="fellow-hero">
          <div>
            <p className="eyebrow">Fellow Dashboard</p>
            <h1>Welcome back, {user?.full_name ?? 'Fellow'}</h1>
            <p>
              Continue your quizzes, review progress, and keep your fellowship
              profile ready for upcoming opportunities.
            </p>
          </div>
          <div className="fellow-profile-summary">
            <span className="fellow-avatar" aria-hidden="true">
              {(user?.full_name || user?.email || 'F').charAt(0)}
            </span>
            <div>
              <strong>{user?.full_name ?? 'Fellow Profile'}</strong>
              <span>{user?.email ?? 'Signed in'}</span>
              <em>{user?.role ?? 'FELLOW'}</em>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          {fellowActions.map((action) => (
            <Link key={action.title} className="dashboard-action-card" to={action.to}>
              <div>
                <span>{action.title}</span>
                <p>{action.description}</p>
              </div>
              <div className="dashboard-card-footer">
                <small>{action.status}</small>
                <strong>{action.cta}</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
