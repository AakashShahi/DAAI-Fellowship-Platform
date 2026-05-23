import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { EmptyState } from '../../components/admin/AdminStates'
import Card from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table'

export default function AdminAttendancePage() {
  return (
    <section>
      <AdminPageHeader
        label="Attendance"
        title="Attendance Tracking"
        description="Track fellow attendance across sessions."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Select label="Session" disabled value="">
            <option value="">All sessions</option>
          </Select>
          <Select label="Status" disabled value="">
            <option value="">All statuses</option>
          </Select>
          <Select label="Date" disabled value="">
            <option value="">All dates</option>
          </Select>
        </div>
      </AdminPageHeader>
      <Card className="rounded-xl" padding={false}>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Fellow</TableHead>
              <TableHead>Session</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody />
        </Table>
        <div className="p-5">
          <EmptyState
            title="No attendance records found."
            description="Mark attendance from an individual session to see records here."
          />
        </div>
      </Card>
    </section>
  )
}
