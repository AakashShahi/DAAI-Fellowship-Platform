import { useEffect, useState } from 'react'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
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
  createLesson,
  deleteLesson,
  getLessonsAdmin,
  getModulesAdmin,
  updateLesson,
} from '../../services/learningService'

// Use the curriculum track values (not old Track ObjectIds)
const CURRICULUM_TRACKS = [
  { value: 'qa', label: 'QA' },
  { value: 'aws-practitioner', label: 'AWS Practitioner' },
  { value: 'aws-architect', label: 'AWS Architect' },
  { value: 'salesforce', label: 'Salesforce' },
]

const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED']
const emptyForm = {
  title: '',
  content: '',
  videoUrl: '',
  resourceUrl: '',
  order: 0,
  estimatedMinutes: 0,
  status: 'DRAFT',
}

export default function AdminLessonsPage() {
  const [trackValue, setTrackValue] = useState(CURRICULUM_TRACKS[0].value)
  const [modules, setModules] = useState([])
  const [moduleId, setModuleId] = useState('')
  const [lessons, setLessons] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLessonId, setEditingLessonId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const selectedModule = modules.find((module) => module.id === moduleId)

  const refreshLessons = async (id = moduleId) => {
    if (!id) {
      setLessons([])
      return
    }
    const list = await getLessonsAdmin({ moduleId: id })
    setLessons(list)
  }

  // Load modules for the selected track
  useEffect(() => {
    const run = async () => {
      setIsLoading(true)
      setError('')
      try {
        // Use the new admin/modules endpoint with curriculum track value
        const data = await getModulesAdmin(trackValue)
        setModules(data)
        setModuleId(data[0]?.id ?? '')
      } catch {
        setModules([])
        setModuleId('')
        setError('Failed to load modules for this track.')
      } finally {
        setIsLoading(false)
      }
    }
    run()
  }, [trackValue])

  useEffect(() => {
    const run = async () => {
      setError('')
      try {
        await refreshLessons(moduleId)
      } catch {
        setError('Failed to load lessons.')
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId])

  const handleSave = async (event) => {
    event.preventDefault()
    if (!moduleId) return
    setIsSaving(true)
    setError('')
    try {
      const payload = {
        title: form.title,
        content: form.content,
        videoUrl: form.videoUrl,
        resourceUrl: form.resourceUrl,
        moduleId,
        order: Number(form.order) || 0,
        estimatedDurationMinutes: Number(form.estimatedMinutes) || 0,
        isPublished: form.status === 'PUBLISHED',
        status: form.status,
      }
      
      if (editingLessonId) {
        await updateLesson(moduleId, editingLessonId, payload)
      } else {
        await createLesson(payload)
      }
      
      setForm(emptyForm)
      setEditingLessonId(null)
      setIsDialogOpen(false)
      await refreshLessons(moduleId)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : `Unable to ${editingLessonId ? 'update' : 'create'} lesson.`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenCreate = () => {
    setForm(emptyForm)
    setEditingLessonId(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (lesson) => {
    setForm({
      title: lesson.title || '',
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      resourceUrl: lesson.resourceLinks?.[0]?.url || '',
      order: lesson.order || 0,
      estimatedMinutes: lesson.estimatedMinutes || lesson.estimatedDurationMinutes || 0,
      status: lesson.status || (lesson.isPublished ? 'PUBLISHED' : 'DRAFT'),
    })
    setEditingLessonId(lesson.id)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lesson? No fellow progress may exist.')) return
    setError('')
    try {
      await deleteLesson(id)
      await refreshLessons(moduleId)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to delete lesson.')
    }
  }

  return (
    <section>
      <AdminPageHeader
        label="Lessons"
        title="Learning Lessons"
        description="Manage lessons, content, and learning materials."
        actions={
          <Button onClick={handleOpenCreate} disabled={!moduleId}>
            <Plus className="h-4 w-4" />
            Create Lesson
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Track"
            value={trackValue}
            onChange={(event) => setTrackValue(event.target.value)}
            disabled={isLoading}
          >
            {CURRICULUM_TRACKS.map((track) => (
              <option key={track.value} value={track.value}>
                {track.label}
              </option>
            ))}
          </Select>
          <Select
            label="Module"
            value={moduleId}
            onChange={(event) => setModuleId(event.target.value)}
            disabled={isLoading || modules.length === 0}
          >
            {modules.length === 0 ? (
              <option value="">No modules for this track</option>
            ) : (
              modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.order}. {module.title}
                </option>
              ))
            )}
          </Select>
        </div>
      </AdminPageHeader>

      {error ? <ErrorState message={error} onRetry={() => refreshLessons(moduleId)} /> : null}

      {isLoading ? (
        <LoadingState message="Loading lessons..." />
      ) : !moduleId || lessons.length === 0 ? (
        <EmptyState
          title="No lessons found."
          description="Create your first lesson for the selected module."
          action={
            <Button onClick={handleOpenCreate} disabled={!moduleId}>
              <Plus className="h-4 w-4" />
              Create Lesson
            </Button>
          }
        />
      ) : (
        <Card className="rounded-xl" padding={false}>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Lesson</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell>
                    <p className="font-semibold text-slate-900">
                      {lesson.order}. {lesson.title}
                    </p>
                  </TableCell>
                  <TableCell>{selectedModule?.title ?? 'Module'}</TableCell>
                  <TableCell>{lesson.videoUrl ? 'Video' : 'Reading'}</TableCell>
                  <TableCell>{lesson.estimatedMinutes ?? 0} min</TableCell>
                  <TableCell>
                    <StatusBadge status={lesson.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#4f46e5]"
                        onClick={() => handleOpenEdit(lesson)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(lesson.id)}
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

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && setIsDialogOpen(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLessonId ? 'Edit Lesson' : 'Create Lesson'}</DialogTitle>
            <DialogDescription>
              {editingLessonId ? 'Update lesson details.' : `Add a lesson under ${selectedModule?.title ?? 'the selected module'}.`}
            </DialogDescription>
          </DialogHeader>
          <form className="mt-5 space-y-4" onSubmit={handleSave}>
            <Input
              required
              label="Title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Content</span>
              <Textarea
                rows={6}
                value={form.content}
                onChange={(event) => setForm({ ...form, content: event.target.value })}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Video URL"
                value={form.videoUrl}
                onChange={(event) => setForm({ ...form, videoUrl: event.target.value })}
              />
              <Input
                label="Resource URL"
                value={form.resourceUrl}
                onChange={(event) => setForm({ ...form, resourceUrl: event.target.value })}
              />
              <Input
                type="number"
                min={0}
                label="Order"
                value={form.order}
                onChange={(event) => setForm({ ...form, order: event.target.value })}
              />
              <Input
                type="number"
                min={0}
                label="Est. minutes"
                value={form.estimatedMinutes}
                onChange={(event) => setForm({ ...form, estimatedMinutes: event.target.value })}
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
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !moduleId}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSaving ? 'Saving...' : editingLessonId ? 'Update Lesson' : 'Create Lesson'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
