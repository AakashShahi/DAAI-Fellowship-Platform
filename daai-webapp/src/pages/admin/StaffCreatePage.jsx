import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import AdminPageHeader from '../../components/admin/AdminPageHeader'
import StaffForm from '../../components/admin/StaffForm'
import { useAllowedRoles, useStaffMutations } from '../../hooks/useStaff'
import { ErrorState, LoadingState } from '../../components/admin/AdminStates'
import Card from '../../components/ui/Card'
import UnauthorizedPage from '../UnauthorizedPage'

export default function StaffCreatePage() {
  const navigate = useNavigate()
  const { roles: allowedRoles, isLoading: rolesLoading } = useAllowedRoles()
  const { handleCreate, isLoading: isCreating, error } = useStaffMutations()

  const onSubmit = async (payload) => {
    try {
      await handleCreate(payload)
      navigate('/admin/staff')
    } catch (err) {
      // Error handled in hook and displayed via ErrorState
    }
  }

  if (rolesLoading) {
    return (
      <section>
        <AdminPageHeader label="Staff" title="Add New Staff" compact />
        <LoadingState message="Checking permissions..." />
      </section>
    )
  }

  if (allowedRoles.length === 0) {
    return <UnauthorizedPage />
  }

  return (
    <section className="mx-auto max-w-3xl">
      <Link
        to="/admin/staff"
        className="mb-4 inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Staff List
      </Link>

      <AdminPageHeader
        label="Staff"
        title="Add New Staff"
        description="Create a new staff account. An email with a temporary password will be sent automatically."
        compact
      />

      {error ? (
        <div className="mb-5">
          <ErrorState message={error} />
        </div>
      ) : null}

      <Card>
        <StaffForm
          allowedRoles={allowedRoles}
          isLoading={isCreating}
          onSubmit={onSubmit}
          onCancel={() => navigate('/admin/staff')}
        />
      </Card>
    </section>
  )
}
