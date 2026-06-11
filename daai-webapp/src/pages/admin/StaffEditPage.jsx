import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import AdminPageHeader from '../../components/admin/AdminPageHeader'
import StaffForm from '../../components/admin/StaffForm'
import { useAllowedRoles, useStaffDetail, useStaffMutations } from '../../hooks/useStaff'
import { ErrorState, LoadingState } from '../../components/admin/AdminStates'
import Card from '../../components/ui/Card'
import useAuthStore from '../../store/authStore'

export default function StaffEditPage() {
  const { staffId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()

  const { data: staffMember, isLoading: staffLoading, error: staffError, refetch } = useStaffDetail(staffId)
  const { roles: allowedRoles, isLoading: rolesLoading } = useAllowedRoles()
  const { handleUpdate, isLoading: isUpdating, error: updateError } = useStaffMutations()

  const onSubmit = async (payload) => {
    try {
      await handleUpdate(staffId, payload)
      navigate(`/admin/staff/${staffId}`)
    } catch (err) {
      // Error handled in hook
    }
  }

  if (staffLoading || rolesLoading) {
    return (
      <section>
        <AdminPageHeader label="Staff" title="Edit Staff" compact />
        <LoadingState message="Loading staff details..." />
      </section>
    )
  }

  if (staffError) {
    return (
      <section>
        <AdminPageHeader label="Staff" title="Edit Staff" compact />
        <ErrorState message={staffError} onRetry={refetch} />
      </section>
    )
  }

  if (!staffMember) {
    return null
  }

  // Ensure current role is in the allowed roles list for dropdown if user cannot normally create this role
  const formAllowedRoles = [...allowedRoles]
  if (!formAllowedRoles.includes(staffMember.role)) {
    // If they can't change it, they only see the current role
    if (currentUser?.id !== staffId) {
      formAllowedRoles.push(staffMember.role)
    }
  }

  return (
    <section className="mx-auto max-w-3xl">
      <Link
        to={`/admin/staff/${staffId}`}
        className="mb-4 inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Staff Detail
      </Link>

      <AdminPageHeader
        label="Staff"
        title={`Edit ${staffMember.full_name}`}
        description="Update staff profile and role information."
        compact
      />

      {updateError ? (
        <div className="mb-5">
          <ErrorState message={updateError} />
        </div>
      ) : null}

      <Card>
        <StaffForm
          initialData={staffMember}
          allowedRoles={formAllowedRoles}
          isLoading={isUpdating}
          isEdit={true}
          onSubmit={onSubmit}
          onCancel={() => navigate(`/admin/staff/${staffId}`)}
        />
      </Card>
    </section>
  )
}
