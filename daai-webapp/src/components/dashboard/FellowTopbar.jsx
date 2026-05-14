import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function FellowTopbar({ selectedTrack }) {
  const logout = useAuthStore((state) => state.logout)
  const coursePath = selectedTrack?.detailPath ?? '/fellow/dashboard'
  const quizPath = selectedTrack?.quizPath ?? '/quizzes'

  return (
    <header className="topbar fellow-topbar">
      <Link className="brand-lockup" to="/fellow/dashboard">
        <span className="brand-mark" aria-hidden="true">
          D
        </span>
        <span>
          <strong>DAAI</strong>
          <small>Fellowship</small>
        </span>
      </Link>

      <nav className="fellow-nav" aria-label="Fellow navigation">
        <Link to="/fellow/dashboard">Dashboard</Link>
        <Link to={coursePath}>My Course</Link>
        <Link to={quizPath}>Quizzes</Link>
        <Link to="/quizzes/attempts">Results</Link>
        <Link to="/profile/settings">Profile</Link>
      </nav>

      <div className="auth-actions">
        <button type="button" className="secondary-button" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  )
}
