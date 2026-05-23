import { useEffect, useMemo, useState } from 'react'
import { Archive, Loader2, Plus, Settings, Trash2 } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/admin/AdminStates'
import StatusBadge from '../../components/admin/StatusBadge'
import Badge from '../../components/ui/Badge'
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
import Textarea from '../../components/ui/Textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table'
import {
  createTrack,
  deleteTrack,
  getTracks,
} from '../../services/fellowshipService'

const STATUSES = ['DRAFT', 'ACTIVE', 'ARCHIVED']
const emptyForm = {
  title: '',
  slug: '',
  description: '',
  duration: '',
  difficulty: '',
  status: 'DRAFT',
}

export default function AdminTracksPage() {
  const [tracks, setTracks] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [form, setForm] = useState(emptyForm)

  const filteredTracks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return tracks.filter((track) => {
      const matchesStatus = !statusFilter || track.status === statusFilter
      const matchesSearch =
        !normalizedSearch ||
        [track.title, track.slug, track.duration, track.difficulty]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter, tracks])

  const load = async () => {
    setError('')
    setIsLoading(true)
    try {
      const data = await getTracks()
      setTracks(data)
    } catch {
      setError('Failed to load tracks.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  const handleCreate = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      await createTrack(form)
      setForm(emptyForm)
      setIsDialogOpen(false)
      await load()
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to create track. Check slug is unique.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this track? Batches must be removed first.')) {
      return
    }
    setError('')
    try {
      await deleteTrack(id)
      await load()
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to delete track.')
    }
  }

  return (
    <section>
      <AdminPageHeader
        label="Fellowship Tracks"
        title="Tracks"
        description="Create and manage learning tracks for fellowship pathways."
        actions={
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Track
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, slug, duration"
            label="Search"
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </AdminPageHeader>

      {error ? <ErrorState message={error} onRetry={load} /> : null}

      {isLoading ? (
        <LoadingState message="Loading tracks..." />
      ) : filteredTracks.length === 0 ? (
        <EmptyState
          title="No tracks found."
          description="Create your first track to organize fellowship pathways."
          action={
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Track
            </Button>
          }
        />
      ) : (
        <Card className="rounded-xl" padding={false}>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Track title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTracks.map((track) => (
                <TableRow key={track.id}>
                  <TableCell>
                    <p className="font-semibold text-slate-900">{track.title}</p>
                    {track.description ? (
                      <p className="mt-1 max-w-md text-xs text-slate-500">
                        {track.description}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge tone="primary">{track.slug}</Badge>
                  </TableCell>
                  <TableCell>{track.duration || 'Not set'}</TableCell>
                  <TableCell>{track.difficulty || 'Not set'}</TableCell>
                  <TableCell>
                    <StatusBadge status={track.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" disabled>
                        <Settings className="h-4 w-4" />
                        Manage
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(track.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Track</DialogTitle>
            <DialogDescription>
              Add a new learning track without leaving the track list.
            </DialogDescription>
          </DialogHeader>
          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleCreate}>
            <Input
              required
              label="Title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
            <Input
              required
              label="Slug"
              placeholder="e.g. full-stack-2026"
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
            />
            <Textarea
              label="Description"
              className="sm:col-span-2"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
            <Input
              label="Duration"
              placeholder="12 weeks"
              value={form.duration}
              onChange={(event) => setForm({ ...form, duration: event.target.value })}
            />
            <Input
              label="Difficulty"
              placeholder="Intermediate"
              value={form.difficulty}
              onChange={(event) => setForm({ ...form, difficulty: event.target.value })}
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
            <div className="flex items-end justify-end gap-3 sm:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="hidden h-4 w-4" />}
                {isSaving ? 'Creating...' : 'Create Track'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
