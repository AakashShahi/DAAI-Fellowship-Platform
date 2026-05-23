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

export default function AdminCertificatesPage() {
  return (
    <section>
      <AdminPageHeader
        label="Certificates"
        title="Certificates"
        description="Issue and manage fellowship certificates."
        actions={
          <Button disabled>
            <Plus className="h-4 w-4" />
            Issue Certificate
          </Button>
        }
      />
      <Card className="rounded-xl" padding={false}>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Fellow</TableHead>
              <TableHead>Track/Cohort</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issued date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody />
        </Table>
        <div className="p-5">
          <EmptyState
            title="No certificates found."
            description="Issued certificates will appear here when the certificate workflow is connected."
          />
        </div>
      </Card>
    </section>
  )
}
