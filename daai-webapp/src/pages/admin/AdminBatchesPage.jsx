import { useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
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
import {
  createBatch,
  deleteBatch,
  getBatches,
  getTracks,
} from '../../services/fellowshipService'

const BATCH_STATUSES = ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']
const emptyForm = { name: '', startDate: '', endDate: '', status: 'PLANNED' }

const toIso = (localDateTime) => {
  if (!localDateTime) return ''
  const date = new Date(localDateTime)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : 'Not set'

export default function AdminBatchesPage() {
  const [tracks, setTracks] = useState([])
  const [selectedTrackId, setSelectedTrackId] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [batches, setBatches] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const selectedTrack = tracks.find((track) => track.id === selectedTrackId)
  const filteredBatches = useMemo(
    () =>
      batches.filter((batch) => !statusFilter || batch.status === statusFilter),
    [batches, statusFilter],
  )

  const loadBatches = async (trackId = selectedTrackId) => {
    if (!trackId) {
      setBatches([])
      return
    }
    setError('')
    try {
      const data = await getBatches(trackId)
      setBatches(data)
    } catch {
      setError('Failed to load batches.')
    }
  }

  useEffect(() => {
    const loadTracks = async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await getTracks()
        setTracks(data)
        if (data[0]?.id) {
          setSelectedTrackId(data[0].id)
        }
      } catch {
        setError('Failed to load tracks.')
      } finally {
        setIsLoading(false)
      }
    }
    loadTracks()
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBatches(selectedTrackId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrackId])

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!selectedTrackId) return
    setIsSaving(true)
    setError('')
    const startDate = toIso(form.startDate)
    const endDate = toIso(form.endDate)
    if (!startDate || !endDate) {
      setError('Start and end date/time are required.')
      setIsSaving(false)
      return
    }
    try {
      await createBatch({
        name: form.name,
        trackId: selectedTrackId,
        startDate,
        endDate,
        status: form.status,
      })
      setForm(emptyForm)
      setIsDialogOpen(false)
      await loadBatches(selectedTrackId)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to create batch.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this batch? It must have no enrollments.')) return
    setError('')
    try {
      await deleteBatch(id)
      await loadBatches(selectedTrackId)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to delete batch.')
    }
  }

  return (
    <section>
      <AdminPageHeader
        label="Batches"
        title="Program Batches"
        description="Manage batches under tracks and cohorts."
        actions={
          <Button onClick={() => setIsDialogOpen(true)} disabled={!selectedTrackId}>
            <Plus className="h-4 w-4" />
            Create Batch
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Track"
            value={selectedTrackId}
            onChange={(event) => setSelectedTrackId(event.target.value)}
            disabled={isLoading}
          >
            {tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.title}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">All statuses</option>
            {BATCH_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </AdminPageHeader>

      {error ? <ErrorState message={error} onRetry={() => loadBatches(selectedTrackId)} /> : null}

      {isLoading ? (
        <LoadingState message="Loading batches..." />
      ) : filteredBatches.length === 0 ? (
        <EmptyState
          title="No batches found."
          description="Create your first batch for the selected track."
          action={
            <Button onClick={() => setIsDialogOpen(true)} disabled={!selectedTrackId}>
              <Plus className="h-4 w-4" />
              Create Batch
            </Button>
          }
        />
      ) : (
        <Card className="rounded-xl" padding={false}>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Batch name</TableHead>
                <TableHead>Track</TableHead>
                <TableHead>Cohort</TableHead>
                <TableHead>Start date</TableHead>
                <TableHead>End date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBatches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-semibold text-slate-900">{batch.name}</TableCell>
                  <TableCell>{batch.track?.title ?? selectedTrack?.title ?? 'Track'}</TableCell>
                  <TableCell>{batch.cohort?.name ?? batch.cohortName ?? 'Not assigned'}</TableCell>
                  <TableCell>{formatDate(batch.startDate)}</TableCell>
                  <TableCell>{formatDate(batch.endDate)}</TableCell>
                  <TableCell>
                    <StatusBadge status={batch.status} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(batch.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Batch</DialogTitle>
            <DialogDescription>
              Add a scheduled batch for {selectedTrack?.title ?? 'the selected track'}.
            </DialogDescription>
          </DialogHeader>
          <form className="mt-5 grid gap-4" onSubmit={handleCreate}>
            <Input
              required
              label="Batch name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                required
                type="datetime-local"
                label="Start"
                value={form.startDate}
                onChange={(event) => setForm({ ...form, startDate: event.target.value })}
              />
              <Input
                required
                type="datetime-local"
                label="End"
                value={form.endDate}
                onChange={(event) => setForm({ ...form, endDate: event.target.value })}
              />
            </div>
            <Select
              label="Status"
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
            >
              {BATCH_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !selectedTrackId}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSaving ? 'Creating...' : 'Create Batch'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
