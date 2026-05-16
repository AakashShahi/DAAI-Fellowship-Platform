import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/admin/StatCard'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import Skeleton from '../../components/ui/Skeleton'
import {
  FELLOW_TRACK_OPTIONS,
  getFellowTrackLabel,
} from '../../constants/fellowTracks'
import { getAdminTrackStats } from '../../services/adminFellowService'
import { getAdminCohortStats } from '../../services/cohortService'
import { getCurriculumStats } from '../../services/learningService'
import { getAssignmentStatsAdmin } from '../../services/assignmentService'
import { getAdminSessionStats } from '../../services/sessionService'

const emptyStats = { totalFellows: 0, unassigned: 0, tracks: {} }
const emptyCohortStats = {
  totalCohorts: 0,
  active: 0,
  upcoming: 0,
  completed: 0,
  archived: 0,
}
const emptyCurriculumStats = {
  totalModules: 0,
  publishedModules: 0,
  draftModules: 0,
  archivedModules: 0,
  totalLessons: 0,
}
const emptyAssignmentStats = {
  totalAssignments: 0,
  publishedAssignments: 0,
  pendingReviews: 0,
  reviewedSubmissions: 0,
  needsResubmission: 0,
}
const emptySessionStats = {
  totalSessions: 0,
  scheduled: 0,
  completed: 0,
  cancelled: 0,
  averageAttendancePercentage: 0,
  sessionsNeedingAttendance: 0,
}

function StatSection({ title, children }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
    </section>
  )
}

export default function AdminDashboard() {
  const [trackStats, setTrackStats] = useState(emptyStats)
  const [cohortStats, setCohortStats] = useState(emptyCohortStats)
  const [curriculumStats, setCurriculumStats] = useState(emptyCurriculumStats)
  const [assignmentStats, setAssignmentStats] = useState(emptyAssignmentStats)
  const [sessionStats, setSessionStats] = useState(emptySessionStats)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    const loadStats = async () => {
      try {
        const [trackData, cohortData, curriculumData, assignmentData, sessionData] =
          await Promise.all([
            getAdminTrackStats(),
            getAdminCohortStats(),
            getCurriculumStats(),
            getAssignmentStatsAdmin(),
            getAdminSessionStats(),
          ])
        if (isMounted) {
          setTrackStats(trackData)
          setCohortStats(cohortData)
          setCurriculumStats(curriculumData)
          setAssignmentStats(assignmentData)
          setSessionStats(sessionData)
        }
      } catch {
        if (isMounted) setError('Unable to load dashboard statistics.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadStats()
    return () => {
      isMounted = false
    }
  }, [])

  const trackDistribution = useMemo(
    () =>
      FELLOW_TRACK_OPTIONS.map((track) => ({
        label: getFellowTrackLabel(track.value),
        value: trackStats.tracks?.[track.value] ?? 0,
      })),
    [trackStats.tracks],
  )

  return (
    <section>
      <PageHeader
        eyebrow="Admin"
        title="Platform overview"
        description="Monitor fellows, cohorts, curriculum, assessments, and sessions across DAAI pathways."
        actions={
          <>
            <Button to="/admin/fellows" size="sm">
              Fellows
            </Button>
            <Button to="/admin/cohorts" variant="secondary" size="sm">
              Cohorts
            </Button>
            <Button to="/admin/submissions" variant="secondary" size="sm">
              Reviews
            </Button>
          </>
        }
      />

      {error ? (
        <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <>
          <StatSection title="People & cohorts">
            <StatCard
              label="Total fellows"
              value={trackStats.totalFellows}
              helper="Registered fellow accounts"
            />
            <StatCard
              label="Unassigned"
              value={trackStats.unassigned}
              helper="Need track selection"
              trend={trackStats.unassigned > 0 ? 'Action needed' : undefined}
            />
            <StatCard label="Active cohorts" value={cohortStats.active} helper="Running now" />
            <StatCard
              label="Upcoming cohorts"
              value={cohortStats.upcoming}
              helper="Scheduled to start"
            />
          </StatSection>

          <StatSection title="Reviews & assessments">
            <StatCard
              label="Pending reviews"
              value={assignmentStats.pendingReviews}
              helper="Submissions awaiting mentor/admin"
              action={
                assignmentStats.pendingReviews > 0 ? (
                  <Link
                    to="/admin/submissions"
                    className="text-sm font-semibold text-indigo-600 hover:underline"
                  >
                    Open review queue →
                  </Link>
                ) : null
              }
            />
            <StatCard
              label="Published assignments"
              value={assignmentStats.publishedAssignments}
              helper="Visible to fellows"
            />
            <StatCard
              label="Needs resubmission"
              value={assignmentStats.needsResubmission}
              helper="Returned to fellows"
            />
            <StatCard
              label="Reviewed"
              value={assignmentStats.reviewedSubmissions}
              helper="Completed reviews"
            />
          </StatSection>

          <StatSection title="Sessions & attendance">
            <StatCard label="Total sessions" value={sessionStats.totalSessions} />
            <StatCard label="Scheduled" value={sessionStats.scheduled} />
            <StatCard
              label="Avg attendance"
              value={`${sessionStats.averageAttendancePercentage}%`}
            />
            <StatCard
              label="Needs attendance"
              value={sessionStats.sessionsNeedingAttendance}
              helper="Sessions missing marks"
              action={
                sessionStats.sessionsNeedingAttendance > 0 ? (
                  <Link
                    to="/admin/sessions"
                    className="text-sm font-semibold text-indigo-600 hover:underline"
                  >
                    Mark attendance →
                  </Link>
                ) : null
              }
            />
          </StatSection>

          <StatSection title="Curriculum">
            <StatCard label="Total modules" value={curriculumStats.totalModules} />
            <StatCard label="Published" value={curriculumStats.publishedModules} />
            <StatCard label="Draft" value={curriculumStats.draftModules} />
            <StatCard label="Total lessons" value={curriculumStats.totalLessons} />
          </StatSection>

          <StatSection title="Track distribution">
            {trackDistribution.map((item) => (
              <StatCard
                key={item.label}
                label={item.label}
                value={item.value}
                helper="Fellows on this track"
              />
            ))}
          </StatSection>
        </>
      )}
    </section>
  )
}
