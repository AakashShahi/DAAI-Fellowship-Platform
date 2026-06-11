import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, MapPin, Mail, Phone, Calendar } from 'lucide-react'

import { useStaffDetail, useStaffActivityLogs } from '../../hooks/useStaff'
import { ErrorState, LoadingState } from '../../components/admin/AdminStates'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import Card from '../../components/ui/Card'
import RoleBadge from '../../components/admin/RoleBadge'
import ActivityLogList from '../../components/admin/ActivityLogList'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/admin/StatusBadge'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function StaffDetailPage() {
  const { staffId } = useParams()
  const { data: staff, isLoading: staffLoading, error: staffError, refetch: refetchStaff } = useStaffDetail(staffId)
  const { data: logsData, isLoading: logsLoading, error: logsError } = useStaffActivityLogs(staffId)

  if (staffLoading) {
    return (
      <section>
        <AdminPageHeader label="Staff Detail" title="Loading..." compact />
        <LoadingState message="Loading staff details..." />
      </section>
    )
  }

  if (staffError) {
    return (
      <section>
        <AdminPageHeader label="Staff Detail" title="Error" compact />
        <ErrorState message={staffError} onRetry={refetchStaff} />
      </section>
    )
  }

  if (!staff) return null

  return (
    <section className="mx-auto max-w-5xl">
      <Link
        to="/admin/staff"
        className="mb-4 inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Staff List
      </Link>

      <AdminPageHeader
        label="Staff Detail"
        title={staff.full_name}
        actions={
          <Button asChild variant="outline">
            <Link to={`/admin/staff/${staff.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <RoleBadge role={staff.role} />
          <StatusBadge status={staff.is_active ? 'active' : 'inactive'} />
          <span className="text-sm text-slate-500">
            Joined {formatDate(staff.created_at)}
          </span>
        </div>
      </AdminPageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <Card padding={false} className="overflow-hidden">
            <div className="h-24 bg-indigo-600/10" />
            <div className="px-6 pb-6 text-center">
              <div className="mx-auto -mt-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-indigo-100 text-3xl font-black text-indigo-700 shadow-sm">
                {staff.full_name.charAt(0)}
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">{staff.full_name}</h2>
              <p className="text-sm font-medium text-slate-500">{staff.bio || 'No bio provided'}</p>
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
              Contact Info
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{staff.email}</p>
                  <p className="text-xs text-slate-500">Email Address</p>
                </div>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{staff.phone || '—'}</p>
                  <p className="text-xs text-slate-500">Phone Number</p>
                </div>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{staff.location || '—'}</p>
                  <p className="text-xs text-slate-500">Location</p>
                </div>
              </li>
            </ul>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <h3 className="mb-4 text-lg font-bold text-slate-900">Activity History</h3>
            <ActivityLogList 
              logs={logsData?.items} 
              isLoading={logsLoading} 
              error={logsError} 
            />
          </Card>
        </div>
      </div>
    </section>
  )
}
