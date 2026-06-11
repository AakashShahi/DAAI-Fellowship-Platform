import { Eye, MoreHorizontal, Pencil, Power } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/Table'
import RoleBadge from './RoleBadge'
import StatusToggle from './StatusToggle'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function StaffTable({
  staff = [],
  isUpdating = false,
  onToggleStatus,
}) {
  if (staff.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
        <p className="text-sm font-semibold text-slate-500">No staff members found</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="hidden md:table-cell">Mobile</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600">
                    {member.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {member.full_name}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-slate-600">{member.email}</span>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="text-slate-600">{member.phone || '—'}</span>
              </TableCell>
              <TableCell>
                <RoleBadge role={member.role} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StatusToggle
                    isActive={member.is_active}
                    isLoading={isUpdating}
                    onToggle={(active) => onToggleStatus(member, active)}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      member.is_active ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {member.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <span className="text-sm text-slate-500">
                  {formatDate(member.created_at)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    to={`/admin/staff/${member.id}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    to={`/admin/staff/${member.id}/edit`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
