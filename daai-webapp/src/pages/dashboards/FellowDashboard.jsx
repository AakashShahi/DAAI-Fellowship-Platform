import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardActionCard from '../../components/dashboard/DashboardActionCard'
import DashboardStatCard from '../../components/dashboard/DashboardStatCard'
import SelectedTrackOverview from '../../components/dashboard/SelectedTrackOverview'
import TrackSelectionCard from '../../components/dashboard/TrackSelectionCard'
import { LEARNING_TRACK_OPTIONS, LEARNING_TRACKS } from '../../constants/learningTracks'
import { getMyEnrollment } from '../../services/fellowshipService'
import { getMyLearningProgressByTrack } from '../../services/learningProgressService'
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

const formatLearningStatus = (status = 'not_started') =>
  status
    .split('_')
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ')

const clampProgress = (progress = 0) => Math.min(Math.max(progress, 0), 100)

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
  const [programEnrollment, setProgramEnrollment] = useState(undefined)
  const [learningProgress, setLearningProgress] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadDashboard = async () => {
      const [
        enrollmentResult,
        profileResult,
        categoryResult,
        attemptResult,
      ] = await Promise.allSettled([
        getMyEnrollment(),
        getMyProfile(),
        getQuizCategories(),
        getMyQuizAttempts(),
      ])

      let learningProgressResult = null
      if (profileResult.status === 'fulfilled') {
        const profileTrack = LEARNING_TRACKS[profileResult.value?.learningTrack]
        if (profileTrack?.quizSlug) {
          learningProgressResult = await getMyLearningProgressByTrack(
            profileTrack.quizSlug,
          ).then(
            (value) => ({ status: 'fulfilled', value }),
            (reason) => ({ status: 'rejected', reason }),
          )
        }
      }

      if (isMounted) {
        if (enrollmentResult.status === 'fulfilled') {
          setProgramEnrollment(enrollmentResult.value?.enrollment ?? null)
        }

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

        if (learningProgressResult?.status === 'fulfilled') {
          setLearningProgress(learningProgressResult.value)
        } else {
          setLearningProgress(null)
        }

        if (
          profileResult.status === 'rejected' ||
          categoryResult.status === 'rejected' ||
          learningProgressResult?.status === 'rejected'
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
  const learningProgressPercent = clampProgress(
    learningProgress?.completionPercentage ?? 0,
  )
  const learningStatus = formatLearningStatus(learningProgress?.status)
  const learningModules = useMemo(
    () => learningProgress?.modules ?? [],
    [learningProgress],
  )
  const learningMilestones = useMemo(
    () => learningProgress?.milestones ?? [],
    [learningProgress],
  )
  const completedModules = learningModules.filter(
    (module) => module.status === 'completed',
  ).length
  const completedMilestones = learningMilestones.filter(
    (milestone) => milestone.status === 'completed',
  ).length
  const nextLearningModule = learningModules.find(
    (module) => module.status !== 'completed',
  )

  const dashboardStats = [
    {
      label: 'Selected Track',
      value: selectedTrack?.label ?? 'None',
      helper: selectedTrack ? selectedTrack.pathLabel : 'Choose a learning track',
    },
    {
      label: 'Learning Progress',
      value: `${learningProgressPercent}%`,
      helper: selectedTrack ? learningStatus : 'No track selected',
    },
    {
      label: 'Modules',
      value: learningModules.length
        ? `${completedModules}/${learningModules.length}`
        : 0,
      helper: learningModules.length ? 'Completed modules' : 'No modules yet',
    },
    {
      label: 'Best Score',
      value: `${bestScore}%`,
      helper: selectedTrackAttempts.length ? 'Highest track score' : 'No attempts yet',
    },
  ]

  const fellowshipPanels = useMemo(() => {
    if (!selectedTrack) {
      return []
    }

    return [
      {
        title: 'Current track',
        body: `${selectedTrack.title} — ${selectedTrack.pathLabel}.`,
        cta: { label: 'Open track overview', to: selectedTrack.detailPath },
      },
      {
        title: 'Progress',
        body:
          learningProgress
            ? `Learning progress is ${learningProgressPercent}% (${learningStatus}). Quiz: best ${bestScore}% - avg ${averageScore}% across ${selectedTrackAttempts.length} attempt${
                selectedTrackAttempts.length === 1 ? '' : 's'
              }.`
            : 'No progress found yet. Start your first module to begin tracking your learning journey.',
      },
      {
        title: 'Modules',
        body: learningModules.length
          ? `${completedModules} of ${learningModules.length} modules completed. ${
              nextLearningModule
                ? `Continue with ${nextLearningModule.title}.`
                : 'All tracked modules are complete.'
            }`
          : 'No module progress has been recorded for this track yet.',
        cta: { label: 'View learning', to: '/fellow/learning' },
      },
      {
        title: 'Continue learning',
        body: nextLearningModule
          ? `Pick up ${nextLearningModule.title} and keep your progress moving.`
          : 'Jump into published modules and lessons for your enrolled track.',
        cta: {
          label: programEnrollment ? 'Open learning' : 'Open course',
          to: programEnrollment ? '/fellow/learning' : selectedTrack.detailPath,
        },
      },
      {
        title: 'Milestones',
        body: learningMilestones.length
          ? `${completedMilestones} of ${learningMilestones.length} milestones completed.`
          : 'No milestones found yet. They will appear here once progress is saved.',
        cta: { label: 'View quizzes', to: '/fellow/quizzes' },
      },
      {
        title: 'Assignments',
        body: 'Written assignments, labs, and submission deadlines will be listed here.',
        cta: { label: 'Assignments (soon)', to: '/fellow/assignments' },
      },
      {
        title: 'Announcements',
        body: 'Staff announcements, calendar updates, and cohort reminders will appear here.',
        cta: { label: 'Announcements (soon)', to: '/fellow/announcements' },
      },
    ]
  }, [
    selectedTrack,
    averageScore,
    bestScore,
    selectedTrackAttempts.length,
    learningProgress,
    learningProgressPercent,
    learningStatus,
    learningModules,
    learningMilestones,
    completedModules,
    completedMilestones,
    nextLearningModule,
    programEnrollment,
  ])

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
          to: '/fellow/quizzes/attempts',
          cta: latestAttempt ? 'View result' : 'View results',
          status: latestAttempt ? 'Latest' : 'Empty',
        },
        {
          title: 'Learning Track Progress',
          description:
            learningModules.length > 0
              ? `${learningProgressPercent}% complete across ${learningModules.length} module${
                  learningModules.length === 1 ? '' : 's'
                }.`
              : 'No progress found yet. Start your first module to begin tracking learning.',
          to: '/fellow/learning',
          cta: 'View learning',
          status: `${learningProgressPercent}%`,
          disabled: !programEnrollment && learningModules.length === 0,
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
      if (savedTrack?.quizSlug) {
        try {
          const savedProgress = await getMyLearningProgressByTrack(savedTrack.quizSlug)
          setLearningProgress(savedProgress)
        } catch {
          setLearningProgress(null)
        }
      }

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
    <div className="app-home">
      <section className="fellow-dashboard">
        {dashboardError ? (
          <p className="dashboard-alert">{dashboardError}</p>
        ) : null}

        {successMessage ? (
          <p className="dashboard-success">{successMessage}</p>
        ) : null}

        {!isLoadingDashboard && programEnrollment ? (
          <div className="dashboard-section">
            <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
              <p className="eyebrow">Program enrollment</p>
              <h2 className="mt-1 text-xl font-black text-[#24140e]">
                {programEnrollment.track.title}
              </h2>
              <p className="mt-2 text-sm font-medium text-[#6f5f57]">
                Batch: <strong>{programEnrollment.batch.name}</strong> ·{' '}
                {new Date(programEnrollment.batch.startDate).toLocaleDateString()} –{' '}
                {new Date(programEnrollment.batch.endDate).toLocaleDateString()}
              </p>
              <Link className="text-button mt-3 inline-block" to="/fellow/my-track">
                View track and batch details
              </Link>
            </div>
          </div>
        ) : null}

        {!isLoadingDashboard && programEnrollment === null ? (
          <div className="dashboard-section">
            <div className="rounded-lg border border-dashed border-orange-200 bg-[#fffaf6] p-5">
              <p className="eyebrow">Program enrollment</p>
              <p className="mt-2 text-sm font-bold text-[#6f5f57]">
                You are not enrolled in any fellowship track yet.
              </p>
              <p className="mt-2 text-sm text-[#6f5f57]">
                Your official track and batch will appear here once staff enroll you.
                You can still set a quiz practice track below.
              </p>
              <Link className="text-button mt-2 inline-block" to="/fellow/my-track">
                Open My track
              </Link>
            </div>
          </div>
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
                  Welcome back, {user?.full_name ?? 'Fellow'}. This is your hub
                  for coursework, assessments, assignments, and program updates
                  for the {selectedTrack.label} track.
                </p>
                <div className="fellow-hero-actions">
                  <Link className="outline-button" to={selectedTrack.detailPath}>
                    View Course
                  </Link>
                  <Link className="secondary-button" to={selectedTrack.quizPath}>
                    Start {selectedTrack.label} Quiz
                  </Link>
                  <Link className="outline-button" to="/fellow/quizzes/attempts">
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
                <p className="eyebrow">Program</p>
                <h2>Your fellowship at a glance</h2>
              </div>
              <div className="fellowship-overview-grid">
                {fellowshipPanels.map((panel) => (
                  <article key={panel.title} className="fellowship-panel">
                    <h3>{panel.title}</h3>
                    <p>{panel.body}</p>
                    {panel.cta ? (
                      <Link className="text-button" to={panel.cta.to}>
                        {panel.cta.label}
                      </Link>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>

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
              learningProgressPercent={learningProgressPercent}
              learningStatus={learningStatus}
              latestAttempt={latestAttempt}
              latestPercentage={latestPercentage}
            />

            <section className="dashboard-section">
              <div className="dashboard-section-heading">
                <p className="eyebrow">Next Actions</p>
                <h2>Track shortcuts</h2>
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
                    <Link to={`/fellow/quizzes/attempts/${latestAttempt.id}`}>
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
                      ? `/fellow/quizzes/attempts/${latestAttempt.id}`
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
    </div>
  )
}
