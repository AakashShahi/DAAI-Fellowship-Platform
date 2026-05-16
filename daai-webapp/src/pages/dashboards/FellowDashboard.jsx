import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardActionCard from '../../components/dashboard/DashboardActionCard'
import DashboardStatCard from '../../components/dashboard/DashboardStatCard'
import SelectedTrackOverview from '../../components/dashboard/SelectedTrackOverview'
import { getMyEnrollment } from '../../services/fellowshipService'
import { getFellowAssignmentsSummary } from '../../services/assignmentService'
import { getMyCohort } from '../../services/cohortService'
import { getFellowLearningSummary } from '../../services/learningService'
import {
  getMyQuizAttempts,
  getQuizCategories,
} from '../../services/quizService'
import { getMyProfile } from '../../services/profileService'
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
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const [profile, setProfile] = useState(null)
  const [categories, setCategories] = useState([])
  const [attempts, setAttempts] = useState([])
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true)
  const [dashboardError, setDashboardError] = useState('')
  const [programEnrollment, setProgramEnrollment] = useState(undefined)
  const [myCohort, setMyCohort] = useState(undefined)
  const [learningSummary, setLearningSummary] = useState(undefined)

  const [assignmentSummary, setAssignmentSummary] = useState(undefined)

  useEffect(() => {
    let isMounted = true

    const loadDashboard = async () => {
      const [
        enrollmentResult,
        learningSummaryResult,
        assignmentSummaryResult,
        cohortResult,
        profileResult,
        categoryResult,
        attemptResult,
      ] = await Promise.allSettled([
        getMyEnrollment(),
        getFellowLearningSummary(),
        getFellowAssignmentsSummary(),
        getMyCohort(),
        getMyProfile(),
        getQuizCategories(),
        getMyQuizAttempts(),
      ])

      if (isMounted) {
        if (enrollmentResult.status === 'fulfilled') {
          setProgramEnrollment(enrollmentResult.value?.enrollment ?? null)
        }

        if (learningSummaryResult.status === 'fulfilled') {
          setLearningSummary(learningSummaryResult.value)
        }

        if (assignmentSummaryResult.status === 'fulfilled') {
          setAssignmentSummary(assignmentSummaryResult.value)
        }

        if (cohortResult.status === 'fulfilled') {
          setMyCohort(cohortResult.value?.cohort ?? null)
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
    {
      label: 'Learning Progress',
      value: `${learningSummary?.completionPercentage ?? 0}%`,
      helper: `${learningSummary?.completedLessons ?? 0} / ${
        learningSummary?.totalLessons ?? 0
      } lessons completed`,
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
          learningSummary?.totalLessons > 0
            ? `Lessons completed ${learningSummary.completedLessons} / ${learningSummary.totalLessons}. Overall learning progress ${learningSummary.completionPercentage}%. Quiz: best ${bestScore}% · avg ${averageScore}% (${selectedTrackAttempts.length} attempts).`
            : `Best score ${bestScore}% · Average ${averageScore}% across ${selectedTrackAttempts.length} quiz attempt${
                selectedTrackAttempts.length === 1 ? '' : 's'
              }.`,
      },
      {
        title: 'Continue learning',
        body: 'Jump into published modules and lessons for your enrolled track.',
        cta: {
          label: programEnrollment ? 'Open learning' : 'Open course',
          to: programEnrollment ? '/fellow/learning' : selectedTrack.detailPath,
        },
      },
      {
        title: 'Pending quizzes',
        body: 'Complete required quizzes to stay on pace with the fellowship schedule.',
        cta: { label: 'View quizzes', to: '/fellow/quizzes' },
      },
      {
        title: 'Assignments',
        body: assignmentSummary
          ? `Total assignments: ${assignmentSummary.totalAssignments}. Submitted: ${assignmentSummary.submittedAssignments}. Reviewed: ${assignmentSummary.reviewedAssignments}. Pending: ${assignmentSummary.pendingAssignments}.`
          : 'Written assignments and deadlines appear when you are enrolled in a track.',
        cta: {
          label: 'View assignments',
          to: '/fellow/assignments',
        },
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
    learningSummary,
    programEnrollment,
    assignmentSummary,
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
            learningSummary?.totalLessons > 0
              ? `${learningSummary.completedLessons} of ${learningSummary.totalLessons} lessons completed.`
              : 'Track-specific learning milestones will appear here when modules are available.',
          to: '/fellow/learning',
          cta: 'View learning',
          status:
            learningSummary?.totalLessons > 0
              ? `${learningSummary.completionPercentage}%`
              : 'Soon',
          disabled: !learningSummary?.totalLessons,
        },
        {
          title: 'Assignments',
          description:
            assignmentSummary?.totalAssignments > 0
              ? `${assignmentSummary.totalAssignments} total · ${assignmentSummary.pendingAssignments} pending · ${assignmentSummary.reviewedAssignments} reviewed.`
              : 'Submit coursework and track your review status.',
          to: '/fellow/assignments',
          cta: 'Open assignments',
          status: assignmentSummary?.pendingAssignments ? 'Pending' : 'Live',
        },
      ]
    : []

  return (
    <div className="app-home">
      <section className="fellow-dashboard">
        {dashboardError ? (
          <p className="dashboard-alert">{dashboardError}</p>
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
              </p>
              <Link className="text-button mt-2 inline-block" to="/fellow/my-track">
                Open My track
              </Link>
            </div>
          </div>
        ) : null}

        {!isLoadingDashboard ? (
          <div className="dashboard-section">
            <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
              <p className="eyebrow">Your Cohort</p>
              {myCohort ? (
                <>
                  <h2 className="mt-1 text-xl font-black text-[#24140e]">
                    {myCohort.name}
                  </h2>
                  <div className="mt-3 grid gap-2 text-sm font-bold text-[#6f5f57] md:grid-cols-3">
                    <p>Track: {selectedTrack?.label ?? myCohort.track}</p>
                    <p>
                      Duration:{' '}
                      {new Date(myCohort.startDate).toLocaleDateString()} -{' '}
                      {new Date(myCohort.endDate).toLocaleDateString()}
                    </p>
                    <p>Status: {myCohort.status}</p>
                  </div>
                  {myCohort.description ? (
                    <p className="mt-3 text-sm font-medium text-[#6f5f57]">
                      {myCohort.description}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="mt-2 text-sm font-bold text-[#6f5f57]">
                  You are not assigned to a cohort yet. Please contact admin.
                </p>
              )}
            </div>
          </div>
        ) : null}

        {isLoadingDashboard || !selectedTrack ? (
          <p className="track-selection-loading">Loading your dashboard...</p>
        ) : (
          <>
            <div className="fellow-hero">
              <div>
                <p className="eyebrow">Fellow Dashboard</p>
                <p className="mt-2 text-sm font-black text-[#f26322]">
                  Your Learning Track: {selectedTrack.label}
                </p>
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
              averageScore={averageScore}
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
