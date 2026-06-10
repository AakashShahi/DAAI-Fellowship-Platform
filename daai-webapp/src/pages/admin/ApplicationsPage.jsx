import { useEffect, useMemo, useState } from 'react'
import { Eye, RefreshCcw } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/admin/AdminStates'
import StatusBadge from '../../components/admin/StatusBadge'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table'
import { FELLOWSHIP_PATHWAYS } from '../../constants/pathways'
import {
  getApplications,
  updateApplicationStatus,
} from '../../services/applicationService'

const statusOptions = [
  'NEW',
  'REVIEWING',
  'MORE_INFO',
  'ACCEPTED',
  'REJECTED',
  'ENROLLED',
]

const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [trackFilter, setTrackFilter] = useState('')

  const pathwayLabels = useMemo(
    () =>
      FELLOWSHIP_PATHWAYS.reduce(
        (labels, pathway) => ({ ...labels, [pathway.slug]: pathway.title }),
        {},
      ),
    [],
  )

  const filteredApplications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return applications.filter((application) => {
      const matchesStatus = !statusFilter || application.status === statusFilter
      const matchesTrack = !trackFilter || application.pathway === trackFilter
      const matchesSearch =
        !normalizedSearch ||
        [application.fullName, application.email, application.phone]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)
      return matchesStatus && matchesTrack && matchesSearch
    })
  }, [applications, search, statusFilter, trackFilter])

  const loadApplications = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getApplications()
      setApplications(data)
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Failed to load applications.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadApplications()
  }, [])

  const handleStatusChange = async (applicationId, status) => {
    setUpdatingId(applicationId)
    setError('')
    try {
      const updatedApplication = await updateApplicationStatus(applicationId, status)
      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === applicationId ? updatedApplication : application,
        ),
      )
    } catch (updateError) {
      setError(getErrorMessage(updateError, 'Unable to update application status.'))
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <section>
      <AdminPageHeader
        label="Applications"
        title="Fellow Applications"
        description="Review submitted applications, documents, and enrollment decisions."
        actions={
          <Button variant="outline" onClick={loadApplications} disabled={isLoading}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-[1fr_220px_220px]">
          <Input
            label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or email"
          />
          <Select
            label="Track"
            value={trackFilter}
            onChange={(event) => setTrackFilter(event.target.value)}
          >
            <option value="">All tracks</option>
            {FELLOWSHIP_PATHWAYS.map((pathway) => (
              <option key={pathway.slug} value={pathway.slug}>
                {pathway.title}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </AdminPageHeader>

      {error ? <ErrorState message={error} onRetry={loadApplications} /> : null}

      {isLoading ? (
        <LoadingState message="Loading applications..." />
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          title="No applications found."
          description="Submitted applications will appear here when applicants apply."
        />
      ) : (
        <Card className="rounded-xl" padding={false}>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Applicant</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Track</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-semibold text-slate-900">
                    {application.fullName}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`mailto:${application.email}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {application.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge tone="primary">
                      {pathwayLabels[application.pathway] ?? application.pathway}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <StatusBadge status={application.status} />
                      <Select
                        name={`status-${application.id}`}
                        value={application.status}
                        onChange={(event) =>
                          handleStatusChange(application.id, event.target.value)
                        }
                        disabled={updatingId === application.id}
                        className="min-w-40"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    {application.createdAt
                      ? new Date(application.createdAt).toLocaleDateString()
                      : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Button to={`/admin/applications/${application.id}`} size="sm">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </section>
  )
}
