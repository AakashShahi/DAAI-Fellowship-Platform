import { useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, Settings } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/admin/AdminStates'
import StatusBadge from '../../components/admin/StatusBadge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/Dialog'
import Select from '../../components/ui/Select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table'
import {
  createEnrollment,
  getBatches,
  getEnrollments,
  getFellowsForAdmin,
  getTracks,
  updateEnrollment,
} from '../../services/fellowshipService'

const ENROLLMENT_STATUSES = ['ACTIVE', 'COMPLETED', 'WITHDRAWN']
const emptyForm = { fellowId: '', batchId: '' }

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : 'Unknown'

export default function AdminEnrollmentsPage() {
  const [fellows, setFellows] = useState([])
  const [tracks, setTracks] = useState([])
  const [selectedTrackId, setSelectedTrackId] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [batches, setBatches] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const fellowsById = useMemo(
    () => Object.fromEntries(fellows.map((fellow) => [fellow.id, fellow])),
    [fellows],
  )

  const filteredEnrollments = useMemo(
    () =>
      enrollments.filter((enrollment) => {
        const matchesTrack =
          !selectedTrackId || enrollment.track?.id === selectedTrackId || enrollment.trackId === selectedTrackId
        const matchesStatus = !selectedStatus || enrollment.status === selectedStatus
        return matchesTrack && matchesStatus
      }),
    [enrollments, selectedStatus, selectedTrackId],
  )

  const refreshEnrollments = async () => {
    const eList = await getEnrollments()
    setEnrollments(eList)
  }

  const load = async () => {
    setError('')
    setIsLoading(true)
    try {
      const [fList, tList, eList] = await Promise.all([
        getFellowsForAdmin(),
        getTracks(),
        getEnrollments(),
      ])
      setFellows(fList)
      setTracks(tList)
      setEnrollments(eList)
      if (tList[0]?.id) setSelectedTrackId(tList[0].id)
    } catch {
      setError('Failed to load enrollment data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  useEffect(() => {
    if (!selectedTrackId) return
    const loadBatches = async () => {
      try {
        const data = await getBatches(selectedTrackId)
        setBatches(data)
        setForm((current) => ({ ...current, batchId: data[0]?.id ?? '' }))
      } catch {
        setBatches([])
      }
    }
    loadBatches()
  }, [selectedTrackId])

  const handleEnroll = async (event) => {
    event.preventDefault()
    if (!form.fellowId || !selectedTrackId || !form.batchId) {
      setError('Select fellow, track, and batch.')
      return
    }
    setIsSaving(true)
    setError('')
    try {
      await createEnrollment({
        fellowId: form.fellowId,
        trackId: selectedTrackId,
        batchId: form.batchId,
      })
      setForm(emptyForm)
      setIsDialogOpen(false)
      await refreshEnrollments()
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to create enrollment.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (enrollmentId, status) => {
    setError('')
    try {
      await updateEnrollment(enrollmentId, { status })
      await refreshEnrollments()
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to update enrollment.')
    }
  }

  return (
    <section>
      <AdminPageHeader
        label="Enrollments"
        title="Fellow Enrollments"
        description="Manage fellow enrollment into tracks, cohorts, and batches."
        actions={
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Enroll Fellow
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Select
            label="Track"
            value={selectedTrackId}
            onChange={(event) => setSelectedTrackId(event.target.value)}
          >
            <option value="">All tracks</option>
            {tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.title}
              </option>
            ))}
          </Select>
          <Select label="Cohort/Batch" disabled value="">
            <option value="">All cohorts/batches</option>
          </Select>
          <Select
            label="Status"
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            {ENROLLMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </AdminPageHeader>

      {error ? <ErrorState message={error} onRetry={load} /> : null}

      {isLoading ? (
        <LoadingState message="Loading enrollments..." />
      ) : filteredEnrollments.length === 0 ? (
        <EmptyState
          title="No enrollments found."
          description="Enroll fellows into tracks and batches to start managing progress."
          action={
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Enroll Fellow
            </Button>
          }
        />
      ) : (
        <Card className="rounded-xl" padding={false}>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Fellow</TableHead>
                <TableHead>Track</TableHead>
                <TableHead>Cohort/Batch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrollment date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.map((enrollment) => {
                const fellow = fellowsById[enrollment.fellowId]
                return (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <p className="font-semibold text-slate-900">
                        {enrollment.fellowName ?? fellow?.fullName ?? `Fellow ${enrollment.fellowId}`}
                      </p>
                      {fellow?.email ? (
                        <p className="text-xs text-slate-500">{fellow.email}</p>
                      ) : null}
                    </TableCell>
                    <TableCell>{enrollment.track?.title ?? 'Track'}</TableCell>
                    <TableCell>{enrollment.batch?.name ?? 'Batch'}</TableCell>
                    <TableCell>
                      <StatusBadge status={enrollment.status} />
                    </TableCell>
                    <TableCell>{formatDate(enrollment.enrolledAt)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {ENROLLMENT_STATUSES.map((status) => (
                          <Button
                            key={status}
                            variant="outline"
                            size="sm"
                            disabled={status === enrollment.status}
                            onClick={() => handleStatusChange(enrollment.id, status)}
                          >
                            <Settings className="h-4 w-4" />
                            Mark {status}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Fellow</DialogTitle>
            <DialogDescription>
              Assign a fellow to the selected track and batch.
            </DialogDescription>
          </DialogHeader>
          <form className="mt-5 grid gap-4" onSubmit={handleEnroll}>
            <Select
              required
              label="Fellow"
              value={form.fellowId}
              onChange={(event) => setForm({ ...form, fellowId: event.target.value })}
              disabled={isLoading}
            >
              <option value="">Select fellow</option>
              {fellows.map((fellow) => (
                <option key={fellow.id} value={fellow.id}>
                  {fellow.fullName} ({fellow.email})
                </option>
              ))}
            </Select>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Track"
                value={selectedTrackId}
                onChange={(event) => setSelectedTrackId(event.target.value)}
              >
                {tracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.title}
                  </option>
                ))}
              </Select>
              <Select
                required
                label="Batch"
                value={form.batchId}
                onChange={(event) => setForm({ ...form, batchId: event.target.value })}
              >
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSaving ? 'Creating...' : 'Create Enrollment'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
