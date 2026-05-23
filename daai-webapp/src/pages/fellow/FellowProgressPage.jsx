import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import ProgressBar from '../../components/ui/ProgressBar'
import Skeleton from '../../components/ui/Skeleton'
import { getFellowAssignmentsSummary } from '../../services/assignmentService'
import { getFellowLearningSummary } from '../../services/learningService'
import { getFellowAttendanceSummary } from '../../services/sessionService'
import { getMyQuizAttempts } from '../../services/quizService'
import { getFellowTrack } from '../../utils/learningTrackAccess'
import useAuthStore from '../../store/authStore'

const getAttemptPct = (attempt) =>
  attempt?.total_questions
    ? Math.round((attempt.score / attempt.total_questions) * 100)
    : 0

export default function FellowProgressPage() {
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [learning, setLearning] = useState(null)
  const [assignments, setAssignments] = useState(null)
  const [attendance, setAttendance] = useState(null)
  const [quizAvg, setQuizAvg] = useState(0)

  const track = getFellowTrack(user)

  useEffect(() => {
    let mounted = true
    Promise.allSettled([
      getFellowLearningSummary(),
      getFellowAssignmentsSummary(),
      getFellowAttendanceSummary(),
      getMyQuizAttempts(),
    ]).then(([learnR, assignR, attendR, quizR]) => {
      if (!mounted) return
      if (learnR.status === 'fulfilled') setLearning(learnR.value)
      if (assignR.status === 'fulfilled') setAssignments(assignR.value)
      if (attendR.status === 'fulfilled') setAttendance(attendR.value)
      if (quizR.status === 'fulfilled' && track) {
        const filtered = quizR.value.filter((a) => {
          const text = [a?.category, a?.category_title].filter(Boolean).join(' ').toLowerCase()
          return track.categoryKeywords.some((k) => text.includes(k.toLowerCase()))
        })
        const scores = filtered.map(getAttemptPct)
        setQuizAvg(
          scores.length
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0,
        )
      }
      setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [track])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  const assignmentPct =
    assignments?.totalAssignments > 0
      ? Math.round(
          ((assignments.submittedAssignments ?? 0) / assignments.totalAssignments) * 100,
        )
      : 0

  const hasAnyData =
    (learning?.totalLessons ?? 0) > 0 ||
    (assignments?.totalAssignments ?? 0) > 0 ||
    (attendance?.totalSessions ?? 0) > 0

  return (
    <div>
      <PageHeader
        eyebrow="Fellow"
        title="Your progress"
        description="Learning, assignments, quizzes, and attendance across your fellowship track."
      />

      {!hasAnyData ? (
        <EmptyState
          title="Progress will appear here"
          description="Once modules, assignments, and sessions are published for your cohort, your completion metrics will show up."
          actionLabel="Go to learning"
          actionTo="/fellow/learning"
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="font-semibold text-slate-900">Learning completion</h2>
            <p className="mt-1 text-sm text-slate-600">
              {learning?.completedLessons ?? 0} of {learning?.totalLessons ?? 0} lessons
            </p>
            <div className="mt-4">
              <ProgressBar
                value={learning?.completionPercentage ?? 0}
                label="Course progress"
              />
            </div>
            <Link
              to="/fellow/learning"
              className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline"
            >
              Open learning →
            </Link>
          </Card>

          <Card>
            <h2 className="font-semibold text-slate-900">Assignments</h2>
            <p className="mt-1 text-sm text-slate-600">
              {assignments?.submittedAssignments ?? 0} submitted ·{' '}
              {assignments?.pendingAssignments ?? 0} pending ·{' '}
              {assignments?.reviewedAssignments ?? 0} reviewed
            </p>
            <div className="mt-4">
              <ProgressBar value={assignmentPct} label="Submission rate" />
            </div>
            <Link
              to="/fellow/assignments"
              className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline"
            >
              View assignments →
            </Link>
          </Card>

          <Card>
            <h2 className="font-semibold text-slate-900">Quiz performance</h2>
            <p className="mt-4 text-3xl font-bold text-slate-900">{quizAvg}%</p>
            <p className="text-sm text-slate-600">Average score on your track quizzes</p>
            <Link
              to="/fellow/quizzes"
              className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline"
            >
              View quizzes →
            </Link>
          </Card>

          <Card>
            <h2 className="font-semibold text-slate-900">Attendance</h2>
            <p className="mt-4 text-3xl font-bold text-slate-900">
              {attendance?.attendancePercentage ?? 0}%
            </p>
            <p className="text-sm text-slate-600">
              Present {attendance?.present ?? 0} · Absent {attendance?.absent ?? 0} · Late{' '}
              {attendance?.late ?? 0}
            </p>
            <Link
              to="/fellow/attendance"
              className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline"
            >
              View attendance →
            </Link>
          </Card>
        </div>
      )}

      <Card className="mt-6">
        <h2 className="font-semibold text-slate-900">Certificate eligibility</h2>
        <p className="mt-2 text-sm text-slate-600">
          Certificate issuance will be enabled when your cohort completes required modules,
          assignments, attendance, and capstone criteria. Check back on the Certificates page.
        </p>
        <Link
          to="/fellow/certificates"
          className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:underline"
        >
          Certificates →
        </Link>
      </Card>
    </div>
  )
}
