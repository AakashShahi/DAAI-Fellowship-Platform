import { useEffect, useState } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/admin/AdminStates'
import StatusBadge from '../../components/admin/StatusBadge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/Dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table'
import { getAnnouncementsAdmin, createAnnouncement, deleteAnnouncement } from '../../services/announcementService'

const AUDIENCE_OPTIONS = ['ALL', 'FELLOW', 'INSTRUCTOR', 'HR']

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [form, setForm] = useState({
    title: '',
    content: '',
    audience: 'ALL',
    is_published: true,
  })

  const loadAnnouncements = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getAnnouncementsAdmin()
      setAnnouncements(data)
    } catch (err) {
      setError('Failed to load announcements.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      await createAnnouncement(form)
      setForm({ title: '', content: '', audience: 'ALL', is_published: true })
      setIsDialogOpen(false)
      loadAnnouncements()
    } catch (err) {
      setError('Unable to create announcement.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return
    try {
      await deleteAnnouncement(id)
      loadAnnouncements()
    } catch (err) {
      alert('Failed to delete announcement.')
    }
  }

  return (
    <section>
      <AdminPageHeader
        label="Announcements"
        title="Announcements"
        description="Publish updates and notices for fellows and staff."
        actions={
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Announcement
          </Button>
        }
      />

      {error && <ErrorState message={error} onRetry={loadAnnouncements} />}

      {isLoading ? (
        <LoadingState message="Loading announcements..." />
      ) : announcements.length === 0 ? (
        <Card className="rounded-xl" padding={false}>
          <div className="p-8">
            <EmptyState
              title="No announcements found."
              description="Click 'Create Announcement' to broadcast a message to the platform."
            />
          </div>
        </Card>
      ) : (
        <Card className="rounded-xl overflow-hidden" padding={false}>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Title</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map((ann) => (
                <TableRow key={ann.id}>
                  <TableCell>
                    <p className="font-semibold text-slate-900">{ann.title}</p>
                    <p className="text-xs text-slate-500 truncate max-w-sm">{ann.content}</p>
                  </TableCell>
                  <TableCell>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                      {ann.audience}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ann.is_published ? 'PUBLISHED' : 'DRAFT'} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-500">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(ann.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
            <DialogDescription>
              Broadcast a message to users across the platform.
            </DialogDescription>
          </DialogHeader>
          <form className="mt-5 space-y-4" onSubmit={handleCreate}>
            <Input
              required
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Message Content</span>
              <Textarea
                rows={4}
                required
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Target Audience"
                value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value })}
              >
                {AUDIENCE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'ALL' ? 'Everyone' : opt}
                  </option>
                ))}
              </Select>
              <Select
                label="Status"
                value={form.is_published ? 'PUBLISHED' : 'DRAFT'}
                onChange={(e) => setForm({ ...form, is_published: e.target.value === 'PUBLISHED' })}
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSaving ? 'Publishing...' : 'Publish Announcement'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
