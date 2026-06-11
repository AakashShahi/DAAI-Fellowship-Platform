import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useState } from 'react'

import { useAllowedRoles, useStaffList, useStaffMutations } from '../../hooks/useStaff'
import { ErrorState, LoadingState } from '../../components/admin/AdminStates'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import StaffTable from '../../components/admin/StaffTable'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Pagination from '../../components/ui/Pagination'
import { getRoleLabel } from '../../components/admin/RoleBadge'

export default function StaffListPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, error, refetch } = useStaffList({
    search,
    role: roleFilter,
    status: statusFilter,
    page,
    pageSize: 10,
  })

  const { handleToggleStatus, isLoading: isUpdating, error: updateError } = useStaffMutations()
  const { roles: allowedRoles } = useAllowedRoles()

  const onToggleStatus = async (staffMember, isActive) => {
    try {
      await handleToggleStatus(staffMember.id, isActive)
      refetch()
    } catch (err) {
      // Error is handled in the hook and can be displayed
    }
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  return (
    <section>
      <AdminPageHeader
        label="Staff"
        title="Staff Management"
        description="Manage system users including Instructors, HR, Fellows, and Admins."
        actions={
          allowedRoles.length > 0 ? (
            <Button asChild>
              <Link to="/admin/staff/new">
                <Plus className="h-4 w-4" />
                Add Staff
              </Link>
            </Button>
          ) : null
        }
      />

      {error ? (
        <div className="mb-5">
          <ErrorState message={error} onRetry={refetch} />
        </div>
      ) : null}

      {updateError ? (
        <div className="mb-5">
          <ErrorState message={updateError} onRetry={refetch} />
        </div>
      ) : null}

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-12 lg:items-end">
          <div className="md:col-span-12 lg:col-span-6">
            <label className="text-sm font-bold text-slate-900">
              Search Staff
              <span className="mt-2 flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-slate-500 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
                <Search className="h-4 w-4 shrink-0" />
                <input
                  type="search"
                  placeholder="Search by name, email, or phone..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  value={search}
                  onChange={handleSearchChange}
                />
              </span>
            </label>
          </div>
          <div className="md:col-span-6 lg:col-span-3">
            <Select
              label="Role"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">All Roles</option>
              <option value="SUPER_ADMIN">{getRoleLabel('SUPER_ADMIN')}</option>
              <option value="ADMIN">{getRoleLabel('ADMIN')}</option>
              <option value="INSTRUCTOR">{getRoleLabel('INSTRUCTOR')}</option>
              <option value="HR">{getRoleLabel('HR')}</option>
              <option value="FELLOW">{getRoleLabel('FELLOW')}</option>
              <option value="EMPLOYER">{getRoleLabel('EMPLOYER')}</option>
            </Select>
          </div>
          <div className="md:col-span-6 lg:col-span-3">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading staff..." />
      ) : (
        <div className="space-y-4">
          <StaffTable
            staff={data?.items ?? []}
            isUpdating={isUpdating}
            onToggleStatus={onToggleStatus}
          />

          {data?.total > 0 ? (
            <Pagination
              page={data.page}
              pageSize={data.page_size}
              total={data.total}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      )}
    </section>
  )
}
