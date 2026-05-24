import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock3,
  GraduationCap,
  PlayCircle,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import ProgressBar from '../../components/ui/ProgressBar'
import Skeleton from '../../components/ui/Skeleton'
import {
  getFellowAssignments,
  getFellowAssignmentsSummary,
} from '../../services/assignmentService'
import { getMyCohort } from '../../services/cohortService'
import { getMyEnrollment } from '../../services/fellowshipService'
import {
  getFellowLearningModules,
  getFellowLearningSummary,
} from '../../services/learningService'
import { getMyLearningProgressByTrack } from '../../services/learningProgressService'
import { getMyProfile } from '../../services/profileService'
import { getMyQuizAttempts, getQuizCategories } from '../../services/quizService'
import {
  getFellowAttendanceSummary,
  getFellowSessions,
} from '../../services/sessionService'
import useAuthStore from '../../store/authStore'
import { getFellowTrack } from '../../utils/learningTrackAccess'

const formatDate = (value) => {
  if (!value) return 'Not scheduled'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not scheduled'
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const unwrapData = (value) => value?.data ?? value

const normalizeArray = (value, key) => {
  const data = unwrapData(value)

  if (Array.isArray(data)) return data
  if (key && Array.isArray(data?.[key])) return data[key]
  if (Array.isArray(data?.data)) return data.data

  return []
}

const normalizeObject = (value, key) => {
  const data = unwrapData(value)

  if (key && data && Object.prototype.hasOwnProperty.call(data, key)) {
    return data[key]
  }
  if (data?.data && !Array.isArray(data.data)) return data.data

  return data ?? null
}

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

const isPendingAssignment = (assignment) => {
  const status = String(assignment?.submissionStatus ?? assignment?.status ?? '')
    .toLowerCase()
  return !status || status.includes('not') || status.includes('pending')
}

function DashboardStat({ label, value, helper, icon: Icon, tone = 'indigo' }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    sky: 'bg-sky-50 text-sky-700',
  }

  return (
    <Card className="!p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-full ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {helper ? <p className="mt-2 text-sm text-slate-600">{helper}</p> : null}
    </Card>
  )
}

function SectionHeader({ title, action }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {action}
    </div>
  )
}

function EmptyPanel({ children }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-500">
      {children}
    </p>
  )
}

