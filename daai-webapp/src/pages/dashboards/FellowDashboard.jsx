import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardActionCard from '../../components/dashboard/DashboardActionCard'
import DashboardStatCard from '../../components/dashboard/DashboardStatCard'
import FellowTopbar from '../../components/dashboard/FellowTopbar'
import SelectedTrackOverview from '../../components/dashboard/SelectedTrackOverview'
import TrackSelectionCard from '../../components/dashboard/TrackSelectionCard'
import { LEARNING_TRACK_OPTIONS, LEARNING_TRACKS } from '../../constants/learningTracks'
import {
  getMyQuizAttempts,
  getQuizCategories,
} from '../../services/quizService'
import { getMyProfile, updateLearningTrack } from '../../services/profileService'
import useAuthStore from '../../store/authStore'
import { getFellowTrack } from '../../utils/learningTrackAccess'

const getAttemptPercentage = (attempt) =>
  attempt?.total_questions
    ? Math.round((attempt.score / attempt.total_questions) * 100)
    : 0

const matchesTrack = (attempt, track) => {
  const categoryText = [
    attempt?.category,
    attempt?.category_title,
  ].filter(Boolean).join(' ').toLowerCase()

  return track.categoryKeywords.some((keyword) =>
    categoryText.includes(keyword.toLowerCase()),
  )
}

const getScoreStats = (attempts) => {
  const scores = attempts.map(getAttemptPercentage)
  const bestScore = scores.length ? Math.max(...scores) : 0
  const averageScore = scores.length
    ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
    : 0

  return { averageScore, bestScore }
}

