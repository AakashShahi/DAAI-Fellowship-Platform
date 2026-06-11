import { useEffect, useState } from 'react'
import { Calendar, FileText, CheckCircle, GraduationCap, ClipboardList, PenTool } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/admin/AdminStates'
import StatCard from '../../components/admin/StatCard'
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
import { getAdminCohorts } from '../../services/cohortService'
import { getAdminSessionStats } from '../../services/sessionService'
import { getAssignmentStatsAdmin } from '../../services/assignmentService'

const emptySessionStats = { scheduled: 0 }
const emptyAssignmentStats = { pendingReviews: 0 }

export default function InstructorDashboard() {
  const [cohorts, setCohorts] = useState([])
  const [sessionStats, setSessionStats] = useState(emptySessionStats)
  const [assignmentStats, setAssignmentStats] = useState(emptyAssignmentStats)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setIsLoading(true)
    setError('')
    try {
      const [cohortList, sessionData, assignmentData] = await Promise.all([
        getAdminCohorts({ status: 'active' }),
        getAdminSessionStats(), // Replace with getInstructorSessionStats if available
        getAssignmentStatsAdmin(), // Replace with getInstructorAssignmentStats if available
      ])
      
      setCohorts(cohortList.filter((cohort) => cohort.status === 'active').slice(0, 5))
      setSessionStats(sessionData)
      setAssignmentStats(assignmentData)
    } catch {
      setError('Failed to load Instructor dashboard data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  return (
    <section>
      <AdminPageHeader
        label="Instructor Dashboard"
        title="Teaching Hub"
        description="Manage your cohorts, upcoming sessions, and review fellow assignments."
        actions={
          <>
            <Button to="/instructor/assignments/new" className="gap-2">
              <PenTool className="h-4 w-4" />
              New Assignment
            </Button>
          </>
        }
      />

      {error ? <ErrorState message={error} onRetry={loadDashboard} /> : null}

      {isLoading ? (
        <LoadingState message="Loading dashboard..." />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="My Cohorts"
              value={cohorts.length ?? 0}
              helper="Active cohorts assigned"
              trend="Current Semester"
            />
            <StatCard
              label="Upcoming Sessions"
              value={sessionStats.scheduled ?? 0}
              helper="Scheduled for this week"
            />
            <StatCard
              label="Pending Reviews"
              value={assignmentStats.pendingReviews ?? 0}
              helper="Submissions to grade"
              trend="Requires Action"
            />
            <StatCard
              label="Avg. Class Attendance"
              value="92%"
              helper="For your sessions"
              trend="Above average"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="col-span-2 rounded-xl" padding={false}>
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5">
                <div>
                  <h2 className="text-lg font-black text-slate-900">My Active Cohorts</h2>
                  <p className="text-sm text-slate-500">Cohorts you are currently instructing.</p>
                </div>
                <Button to="/instructor/cohorts" variant="outline" size="sm">
                  View all
                </Button>
              </div>
              {cohorts.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cohort Name</TableHead>
                      <TableHead>Track</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
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
                        <TableCell className="text-right">
                           <Button to={`/instructor/cohorts/${cohort.id}`} variant="ghost" size="sm" className="text-indigo-600">
                             Manage
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-5">
                  <EmptyState
                    title="No active cohorts found."
                    description="You have not been assigned to any active cohorts yet."
                  />
                </div>
              )}
            </Card>

            <div className="space-y-6">
              <Card className="rounded-xl">
                <h2 className="mb-4 text-lg font-black text-slate-900">Quick Actions</h2>
                <div className="flex flex-col gap-3">
                  <Button to="/instructor/attendance" variant="outline" className="justify-start gap-3">
                    <CheckCircle className="h-5 w-5 text-slate-400" />
                    Mark Attendance
                  </Button>
                  <Button to="/instructor/assignments" variant="outline" className="justify-start gap-3">
                    <FileText className="h-5 w-5 text-slate-400" />
                    Upload Assignments
                  </Button>
                  <Button to="/instructor/grades" variant="outline" className="justify-start gap-3">
                    <ClipboardList className="h-5 w-5 text-slate-400" />
                    Grade Submissions
                  </Button>
                </div>
              </Card>

              <Card className="rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <GraduationCap className="h-6 w-6 text-indigo-600" />
                  <h3 className="text-lg font-bold text-slate-900">Teaching Tips</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Try to grade assignments within 48 hours of submission. Quick feedback helps fellows improve faster and stay engaged with the material.
                </p>
              </Card>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