function RequirementItem({ done, children }) {
  const Icon = done ? CheckCircle2 : Circle

  return (
    <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
      <Icon
        className={done ? 'h-5 w-5 text-emerald-600' : 'h-5 w-5 text-slate-300'}
      />
      <span>{children}</span>
    </li>
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
  const [reloadKey, setReloadKey] = useState(0)
  const [programEnrollment, setProgramEnrollment] = useState(undefined)
  const [learningProgress, setLearningProgress] = useState(null)
  const [myCohort, setMyCohort] = useState(undefined)
  const [learningSummary, setLearningSummary] = useState(undefined)
  const [learningModules, setLearningModules] = useState([])
  const [assignmentSummary, setAssignmentSummary] = useState(undefined)
  const [assignments, setAssignments] = useState([])
  const [attendanceSummary, setAttendanceSummary] = useState(undefined)
  const [sessions, setSessions] = useState([])
  const userLearningTrack = user?.learningTrack
  const userSelectedTrack = user?.selectedTrack

  useEffect(() => {
    let isMounted = true

    const loadDashboard = async () => {
      setIsLoadingDashboard(true)
      setDashboardError('')

      try {
        const results = await Promise.allSettled([
          getMyEnrollment(),
          getFellowLearningSummary(),
          getFellowLearningModules(),
          getFellowAssignmentsSummary(),
          getFellowAssignments(),
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
          learningModulesResult,
          assignmentSummaryResult,
          assignmentsResult,
          attendanceSummaryResult,
          sessionsResult,
          cohortResult,
          profileResult,
          categoryResult,
          attemptResult,
        ] = results

        if (enrollmentResult.status === 'fulfilled') {
          setProgramEnrollment(normalizeObject(enrollmentResult.value, 'enrollment'))
        }

        if (learningSummaryResult.status === 'fulfilled') {
          setLearningSummary(normalizeObject(learningSummaryResult.value))
        }

        if (learningModulesResult.status === 'fulfilled') {
          setLearningModules(normalizeArray(learningModulesResult.value, 'modules'))
        }

        if (assignmentSummaryResult.status === 'fulfilled') {
          setAssignmentSummary(normalizeObject(assignmentSummaryResult.value))
        }

        if (assignmentsResult.status === 'fulfilled') {
          setAssignments(normalizeArray(assignmentsResult.value, 'assignments'))
        }

        if (attendanceSummaryResult.status === 'fulfilled') {
          setAttendanceSummary(normalizeObject(attendanceSummaryResult.value))
        }

        if (sessionsResult.status === 'fulfilled') {
          setSessions(normalizeArray(sessionsResult.value, 'sessions'))
        }

        if (cohortResult.status === 'fulfilled') {
          setMyCohort(normalizeObject(cohortResult.value, 'cohort'))
        }

        let profileData = null
        if (profileResult.status === 'fulfilled') {
          profileData = normalizeObject(profileResult.value)
          setProfile(profileData)
          updateUser({
            full_name: profileData?.fullName,
            email: profileData?.email,
            role: profileData?.role,
            learningTrack: profileData?.learningTrack,
          })
        }

        if (categoryResult.status === 'fulfilled') {
          setCategories(normalizeArray(categoryResult.value))
        }

        if (attemptResult.status === 'fulfilled') {
          setAttempts(normalizeArray(attemptResult.value))
        }

        const activeTrack = getFellowTrack({
          ...user,
          selectedTrack: userSelectedTrack,
          learningTrack: profileData?.learningTrack ?? userLearningTrack,
        })

        if (activeTrack?.quizSlug) {
          const progressResult = await getMyLearningProgressByTrack(
            activeTrack.quizSlug,
          ).then(
            (value) => ({ status: 'fulfilled', value }),
            (reason) => ({ status: 'rejected', reason }),
          )

          if (!isMounted) return

          setLearningProgress(
            progressResult.status === 'fulfilled'
              ? normalizeObject(progressResult.value)
              : null,
          )
        } else {
          setLearningProgress(null)
        }

        const rejectedResult = results.find((result) => result.status === 'rejected')
        if (rejectedResult) {
          console.error('Failed to load part of fellow dashboard:', rejectedResult.reason)
          const status = rejectedResult.reason?.response?.status
          setDashboardError(
            status === 401 || status === 403
              ? 'Your session expired. Please login again.'
              : 'Unable to load dashboard data. Please try refreshing the page.',
          )
        }
      } catch (loadError) {
        if (!isMounted) return
        console.error('Failed to load fellow dashboard:', loadError)
        const status = loadError?.response?.status
        setDashboardError(
          status === 401 || status === 403
            ? 'Your session expired. Please login again.'
            : 'Unable to load dashboard data. Please try refreshing the page.',
        )
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
  }, [reloadKey, updateUser, userLearningTrack, userSelectedTrack])

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
  const learningProgressPercent =
    learningProgress?.completionPercentage ??
    learningSummary?.completionPercentage ??
    0
  const trackTitle =
    programEnrollment?.track?.title ?? selectedTrack?.title ?? 'Not selected'
  const cohortName = myCohort?.name ?? programEnrollment?.batch?.name ?? 'Not assigned'
  const modulesCompleted = learningModules.filter(
    (module) => (module.completionPercentage ?? 0) >= 100,
  ).length
  const nextModule =
    learningModules.find((module) => (module.completionPercentage ?? 0) < 100) ??
    learningModules[0] ??
    null
  const pendingAssignments = assignments.filter(isPendingAssignment).slice(0, 3)
  const hasTrackQuizAttempt = selectedTrackAttempts.length > 0
  const pendingTasks = [
    ...pendingAssignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      type: 'Assignment',
      meta: assignment.dueDate
        ? `Due ${formatDate(assignment.dueDate)}`
        : assignment.submissionStatus ?? 'Pending',
      actionLabel: 'Submit Assignment',
      actionTo: `/fellow/assignments/${assignment.id}`,
    })),
    ...(selectedTrack && !hasTrackQuizAttempt
      ? [
          {
            id: selectedTrack.quizSlug,
            title: selectedCategory?.title ?? `${selectedTrack.label} Quiz`,
            type: 'Quiz',
            meta: 'Not attempted',
            actionLabel: 'Start Quiz',
            actionTo: selectedTrack.quizPath,
          },
        ]
      : []),
  ].slice(0, 4)
  const upcomingSessions = sessions
    .filter((session) => String(session.status).toLowerCase() === 'scheduled')
    .slice(0, 3)
  const recentActivity = [
    ...selectedTrackAttempts.slice(0, 2).map((attempt) => ({
      id: `quiz-${attempt.id ?? attempt.submitted_at}`,
      title: `${attempt.category_title ?? selectedCategory?.title ?? 'Quiz'} attempted`,
      meta: `${getAttemptPercentage(attempt)}% score`,
    })),
    ...assignments
      .filter((assignment) => !isPendingAssignment(assignment))
      .slice(0, 2)
      .map((assignment) => ({
        id: `assignment-${assignment.id}`,
        title: `${assignment.title} submitted`,
        meta: assignment.submissionStatus ?? 'Submitted',
      })),
    ...sessions
      .filter((session) => String(session.status).toLowerCase() === 'completed')
      .slice(0, 1)
      .map((session) => ({
        id: `session-${session.id}`,
        title: `${session.title} completed`,
        meta: formatDate(session.sessionDate),
      })),
  ].slice(0, 5)
  const assignmentPct =
    assignmentSummary?.totalAssignments > 0
      ? Math.round(
          ((assignmentSummary.submittedAssignments ?? 0) /
            assignmentSummary.totalAssignments) *
            100,
        )
      : 0
  const certificateChecks = {
    modules: learningProgressPercent >= 100,
    assignments:
      (assignmentSummary?.totalAssignments ?? 0) > 0 &&
      (assignmentSummary?.pendingAssignments ?? 0) === 0,
    attendance: (attendanceSummary?.attendancePercentage ?? 0) >= 80,
    quizzes: bestScore >= 60,
  }

  if (isLoadingDashboard) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
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
        <Card className="border-amber-200 bg-amber-50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-amber-900">{dashboardError}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Retry
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-white">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-center">
          <div>
            <Badge tone="primary">Fellow Dashboard</Badge>
            <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              Welcome back, {profile?.fullName ?? user?.full_name ?? 'Fellow'}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Continue your learning journey and complete your pending tasks.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="purple">Track: {trackTitle}</Badge>
              <Badge tone="outline">Cohort: {cohortName}</Badge>
            </div>
          </div>
          <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">Overall progress</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {learningProgressPercent}%
                </p>
              </div>
              <GraduationCap className="h-10 w-10 text-indigo-600" />
            </div>
            <div className="mt-4">
              <ProgressBar value={learningProgressPercent} />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStat
          label="Modules Completed"
          value={`${modulesCompleted}/${learningModules.length || 0}`}
          helper={`${learningSummary?.completedLessons ?? 0}/${learningSummary?.totalLessons ?? 0} lessons`}
          icon={BookOpen}
        />
        <DashboardStat
          label="Assignments Due"
          value={assignmentSummary?.pendingAssignments ?? pendingAssignments.length}
          helper={`${assignmentSummary?.submittedAssignments ?? 0} submitted`}
          icon={ClipboardList}
          tone="amber"
        />
        <DashboardStat
          label="Quizzes Completed"
          value={selectedTrackAttempts.length}
          helper={selectedTrackAttempts.length ? `Best score ${bestScore}%` : 'No attempts yet'}
          icon={CheckCircle2}
          tone="emerald"
        />
        <DashboardStat
          label="Attendance Rate"
          value={`${attendanceSummary?.attendancePercentage ?? 0}%`}
          helper={`${attendanceSummary?.present ?? 0} present`}
          icon={CalendarCheck}
          tone="sky"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <Card>
            <SectionHeader
              title="Continue Learning"
              action={
                <Button to="/fellow/learning" variant="secondary" size="sm">
                  Browse My Learning
                </Button>
              }
            />
            {nextModule ? (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  Current Module
                </p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  {nextModule.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Next Lesson:{' '}
                  <span className="font-semibold text-slate-800">
                    {nextModule.nextLessonTitle ??
                      nextModule.lessons?.find?.((lesson) => !lesson.completed)?.title ??
                      'Open module to continue'}
                  </span>
                </p>
                <div className="mt-4">
                  <ProgressBar
                    value={nextModule.completionPercentage ?? learningProgressPercent}
                    label="Module progress"
                  />
                </div>
                <Button to={`/fellow/learning/${nextModule.id}`} className="mt-4">
                  <PlayCircle className="h-4 w-4" />
                  Continue Lesson
                </Button>
              </div>
            ) : (
              <div className="mt-5">
                <EmptyPanel>No active lesson found.</EmptyPanel>
                <Button to="/fellow/learning" className="mt-4">
                  Browse My Learning
                </Button>
              </div>
            )}
          </Card>

          <Card>
            <SectionHeader
              title="Pending Tasks"
              action={
                <div className="flex gap-2">
                  <Button to="/fellow/assignments" variant="secondary" size="sm">
                    Assignments
                  </Button>
                  <Button to="/fellow/quizzes" variant="secondary" size="sm">
                    Quizzes
                  </Button>
                </div>
              }
            />
            {pendingTasks.length ? (
              <div className="mt-4 space-y-3">
                {pendingTasks.map((task) => (
                  <div
                    key={`${task.type}-${task.id}`}
                    className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <Badge tone={task.type === 'Quiz' ? 'purple' : 'primary'}>
                        {task.type}
                      </Badge>
                      <h3 className="mt-2 font-semibold text-slate-900">
                        {task.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">{task.meta}</p>
                    </div>
                    <Button to={task.actionTo} size="sm">
                      {task.actionLabel}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyPanel>You have no pending tasks right now.</EmptyPanel>
              </div>
            )}
          </Card>

          <Card>
            <SectionHeader
              title="Upcoming Sessions"
              action={
                <Button to="/fellow/sessions" variant="secondary" size="sm">
                  View Sessions
                </Button>
              }
            />
            {upcomingSessions.length ? (
              <div className="mt-4 space-y-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-lg border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {session.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatDate(session.sessionDate)} · {session.startTime} -{' '}
                          {session.endTime}
                        </p>
                      </div>
                      <Badge tone="info">Upcoming</Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {session.meetingLink ? (
                        <Button href={session.meetingLink} size="sm">
                          Meeting Link
                        </Button>
                      ) : null}
                      <Button
                        to={`/fellow/sessions/${session.id}`}
                        variant="secondary"
                        size="sm"
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyPanel>No upcoming sessions scheduled.</EmptyPanel>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionHeader title="Quiz Performance" />
            <p className="mt-3 text-sm text-slate-600">
              {selectedCategory?.description ?? selectedTrack.description}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Average</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {averageScore}%
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Latest</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {latestAttempt ? `${latestPercentage}%` : '-'}
                </p>
              </div>
            </div>
            <Button to={selectedTrack.quizPath} className="mt-4">
              {selectedTrackAttempts.length ? 'Retake Quiz' : 'Start Quiz'}
            </Button>
          </Card>

          <Card>
            <SectionHeader title="Recent Activity" />
            {recentActivity.length ? (
              <div className="mt-4 space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-700">
                      <Clock3 className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-slate-500">{activity.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyPanel>Your recent activity will appear here.</EmptyPanel>
              </div>
            )}
          </Card>

          <Card>
            <SectionHeader
              title="Certificate Eligibility"
              action={
                <Button to="/fellow/certificates" variant="secondary" size="sm">
                  Certificates
                </Button>
              }
            />
            <p className="mt-3 text-sm text-slate-600">
              Certificate readiness is based on completion criteria configured by
              the program team.
            </p>
            <ul className="mt-4 space-y-3">
              <RequirementItem done={certificateChecks.modules}>
                Complete required modules
              </RequirementItem>
              <RequirementItem done={certificateChecks.assignments}>
                Submit assignments
              </RequirementItem>
              <RequirementItem done={certificateChecks.attendance}>
                Maintain attendance
              </RequirementItem>
              <RequirementItem done={certificateChecks.quizzes}>
                Pass quizzes
              </RequirementItem>
            </ul>
            <div className="mt-4">
              <ProgressBar
                value={
                  (Object.values(certificateChecks).filter(Boolean).length / 4) *
                  100
                }
                label="Readiness"
              />
            </div>
          </Card>
        </div>
      </div>

      {programEnrollment === null ? (
        <Card className="border-dashed">
          <p className="text-sm text-slate-600">
            You are not enrolled in an official program track yet.{' '}
            <Button to="/fellow/my-track" variant="secondary" size="sm">
              Check enrollment status
            </Button>
          </p>
        </Card>
      ) : null}
    </div>
  )
}