export default function FellowDashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const [profile, setProfile] = useState(null)
  const [categories, setCategories] = useState([])
  const [attempts, setAttempts] = useState([])
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true)
  const [isSavingTrack, setIsSavingTrack] = useState(false)
  const [dashboardError, setDashboardError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isChangingTrack, setIsChangingTrack] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadDashboard = async () => {
      const [profileResult, categoryResult, attemptResult] =
        await Promise.allSettled([
          getMyProfile(),
          getQuizCategories(),
          getMyQuizAttempts(),
        ])

      if (isMounted) {
        if (profileResult.status === 'fulfilled') {
          setProfile(profileResult.value)
          updateUser({
            full_name: profileResult.value.fullName,
            email: profileResult.value.email,
            role: profileResult.value.role,
            learningTrack: profileResult.value.learningTrack,
          })
        }

        if (categoryResult.status === 'fulfilled') {
          setCategories(categoryResult.value)
        }

        if (attemptResult.status === 'fulfilled') {
          setAttempts(attemptResult.value)
        }

        if (
          profileResult.status === 'rejected' ||
          categoryResult.status === 'rejected'
        ) {
          setDashboardError('Unable to load some dashboard details right now.')
        }

        setIsLoadingDashboard(false)
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [updateUser])

  const currentUser = {
    ...user,
    learningTrack: profile?.learningTrack ?? user?.learningTrack,
  }
  const selectedTrack = getFellowTrack(currentUser)

  const selectedTrackAttempts = useMemo(() => {
    if (!selectedTrack) {
      return []
    }

    return attempts.filter((attempt) => matchesTrack(attempt, selectedTrack))
  }, [attempts, selectedTrack])

  const latestAttempt = selectedTrackAttempts[0]
  const latestPercentage = getAttemptPercentage(latestAttempt)
  const { averageScore, bestScore } = getScoreStats(selectedTrackAttempts)
  const selectedCategory = categories.find(
    (category) => category.slug === selectedTrack?.quizSlug,
  )

  const dashboardStats = [
    {
      label: 'Selected Track',
      value: selectedTrack?.label ?? 'None',
      helper: selectedTrack ? selectedTrack.pathLabel : 'Choose a learning track',
    },
    {
      label: 'Attempts Completed',
      value: selectedTrackAttempts.length,
      helper: selectedTrack ? `${selectedTrack.label} attempts` : 'No track selected',
    },
    {
      label: 'Best Score',
      value: `${bestScore}%`,
      helper: selectedTrackAttempts.length ? 'Highest track score' : 'No attempts yet',
    },
    {
      label: 'Average Score',
      value: `${averageScore}%`,
      helper: selectedTrackAttempts.length
        ? 'Across this track'
        : 'Start to build progress',
    },
  ]

  const trackActions = selectedTrack
    ? [
        {
          title: 'Active Course',
          description: `${selectedTrack.title} is your selected fellowship course.`,
          to: selectedTrack.detailPath,
          cta: 'Open course',
          status: selectedTrack.pathLabel,
        },
        {
          title: `Start ${selectedTrack.label} Quiz`,
          description: selectedCategory?.description ?? selectedTrack.description,
          to: selectedTrack.quizPath,
          cta: 'Start quiz',
          status: 'Available',
        },
        {
          title: 'Quiz Progress',
          description: selectedTrackAttempts.length
            ? `Best score ${bestScore}% and average score ${averageScore}%.`
            : 'Start your first quiz to build progress.',
          to: selectedTrack.quizPath,
          cta: selectedTrackAttempts.length ? 'Retake quiz' : 'Start quiz',
          status: `${selectedTrackAttempts.length} attempts`,
        },
        {
          title: 'Recent Result',
          description: latestAttempt
            ? `Latest score: ${latestPercentage}% in ${latestAttempt.category_title}.`
            : 'No results yet for your active course.',
          to: '/quizzes/attempts',
          cta: latestAttempt ? 'View result' : 'View results',
          status: latestAttempt ? 'Latest' : 'Empty',
        },
        {
          title: 'Learning Track Progress',
          description: 'Track-specific learning milestones will appear here when modules are available.',
          cta: 'Coming soon',
          status: 'Soon',
          disabled: true,
        },
      ]
    : []

  const handleSelectTrack = async (trackValue) => {
    setIsSavingTrack(true)
    setDashboardError('')
    setSuccessMessage('')

    try {
      const updatedProfile = await updateLearningTrack({
        learningTrack: trackValue,
      })

      setProfile(updatedProfile)
      updateUser({
        full_name: updatedProfile.fullName,
        email: updatedProfile.email,
        role: updatedProfile.role,
        learningTrack: updatedProfile.learningTrack,
      })
      setIsChangingTrack(false)
      setSuccessMessage('Learning track saved.')

      const savedTrack = LEARNING_TRACKS[updatedProfile.learningTrack]
      if (savedTrack?.detailPath) {
        navigate(savedTrack.detailPath)
      }
    } catch (error) {
      const detail = error?.response?.data?.detail
      setDashboardError(
        typeof detail === 'string'
          ? detail
          : 'Unable to save learning track.',
      )
    } finally {
      setIsSavingTrack(false)
    }
  }

  const handleChangeTrack = () => {
    const shouldContinue = window.confirm(
      'Changing your track may reset or affect progress display. Continue?',
    )

    if (shouldContinue) {
      setIsChangingTrack(true)
      setSuccessMessage('')
    }
  }

  const shouldShowSelection = !selectedTrack || isChangingTrack

  return (
    <main className="app-home">
      <FellowTopbar selectedTrack={selectedTrack} />

      <section className="fellow-dashboard">
        {dashboardError ? (
          <p className="dashboard-alert">{dashboardError}</p>
        ) : null}

        {successMessage ? (
          <p className="dashboard-success">{successMessage}</p>
        ) : null}

        {shouldShowSelection ? (
          <section className="track-selection-shell">
            <div className="track-selection-heading">
              <p className="eyebrow">Choose Specialization</p>
              <h1>Select your learning track</h1>
              <p>
                Pick one track to personalize your dashboard, quiz shortcuts,
                progress display, and recommended next steps.
              </p>
            </div>

            {isLoadingDashboard ? (
              <p className="track-selection-loading">Loading track options...</p>
            ) : null}

            <div className="track-selection-grid">
              {LEARNING_TRACK_OPTIONS.map((track) => (
                <TrackSelectionCard
                  key={track.value}
                  track={track}
                  isSaving={isSavingTrack}
                  onSelect={handleSelectTrack}
                />
              ))}
            </div>
          </section>
        ) : (
          <>
            <div className="fellow-hero">
              <div>
                <p className="eyebrow">Fellow Dashboard</p>
                <h1>{selectedTrack.title}</h1>
                <p>
                  Welcome back, {user?.full_name ?? 'Fellow'}. Your dashboard is
                  focused on {selectedTrack.label} practice and progress.
                </p>
                <div className="fellow-hero-actions">
                  <Link className="outline-button" to={selectedTrack.detailPath}>
                    View Course
                  </Link>
                  <Link className="secondary-button" to={selectedTrack.quizPath}>
                    Start {selectedTrack.label} Quiz
                  </Link>
                  <Link className="outline-button" to="/quizzes/attempts">
                    View Results
                  </Link>
                  <button
                    type="button"
                    className="text-button"
                    onClick={handleChangeTrack}
                  >
                    Change learning track
                  </button>
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

            <section className="dashboard-section">
              <div className="dashboard-section-heading">
                <p className="eyebrow">Overview</p>
                <h2>{selectedTrack.label} progress</h2>
              </div>
              <div className="fellow-stats-grid">
                {dashboardStats.map((stat) => (
                  <DashboardStatCard key={stat.label} {...stat} />
                ))}
              </div>
            </section>

            <SelectedTrackOverview
              track={selectedTrack}
              attemptsCount={selectedTrackAttempts.length}
              bestScore={bestScore}
              averageScore={averageScore}
              latestAttempt={latestAttempt}
              latestPercentage={latestPercentage}
            />

            <section className="dashboard-section">
              <div className="dashboard-section-heading">
                <p className="eyebrow">Next Actions</p>
                <h2>Continue your selected track</h2>
              </div>
              <div className="dashboard-actions selected-track-actions-grid">
                {trackActions.map((action) => (
                  <DashboardActionCard key={action.title} {...action} />
                ))}
              </div>
            </section>

            <div className="fellow-dashboard-split">
              <section className="recent-activity-card">
                <p className="eyebrow">Recent Activity</p>
                <h2>Latest {selectedTrack.label} quiz attempt</h2>
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
                  <p>
                    No {selectedTrack.label} attempts yet. Start a quiz to see
                    activity here.
                  </p>
                )}
              </section>

              <section className="recommended-card">
                <p className="eyebrow">Recommended</p>
                <h2>
                  {latestAttempt ? 'Review your latest result' : 'Start your first quiz'}
                </h2>
                <p>
                  {latestAttempt
                    ? `Your latest ${selectedTrack.label} score was ${latestPercentage}%. Review it before your next attempt.`
                    : `Begin the ${selectedTrack.label} track with your first quiz attempt.`}
                </p>
                <Link
                  className="secondary-button"
                  to={
                    latestAttempt
                      ? `/quizzes/attempts/${latestAttempt.id}`
                      : selectedTrack.quizPath
                  }
                >
                  {latestAttempt ? 'Review result' : 'Start quiz'}
                </Link>
              </section>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
