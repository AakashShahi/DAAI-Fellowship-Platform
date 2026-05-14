import { Link } from 'react-router-dom'

export default function UnauthorizedPage() {
  return (
    <main className="app-home">
      <section className="status-panel">
        <p className="eyebrow">Unauthorized</p>
        <h1>Access denied</h1>
        <p>You do not have permission to view this page.</p>
        <Link className="secondary-button" to="/dashboard">
          Back to dashboard
        </Link>
      </section>
    </main>
  )
}
