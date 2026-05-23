import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import ProgressBar from '../../components/ui/ProgressBar'
import Skeleton from '../../components/ui/Skeleton'
import { getMyEnrollment } from '../../services/fellowshipService'
import { getMyLearningProgressByTrack } from '../../services/learningProgressService'
import {
  getMyQuizAttempts,
  getQuizCategories,
} from '../../services/quizService'
import { getMyProfile, updateLearningTrack } from '../../services/profileService'
import { getFellowAssignmentsSummary } from '../../services/assignmentService'
import { getMyCohort } from '../../services/cohortService'
import { getFellowLearningSummary } from '../../services/learningService'
import { getFellowAttendanceSummary, getFellowSessions } from '../../services/sessionService'
import { getMyQuizAttempts, getQuizCategories } from '../../services/quizService'
import { getMyProfile } from '../../services/profileService'
import useAuthStore from '../../store/authStore'
import { getFellowTrack } from '../../utils/learningTrackAccess'

const getAttemptPercentage = (attempt) =>
  attempt?.total_questions
    ? Math.round((attempt.score / attempt.total_questions) * 100)
    : 0

const matchesTrack = (attempt, track) => {
  const categoryText = [attempt?.category, attempt?.category_title]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
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
function StatTile({ label, value, helper }) {
  return (
    <Card className="!p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {helper ? <p className="mt-1 text-xs text-slate-600">{helper}</p> : null}
    </Card>
  )
}

export default function FellowDashboard() {
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const [profile, setProfile] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true)
  const [dashboardError, setDashboardError] = useState('')
  const [programEnrollment, setProgramEnrollment] = useState(undefined)
  const [learningProgress, setLearningProgress] = useState(null)
  const [myCohort, setMyCohort] = useState(undefined)
  const [learningSummary, setLearningSummary] = useState(undefined)
  const [assignmentSummary, setAssignmentSummary] = useState(undefined)
  const [attendanceSummary, setAttendanceSummary] = useState(undefined)
  const [sessions, setSessions] = useState([])

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
      const results = await Promise.allSettled([
        getMyEnrollment(),
        getFellowLearningSummary(),
        getFellowAssignmentsSummary(),
        getFellowAttendanceSummary(),
        getFellowSessions(),
        getMyCohort(),
        getMyProfile(),
        getQuizCategories(),
        getMyQuizAttempts(),
      ])
      if (!isMounted) return
      const [
        enrollmentResult,
        learningSummaryResult,
        assignmentSummaryResult,
        attendanceSummaryResult,
        sessionsResult,
        cohortResult,
        profileResult,
        categoryResult,
        attemptResult,
      ] = results

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
      if (enrollmentResult.status === 'fulfilled') {
        setProgramEnrollment(enrollmentResult.value?.enrollment ?? null)
      }
      if (learningSummaryResult.status === 'fulfilled') {
        setLearningSummary(learningSummaryResult.value)
      }
      if (assignmentSummaryResult.status === 'fulfilled') {
        setAssignmentSummary(assignmentSummaryResult.value)
      }
      if (attendanceSummaryResult.status === 'fulfilled') {
        setAttendanceSummary(attendanceSummaryResult.value)
      }
      if (sessionsResult.status === 'fulfilled') {
        setSessions(sessionsResult.value)
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
      if (attemptResult.status === 'fulfilled') {
        setAttempts(attemptResult.value)
      }
      if (profileResult.status === 'rejected' || categoryResult.status === 'rejected') {
        setDashboardError('Unable to load some dashboard details right now.')
      }
      setIsLoadingDashboard(false)
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
    if (!selectedTrack) return []
    return attempts.filter((attempt) => matchesTrack(attempt, selectedTrack))
  }, [attempts, selectedTrack])
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
  const nextSession = sessions.find((s) => s.status === 'scheduled') ?? null

  const trackTitle =
    programEnrollment?.track?.title ?? selectedTrack?.title ?? 'Not selected'
  const cohortName = myCohort?.name ?? programEnrollment?.batch?.name ?? 'Not assigned'

  if (isLoadingDashboard) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    )
  }

  if (!selectedTrack) {
    return (
      <EmptyState
        title="Select your learning track"
        description="Choose a fellowship track to unlock your personalized dashboard, quizzes, and learning path."
        actionLabel="Select track"
        actionTo="/fellow/select-track"
      />
    )
  }

  return (
    <div className="space-y-6">
      {dashboardError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {dashboardError}
        </p>
      ) : null}

      <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-white">
        <p className="text-sm font-medium text-indigo-600">Welcome back</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          {user?.full_name ?? 'Fellow'}
        </h1>
        <p className="mt-2 text-slate-600">
          Your track: <strong className="text-slate-900">{trackTitle}</strong>
          {' · '}
          Cohort: <strong className="text-slate-900">{cohortName}</strong>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button to="/fellow/learning">Continue learning</Button>
          <Button to="/fellow/progress" variant="secondary">
            View progress
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Learning"
          value={`${learningSummary?.completionPercentage ?? 0}%`}
          helper={`${learningSummary?.completedLessons ?? 0}/${learningSummary?.totalLessons ?? 0} lessons`}
        />
        <StatTile
          label="Assignments"
          value={assignmentSummary?.pendingAssignments ?? 0}
          helper={`${assignmentSummary?.submittedAssignments ?? 0} submitted`}
        />
        <StatTile
          label="Quiz average"
          value={`${averageScore}%`}
          helper={`Best ${bestScore}% · ${selectedTrackAttempts.length} attempts`}
        />
        <StatTile
          label="Attendance"
          value={`${attendanceSummary?.attendancePercentage ?? 0}%`}
          helper={`${attendanceSummary?.present ?? 0} present`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-slate-900">Continue learning</h2>
          <p className="mt-2 text-sm text-slate-600">
            Pick up published modules and lessons for your enrolled track.
          </p>
          <div className="mt-4">
            <ProgressBar
              value={learningSummary?.completionPercentage ?? 0}
              label="Course progress"
            />
          </div>
          <Button to="/fellow/learning" className="mt-4">
            Open My Learning
          </Button>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900">Upcoming session</h2>
          {nextSession ? (
            <>
              <p className="mt-2 font-medium text-slate-900">{nextSession.title}</p>
              <p className="mt-1 text-sm text-slate-600">
                {new Date(nextSession.sessionDate).toLocaleDateString()} ·{' '}
                {nextSession.startTime} – {nextSession.endTime}
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
              <div className="mt-4 flex flex-wrap gap-2">
                {nextSession.meetingLink ? (
                  <Button href={nextSession.meetingLink} size="sm">
                    Join session
                  </Button>
                ) : null}
                <Button to="/fellow/sessions" variant="secondary" size="sm">
                  All sessions
                </Button>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-600">No upcoming session scheduled.</p>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900">Pending tasks</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>
              • {assignmentSummary?.pendingAssignments ?? 0} assignment
              {(assignmentSummary?.pendingAssignments ?? 0) === 1 ? '' : 's'} pending
            </li>
            <li>• Complete track quizzes to stay on pace</li>
            <li>
              •{' '}
              {(learningSummary?.totalLessons ?? 0) -
                (learningSummary?.completedLessons ?? 0)}{' '}
              lessons remaining
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button to="/fellow/assignments" variant="secondary" size="sm">
              Assignments
            </Button>
            <Button to="/fellow/quizzes" variant="secondary" size="sm">
              Quizzes
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900">Announcements</h2>
          <p className="mt-2 text-sm text-slate-600">
            Program announcements and cohort reminders will appear here when staff posts
            them.
          </p>
          <Link
            to="/fellow/announcements"
            className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline"
          >
            View announcements →
          </Link>
        </Card>
      </div>

      {programEnrollment === null ? (
        <Card className="border-dashed">
          <p className="text-sm text-slate-600">
            You are not enrolled in an official program track yet.{' '}
            <Link to="/fellow/my-track" className="font-semibold text-indigo-600">
              Check enrollment status
            </Link>
          </p>
        </Card>
      ) : null}
    </div>
  )
}
