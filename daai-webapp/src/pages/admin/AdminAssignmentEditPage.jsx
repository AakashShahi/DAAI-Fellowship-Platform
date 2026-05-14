import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteAssignment,
  getAssignmentAdmin,
  updateAssignment,
} from '../../services/assignmentService'
import { getTracks } from '../../services/fellowshipService'
import { getModulesAdmin } from '../../services/learningService'

const ASSIGNMENT_STATUSES = ['DRAFT', 'OPEN', 'CLOSED']

const toDateTimeLocalValue = (iso) => {
  if (!iso) {
    return ''
  }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return ''
  }
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AdminAssignmentEditPage() {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const [tracks, setTracks] = useState([])
  const [modules, setModules] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    instructions: '',
    trackId: '',
    moduleId: '',
    dueDate: '',
    maxScore: 100,
    status: 'DRAFT',
  })

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const t = await getTracks()
        setTracks(t)
      } catch {
        setError('Unable to load tracks.')
      }
    }
    loadTracks()
  }, [])

  useEffect(() => {
    const load = async () => {
      setError('')
      try {
        const a = await getAssignmentAdmin(assignmentId)
        setForm({
          title: a.title,
          description: a.description,
          instructions: a.instructions,
          trackId: a.trackId,
          moduleId: a.moduleId ?? '',
          dueDate: toDateTimeLocalValue(a.dueDate),
          maxScore: a.maxScore,
          status: a.status,
        })
        const m = await getModulesAdmin(a.trackId)
        setModules(m)
      } catch (err) {
        const detail = err?.response?.data?.detail
        setError(typeof detail === 'string' ? detail : 'Unable to load assignment.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [assignmentId])

  useEffect(() => {
    if (!form.trackId) {
      return
    }
    const run = async () => {
      try {
        const m = await getModulesAdmin(form.trackId)
        setModules(m)
      } catch {
        setModules([])
      }
    }
    run()
  }, [form.trackId])

  const handleSave = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      const payload = {
        title: form.title,
        description: form.description,
        instructions: form.instructions,
        trackId: form.trackId,
        maxScore: Number(form.maxScore) || 0,
        status: form.status,
        moduleId: form.moduleId || null,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      }
      await updateAssignment(assignmentId, payload)
      navigate('/admin/assignments')
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to save assignment.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this assignment and all submissions?')) {
      return
    }
    setError('')
    try {
      await deleteAssignment(assignmentId)
      navigate('/admin/assignments')
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to delete.')
    }
  }

  if (isLoading) {
    return (
      <section>
        <p className="text-sm font-medium text-[#6f5f57]">Loading assignment…</p>
      </section>
    )
  }

  return (
    <section>
      <Link className="text-sm font-bold text-[#f26322]" to="/admin/assignments">
        ← Back to assignments
      </Link>
      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-black text-[#24140e]">Edit assignment</h1>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <form
        className="max-w-3xl space-y-4 rounded-lg border border-orange-100 bg-white p-5 shadow-sm"
        onSubmit={handleSave}
      >
        <label className="block text-sm font-bold text-[#24140e]">
          Track
          <select
            required
            className="mt-1 w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
            value={form.trackId}
            onChange={(e) => setForm((f) => ({ ...f, trackId: e.target.value, moduleId: '' }))}
          >
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold text-[#24140e]">
          Module (optional)
          <select
            className="mt-1 w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
            value={form.moduleId}
            onChange={(e) => setForm((f) => ({ ...f, moduleId: e.target.value }))}
          >
            <option value="">Track-level (no module)</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold text-[#24140e]">
          Title
          <input
            required
            className="mt-1 w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </label>
        <label className="block text-sm font-bold text-[#24140e]">
          Description
          <textarea
            className="mt-1 min-h-[72px] w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </label>
        <label className="block text-sm font-bold text-[#24140e]">
          Instructions
          <textarea
            className="mt-1 min-h-[120px] w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
            value={form.instructions}
            onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
          />
        </label>
        <label className="block text-sm font-bold text-[#24140e]">
          Due date (optional)
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          />
        </label>
        <label className="block text-sm font-bold text-[#24140e]">
          Max score
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
            value={form.maxScore}
            onChange={(e) => setForm((f) => ({ ...f, maxScore: e.target.value }))}
          />
        </label>
        <label className="block text-sm font-bold text-[#24140e]">
          Status
          <select
            className="mt-1 w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            {ASSIGNMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-[#f26322] px-4 py-2 text-sm font-black text-white disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>
          <button
            type="button"
            className="rounded-md border border-red-200 px-4 py-2 text-sm font-black text-red-700"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </form>
    </section>
  )
}
