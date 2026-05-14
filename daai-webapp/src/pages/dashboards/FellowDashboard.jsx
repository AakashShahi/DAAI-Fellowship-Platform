import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardActionCard from '../../components/dashboard/DashboardActionCard'
import DashboardStatCard from '../../components/dashboard/DashboardStatCard'
import TrackProgressCard from '../../components/dashboard/TrackProgressCard'
import {
  getMyQuizAttempts,
  getQuizCategories,
} from '../../services/quizService'
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
    title: 'Quiz Attempts / Results',
    description: 'Review scores, dates, and previous quiz attempts.',
    to: '/quizzes/attempts',
    cta: 'View results',
    status: 'Available',
  },
  {
    title: 'Learning Progress',
    description: 'Track fellowship milestones as learning modules are added.',
    cta: 'Coming soon',
    status: 'Soon',
    disabled: true,
  },
  {
    title: 'Opportunities',
    description: 'Explore fellowship opportunities and next steps.',
    cta: 'Coming soon',
    status: 'Soon',
    disabled: true,
  },
]

const learningTracks = [
  {
    name: 'QA',
    description: 'Practice testing foundations, quality process, and tools.',
  },
  {
    name: 'Salesforce',
    description: 'Build confidence with CRM concepts and platform workflows.',
  },
  {
    name: 'AWS Practitioner',
    description: 'Review core cloud, pricing, support, and security concepts.',
  },
  {
    name: 'AWS Architect',
    description: 'Prepare for architecture patterns and cloud design choices.',
  },
]

const getAttemptPercentage = (attempt) =>
  attempt?.total_questions
    ? Math.round((attempt.score / attempt.total_questions) * 100)
    : 0

export default function FellowDashboard() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [categories, setCategories] = useState([])
  const [attempts, setAttempts] = useState([])
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true)
  const [dashboardError, setDashboardError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadDashboard = async () => {
      try {
        const [categoryData, attemptData] = await Promise.all([
          getQuizCategories(),
          getMyQuizAttempts(),
        ])

        if (isMounted) {
          setCategories(categoryData)
          setAttempts(attemptData)
        }
      } catch {
        if (isMounted) {
          setDashboardError('Unable to load dashboard activity right now.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingDashboard(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const dashboardStats = useMemo(() => {
    const attemptPercentages = attempts.map(getAttemptPercentage)
    const bestScore = attemptPercentages.length
      ? Math.max(...attemptPercentages)
      : 0
    const averageScore = attemptPercentages.length
      ? Math.round(
          attemptPercentages.reduce((total, score) => total + score, 0) /
            attemptPercentages.length,
        )
      : 0

    return [
      {
        label: 'Total Quizzes Available',
        value: categories.length,
        helper: 'Categories ready to practice',
      },
      {
        label: 'Attempts Completed',
        value: attempts.length,
        helper: 'Submitted quiz attempts',
      },
      {
        label: 'Best Score',
        value: `${bestScore}%`,
        helper: attempts.length ? 'Highest result so far' : 'No attempts yet',
      },
      {
        label: 'Average Score',
        value: `${averageScore}%`,
        helper: attempts.length ? 'Across completed attempts' : 'Start to build progress',
      },
    ]
  }, [attempts, categories])

  const latestAttempt = attempts[0]
  const latestPercentage = getAttemptPercentage(latestAttempt)
  // TODO: Replace fallback track progress with backend learning progress data.
  const trackProgress = learningTracks.map((track) => ({
    ...track,
    progress: 0,
  }))
  const recommendedStep = latestAttempt
    ? {
        title: 'Review your latest result',
        description: `Your latest ${latestAttempt.category_title} score was ${latestPercentage}%. Review the result and decide what to practice next.`,
        to: `/quizzes/attempts/${latestAttempt.id}`,
        cta: 'Review result',
      }
    : {
        title: 'Start your first quiz',
        description: 'Begin with a quiz category to create your first progress signal.',
        to: '/quizzes',
        cta: 'Start quiz',
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
              Continue your quiz practice, review recent progress, and keep your
              fellowship profile ready for upcoming opportunities.
            </p>
            <div className="fellow-hero-actions">
              <Link className="secondary-button" to="/quizzes">
                Start Quiz
              </Link>
              <Link className="outline-button" to="/quizzes/attempts">
                View Results
              </Link>
            </div>
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

        {dashboardError ? (
          <p className="dashboard-alert">{dashboardError}</p>
        ) : null}

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <p className="eyebrow">Overview</p>
            <h2>Your quiz progress</h2>
          </div>
          <div className="fellow-stats-grid">
            {dashboardStats.map((stat) => (
              <DashboardStatCard key={stat.label} {...stat} />
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <p className="eyebrow">Next Actions</p>
            <h2>Move your fellowship forward</h2>
          </div>
          <div className="dashboard-actions">
            {fellowActions.map((action) => (
              <DashboardActionCard key={action.title} {...action} />
            ))}
          </div>
        </section>

        <div className="fellow-dashboard-split">
          <section className="dashboard-section">
            <div className="dashboard-section-heading">
              <p className="eyebrow">Learning Track</p>
              <h2>Track readiness</h2>
            </div>
            <div className="track-progress-grid">
              {trackProgress.map((track) => (
                <TrackProgressCard key={track.name} {...track} />
              ))}
            </div>
          </section>

          <aside className="dashboard-side-panel">
            <section className="recommended-card">
              <p className="eyebrow">Recommended</p>
              <h2>{recommendedStep.title}</h2>
              <p>{recommendedStep.description}</p>
              <Link className="secondary-button" to={recommendedStep.to}>
                {recommendedStep.cta}
              </Link>
            </section>

            <section className="recent-activity-card">
              <p className="eyebrow">Recent Activity</p>
              <h2>Latest quiz attempt</h2>
              {isLoadingDashboard ? (
                <p>Loading activity...</p>
              ) : latestAttempt ? (
                <div className="recent-activity-details">
                  <strong>{latestAttempt.category_title}</strong>
                  <span>Score: {latestPercentage}%</span>
                  <span>
                    Last activity:{' '}
                    {new Date(latestAttempt.submitted_at).toLocaleString()}
                  </span>
                  <Link to={`/quizzes/attempts/${latestAttempt.id}`}>
                    Open result
                  </Link>
                </div>
              ) : (
                <p>No quiz attempts yet. Start a quiz to see activity here.</p>
              )}
            </section>
          </aside>
        </div>
      </section>
    </main>
  )
}
