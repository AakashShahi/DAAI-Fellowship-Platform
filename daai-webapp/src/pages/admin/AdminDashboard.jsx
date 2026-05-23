import { useEffect, useState } from 'react'
import { Calendar, FileText, GraduationCap, Users } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/admin/AdminStates'
import StatusBadge from '../../components/admin/StatusBadge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table'
import { getAdminTrackStats } from '../../services/adminFellowService'
import { getApplications } from '../../services/applicationService'
import { getAdminCohorts, getAdminCohortStats } from '../../services/cohortService'
import { getAssignmentStatsAdmin } from '../../services/assignmentService'
import { getAdminSessionStats } from '../../services/sessionService'

const emptyTrackStats = { totalFellows: 0 }
const emptyCohortStats = { active: 0 }
const emptyAssignmentStats = { pendingReviews: 0 }
const emptySessionStats = { scheduled: 0 }

function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <Card className="rounded-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
          {helper ? <p className="mt-1 text-xs font-medium text-slate-500">{helper}</p> : null}
        </div>
        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}

export default function AdminDashboard() {
  const [trackStats, setTrackStats] = useState(emptyTrackStats)
  const [cohortStats, setCohortStats] = useState(emptyCohortStats)
  const [assignmentStats, setAssignmentStats] = useState(emptyAssignmentStats)
  const [sessionStats, setSessionStats] = useState(emptySessionStats)
  const [applications, setApplications] = useState([])
  const [cohorts, setCohorts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setIsLoading(true)
    setError('')
    try {
      const [
        trackData,
        cohortData,
        assignmentData,
        sessionData,
        applicationData,
        cohortList,
      ] = await Promise.all([
        getAdminTrackStats(),
        getAdminCohortStats(),
        getAssignmentStatsAdmin(),
        getAdminSessionStats(),
        getApplications(),
        getAdminCohorts({ status: 'active' }),
      ])
      setTrackStats(trackData)
      setCohortStats(cohortData)
      setAssignmentStats(assignmentData)
      setSessionStats(sessionData)
      setApplications(applicationData.slice(0, 5))
      setCohorts(cohortList.filter((cohort) => cohort.status === 'active').slice(0, 5))
    } catch {
      setError('Failed to load dashboard data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard()
  }, [])

  return (
    <section>
      <AdminPageHeader
        label="Admin Dashboard"
        title="Overview"
        description="Monitor fellows, cohorts, applications, and learning activity."
      />

      {error ? <ErrorState message={error} onRetry={loadDashboard} /> : null}

      {isLoading ? (
        <LoadingState message="Loading dashboard..." />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Users}
              label="Total Fellows"
              value={trackStats.totalFellows ?? 0}
              helper="Registered fellow accounts"
            />
            <StatCard
              icon={GraduationCap}
              label="Active Cohorts"
              value={cohortStats.active ?? 0}
              helper="Running now"
            />
            <StatCard
              icon={FileText}
              label="Pending Reviews"
              value={assignmentStats.pendingReviews ?? 0}
              helper="Submissions awaiting review"
            />
            <StatCard
              icon={Calendar}
              label="Upcoming Sessions"
              value={sessionStats.scheduled ?? 0}
              helper="Scheduled sessions"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="rounded-xl" padding={false}>
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Recent Applications</h2>
                  <p className="text-sm text-slate-500">Latest submitted applications.</p>
                </div>
                <Button to="/admin/applications" variant="outline" size="sm">
                  View all
                </Button>
              </div>
              {applications.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-semibold text-slate-900">
                          {application.fullName}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={application.status} />
                        </TableCell>
                        <TableCell>
                          {application.createdAt
                            ? new Date(application.createdAt).toLocaleDateString()
                            : 'Unknown'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-5">
                  <EmptyState
                    title="No applications found."
                    description="Submitted applications will appear here."
                  />
                </div>
              )}
            </Card>

            <Card className="rounded-xl" padding={false}>
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Active Cohorts</h2>
                  <p className="text-sm text-slate-500">Currently running cohorts.</p>
                </div>
                <Button to="/admin/cohorts" variant="outline" size="sm">
                  View all
                </Button>
              </div>
              {cohorts.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cohort</TableHead>
                      <TableHead>Track</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cohorts.map((cohort) => (
                      <TableRow key={cohort.id}>
                        <TableCell className="font-semibold text-slate-900">
                          {cohort.name}
                        </TableCell>
                        <TableCell>{cohort.track}</TableCell>
                        <TableCell>
                          <StatusBadge status={cohort.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-5">
                  <EmptyState
                    title="No active cohorts found."
                    description="Active cohorts will appear here once they are running."
                  />
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </section>
  )
}
