import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/admin/AdminStates'
import StatusBadge from '../../components/admin/StatusBadge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table'
import { getTracks } from '../../services/fellowshipService'
import { getSubmissionsStaff } from '../../services/submissionService'

const STATUSES = ['SUBMITTED', 'REVIEWED', 'NEEDS_REVISION']

export default function AdminSubmissionsPage() {
  const [tracks, setTracks] = useState([])
  const [trackId, setTrackId] = useState('')
  const [status, setStatus] = useState('')
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadRows = async () => {
    setIsLoading(true)
    setError('')
    try {
      const params = {}
      if (trackId) params.trackId = trackId
      if (status) params.status = status
      const list = await getSubmissionsStaff(params)
      setRows(list)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to load submissions.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const data = await getTracks()
        setTracks(data)
        if (data[0]?.id) setTrackId(data[0].id)
      } catch {
        setError('Unable to load tracks.')
        setIsLoading(false)
      }
    }
    loadTracks()
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId, status])

  return (
    <section>
      <AdminPageHeader
        label="Submissions"
        title="Fellow Submissions"
        description="Review assignments and quiz submissions."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Track"
            value={trackId}
            onChange={(event) => setTrackId(event.target.value)}
          >
            <option value="">All tracks</option>
            {tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.title}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
      </AdminPageHeader>

      {error ? <ErrorState message={error} onRetry={loadRows} /> : null}

      {isLoading ? (
        <LoadingState message="Loading submissions..." />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No submissions found."
          description="Submitted coursework will appear here for review."
        />
      ) : (
        <Card className="rounded-xl" padding={false}>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Fellow</TableHead>
                <TableHead>Submission</TableHead>
                <TableHead>Submitted at</TableHead>
                <TableHead>Score/Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <p className="font-semibold text-slate-900">{row.fellowName}</p>
                    <p className="text-xs text-slate-500">{row.fellowEmail}</p>
                  </TableCell>
                  <TableCell>{row.assignmentTitle}</TableCell>
                  <TableCell>
                    {row.submittedAt
                      ? new Date(row.submittedAt).toLocaleString()
                      : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={row.status} />
                      <span className="text-xs text-slate-500">
                        Score: {row.score ?? 'Not scored'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button to={`/admin/submissions/${row.id}`} size="sm">
                      <Eye className="h-4 w-4" />
                      Review
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
