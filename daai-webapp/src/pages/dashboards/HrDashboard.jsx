import { useEffect, useState } from 'react'
import { Calendar, Users, UserCheck, Activity, Plus } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/admin/AdminStates'
import StatCard from '../../components/admin/StatCard'
import StaffTable from '../../components/admin/StaffTable'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { getStaffList } from '../../services/staffService'
import { getAdminTrackStats } from '../../services/adminFellowService'

const emptyTrackStats = { totalFellows: 0 }

export default function HrDashboard() {
  const [instructors, setInstructors] = useState([])
  const [trackStats, setTrackStats] = useState(emptyTrackStats)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setIsLoading(true)
    setError('')
    try {
      const [instructorData, trackData] = await Promise.all([
        getStaffList({ role: 'INSTRUCTOR', pageSize: 5 }),
        getAdminTrackStats(),
      ])
      
      setInstructors(instructorData?.items || [])
      setTrackStats(trackData || emptyTrackStats)
    } catch {
      setError('Failed to load HR dashboard data.')
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
        label="HR Dashboard"
        title="Staff & Fellow Management"
        description="Manage onboarding, track attendance, and monitor engagement across cohorts."
        actions={
          <>
            <Button to="/admin/staff/new" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Staff
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
              label="Total Instructors"
              value={instructors.length > 0 ? '12' : '0'} // Mocking total for demo, since API returns paginated
              helper="Active teaching staff"
              trend="+2 this month"
            />
            <StatCard
              label="Total Fellows"
              value={trackStats.totalFellows ?? 0}
              helper="Registered fellow accounts"
            />
            <StatCard
              label="Avg. Attendance"
              value="87%"
              helper="Across all active cohorts"
              trend="+4% from last week"
            />
            <StatCard
              label="Leave Requests"
              value="5"
              helper="Pending HR approval"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="col-span-2 rounded-xl" padding={false}>
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Recent Instructors</h2>
                  <p className="text-sm text-slate-500">Latest teaching staff members added.</p>
                </div>
                <Button to="/hr/instructors" variant="outline" size="sm">
                  View all
                </Button>
              </div>
              <StaffTable staff={instructors} isUpdating={false} onToggleStatus={() => {}} />
            </Card>

            <div className="space-y-6">
              <Card className="rounded-xl">
                <h2 className="mb-4 text-lg font-black text-slate-900">Quick Actions</h2>
                <div className="flex flex-col gap-3">
                  <Button to="/hr/staff" variant="outline" className="justify-start gap-3">
                    <UserCheck className="h-5 w-5 text-slate-400" />
                    Onboard New Staff
                  </Button>
                  <Button to="/hr/fellows" variant="outline" className="justify-start gap-3">
                    <Users className="h-5 w-5 text-slate-400" />
                    Manage Fellows
                  </Button>
                  <Button to="/hr/attendance" variant="outline" className="justify-start gap-3">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    Review Attendance
                  </Button>
                  <Button to="/hr/activity-logs" variant="outline" className="justify-start gap-3">
                    <Activity className="h-5 w-5 text-slate-400" />
                    View Activity Logs
                  </Button>
                </div>
              </Card>

              <Card className="rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-md">
                <h3 className="text-lg font-bold">HR Guidelines</h3>
                <p className="mt-2 text-sm text-indigo-100">
                  Ensure all new instructors complete their profile setup and are assigned to their respective cohorts before the semester begins.
                </p>
              </Card>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}


