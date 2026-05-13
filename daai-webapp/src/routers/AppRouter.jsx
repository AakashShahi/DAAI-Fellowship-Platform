import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from '../pages/Login'
import useAuthStore from '../store/authStore'

function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

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

        <button type="button" className="secondary-button" onClick={logout}>
          Logout
        </button>
      </header>

      <section className="welcome-panel">
        <p className="eyebrow">Dashboard</p>
        <h1>DAAI Fellowship Platform</h1>
        <p>
          {user?.email
            ? `Signed in as ${user.email}`
            : 'You are signed in and ready to continue.'}
        </p>
      </section>
    </main>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}
