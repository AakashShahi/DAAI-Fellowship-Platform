import { Plus } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { EmptyState } from '../../components/admin/AdminStates'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table'

export default function AdminAnnouncementsPage() {
  return (
    <section>
      <AdminPageHeader
        label="Announcements"
        title="Announcements"
        description="Publish updates and notices for fellows."
        actions={
          <Button disabled>
            <Plus className="h-4 w-4" />
            Create Announcement
          </Button>
        }
      />
      <Card className="rounded-xl" padding={false}>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Title</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody />
        </Table>
        <div className="p-5">
          <EmptyState
            title="No announcements found."
            description="Announcement publishing is ready for the backend workflow."
          />
        </div>
      </Card>
    </section>
  )
}
