import { Download } from 'lucide-react'
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

export default function ReportsPage() {
  return (
    <section>
      <AdminPageHeader
        label="Reports"
        title="Reports"
        description="View fellowship progress, activity, and performance reports."
        actions={
          <Button variant="outline" disabled>
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      />
      <Card className="rounded-xl" padding={false}>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Report</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody />
        </Table>
        <div className="p-5">
          <EmptyState
            title="No reports found."
            description="Reports will appear here when analytics data is available."
          />
        </div>
      </Card>
    </section>
  )
}
