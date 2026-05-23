import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import ProgressBar from '../../components/ui/ProgressBar'
import Skeleton from '../../components/ui/Skeleton'
import { getFellowAssignmentsSummary } from '../../services/assignmentService'
import { getMyCohort } from '../../services/cohortService'
import { getMyEnrollment } from '../../services/fellowshipService'
import { getFellowLearningSummary } from '../../services/learningService'
import { getMyLearningProgressByTrack } from '../../services/learningProgressService'
import { getMyProfile } from '../../services/profileService'
import { getMyQuizAttempts, getQuizCategories } from '../../services/quizService'
import {
  getFellowAttendanceSummary,
  getFellowSessions,
} from '../../services/sessionService'
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

function StatTile({ label, value, helper }) {
  return (
    <Card className="!p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
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
  const [categories, setCategories] = useState([])
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
      setIsLoadingDashboard(true)
      setDashboardError('')

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

      if (categoryResult.status === 'fulfilled') {
        setCategories(categoryResult.value)
      }

      if (attemptResult.status === 'fulfilled') {
        setAttempts(attemptResult.value)
      }

      const activeTrack = getFellowTrack({
        ...user,
        learningTrack:
          profileResult.status === 'fulfilled'
            ? profileResult.value?.learningTrack
            : user?.learningTrack,
      })

      if (activeTrack?.quizSlug) {
        const progressResult = await getMyLearningProgressByTrack(
          activeTrack.quizSlug,
        ).then(
          (value) => ({ status: 'fulfilled', value }),
          (reason) => ({ status: 'rejected', reason }),
        )

        if (!isMounted) return

        if (progressResult.status === 'fulfilled') {
          setLearningProgress(progressResult.value)
        } else {
          setLearningProgress(null)
        }
      } else {
        setLearningProgress(null)
      }

      if (
        profileResult.status === 'rejected' ||
        categoryResult.status === 'rejected' ||
        attemptResult.status === 'rejected'
      ) {
        setDashboardError('Unable to load some dashboard details right now.')
      }

      setIsLoadingDashboard(false)
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [updateUser, user])

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
  const latestAttempt = selectedTrackAttempts[0] ?? null
  const latestPercentage = latestAttempt ? getAttemptPercentage(latestAttempt) : 0
  const nextSession = sessions.find((session) => session.status === 'scheduled') ?? null
  const learningProgressPercent =
    learningProgress?.completionPercentage ??
    learningSummary?.completionPercentage ??
    0
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
          {' | '}
          Cohort: <strong className="text-slate-900">{cohortName}</strong>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button to="/fellow/learning">Continue learning</Button>
          <Button to="/fellow/progress" variant="secondary">
            View progress
          </Button>
          <Button to="/fellow/select-track" variant="secondary">
            Change track
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Learning"
          value={`${learningProgressPercent}%`}
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
          helper={`Best ${bestScore}% | ${selectedTrackAttempts.length} attempts`}
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
            <ProgressBar value={learningProgressPercent} label="Course progress" />
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
                {new Date(nextSession.sessionDate).toLocaleDateString()} |{' '}
                {nextSession.startTime} - {nextSession.endTime}
              </p>
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
            <p className="mt-2 text-sm text-slate-600">
              No upcoming session scheduled.
            </p>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900">Quiz progress</h2>
          <p className="mt-2 text-sm text-slate-600">
            {selectedCategory?.description ?? selectedTrack.description}
          </p>
          <p className="mt-3 text-sm text-slate-700">
            Latest score:{' '}
            <strong>{latestAttempt ? `${latestPercentage}%` : 'No attempts yet'}</strong>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button to={selectedTrack.quizPath} size="sm">
              {selectedTrackAttempts.length ? 'Retake quiz' : 'Start quiz'}
            </Button>
            <Button to="/fellow/quizzes/attempts" variant="secondary" size="sm">
              View results
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900">Pending tasks</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>
              {assignmentSummary?.pendingAssignments ?? 0} assignment
              {(assignmentSummary?.pendingAssignments ?? 0) === 1 ? '' : 's'} pending
            </li>
            <li>Complete track quizzes to stay on pace</li>
            <li>
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
      </div>

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
          View announcements
        </Link>
      </Card>

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
