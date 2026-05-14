import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createAssignment,
  deleteAssignment,
  getAssignmentsAdmin,
} from '../../services/assignmentService'
import { getTracks } from '../../services/fellowshipService'
import { getModulesAdmin } from '../../services/learningService'

const ASSIGNMENT_STATUSES = ['DRAFT', 'OPEN', 'CLOSED']

export default function AdminAssignmentsPage() {
  const [tracks, setTracks] = useState([])
  const [trackId, setTrackId] = useState('')
  const [modules, setModules] = useState([])
  const [moduleId, setModuleId] = useState('')
  const [assignments, setAssignments] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    maxScore: 100,
    status: 'DRAFT',
  })

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const t = await getTracks()
        setTracks(t)
        if (t[0]?.id) {
          setTrackId(t[0].id)
        }
      } catch {
        setError('Unable to load tracks.')
      } finally {
        setIsLoading(false)
      }
    }
    loadTracks()
  }, [])

  useEffect(() => {
    if (!trackId) {
      return
    }
    const run = async () => {
      try {
        const m = await getModulesAdmin(trackId)
        setModules(m)
        setModuleId('')
      } catch {
        setModules([])
        setModuleId('')
      }
    }
    run()
  }, [trackId])

  const refreshAssignments = useCallback(async () => {
    if (!trackId) {
      setAssignments([])
      return
    }
    const params = { trackId }
    if (moduleId) {
      params.moduleId = moduleId
    }
    const list = await getAssignmentsAdmin(params)
    setAssignments(list)
  }, [trackId, moduleId])

  useEffect(() => {
    if (!trackId) {
      return
    }
    const run = async () => {
      setError('')
      try {
        await refreshAssignments()
      } catch {
        setError('Unable to load assignments.')
      }
    }
    run()
  }, [trackId, moduleId, refreshAssignments])

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!trackId) {
      return
    }
    setIsSaving(true)
    setError('')
    try {
      const payload = {
        title: form.title,
        description: form.description,
        instructions: form.instructions,
        trackId,
        maxScore: Number(form.maxScore) || 0,
        status: form.status,
      }
      if (moduleId) {
        payload.moduleId = moduleId
      }
      if (form.dueDate) {
        payload.dueDate = new Date(form.dueDate).toISOString()
      }
      await createAssignment(payload)
      setForm({
        title: '',
        description: '',
        instructions: '',
        dueDate: '',
        maxScore: 100,
        status: 'DRAFT',
      })
      await refreshAssignments()
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to create assignment.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment and all submissions?')) {
      return
    }
    setError('')
    try {
      await deleteAssignment(id)
      await refreshAssignments()
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to delete assignment.')
    }
  }

  return (
    <section>
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
          Fellowship coursework
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#24140e] lg:text-4xl">Assignments</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-[#6f5f57]">
          Create assignments for each track. Fellows only see work for their enrolled track.
          Open assignments accept submissions; close them when the window ends.
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-4">
        <label className="block text-sm font-bold text-[#24140e]">
          Track
          <select
            className="mt-1 block w-64 rounded-md border border-orange-100 px-3 py-2 text-sm"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            disabled={isLoading}
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
            className="mt-1 block w-64 rounded-md border border-orange-100 px-3 py-2 text-sm"
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
          >
            <option value="">Track-level (no module)</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-10 rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-[#24140e]">New assignment</h2>
        <form className="mt-4 grid gap-4 lg:grid-cols-2" onSubmit={handleCreate}>
          <label className="block text-sm font-bold text-[#24140e] lg:col-span-2">
            Title
            <input
              required
              className="mt-1 w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </label>
          <label className="block text-sm font-bold text-[#24140e] lg:col-span-2">
            Description
            <textarea
              className="mt-1 min-h-[72px] w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
          <label className="block text-sm font-bold text-[#24140e] lg:col-span-2">
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
          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={isSaving || !trackId}
              className="rounded-md bg-[#f26322] px-4 py-2 text-sm font-black text-white disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : 'Create assignment'}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-black text-[#24140e]">Existing assignments</h2>
        {isLoading ? (
          <p className="mt-4 text-sm text-[#6f5f57]">Loading…</p>
        ) : !trackId ? (
          <p className="mt-4 text-sm text-[#6f5f57]">Select a track to see assignments.</p>
        ) : assignments.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-orange-200 bg-[#fffaf6] p-4 text-sm text-[#6f5f57]">
            No assignments for this filter yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-orange-100 rounded-lg border border-orange-100 bg-white">
            {assignments.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-black text-[#24140e]">{a.title}</p>
                  <p className="text-xs font-medium text-[#6f5f57]">
                    {a.status}
                    {a.dueDate
                      ? ` · Due ${new Date(a.dueDate).toLocaleString()}`
                      : ''}{' '}
                    · Max {a.maxScore}
                    {a.moduleId ? ` · Module ${a.moduleId}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    className="rounded-md border border-orange-200 px-3 py-1 text-xs font-black text-[#f26322]"
                    to={`/admin/assignments/${a.id}`}
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="rounded-md border border-red-200 px-3 py-1 text-xs font-black text-red-700"
                    onClick={() => handleDelete(a.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
