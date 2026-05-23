import { useEffect, useState } from 'react'
import { getTracks } from '../../services/fellowshipService'
import {
  createLesson,
  deleteLesson,
  getLessonsAdmin,
  getModulesAdmin,
} from '../../services/learningService'

const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED']

export default function AdminLessonsPage() {
  const [tracks, setTracks] = useState([])
  const [trackId, setTrackId] = useState('')
  const [modules, setModules] = useState([])
  const [moduleId, setModuleId] = useState('')
  const [lessons, setLessons] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    videoUrl: '',
    resourceUrl: '',
    order: 0,
    estimatedMinutes: 0,
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
        setModuleId(m[0]?.id ?? '')
      } catch {
        setModules([])
        setModuleId('')
      }
    }
    run()
  }, [trackId])

  const refreshLessons = async () => {
    if (!moduleId) {
      setLessons([])
      return
    }
    const list = await getLessonsAdmin({ moduleId })
    setLessons(list)
  }

  useEffect(() => {
    if (!moduleId) {
      return
    }
    const run = async () => {
      setError('')
      try {
        await refreshLessons()
      } catch {
        setError('Unable to load lessons.')
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId])

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!moduleId) {
      return
    }
    setIsSaving(true)
    setError('')
    try {
      await createLesson({
        title: form.title,
        content: form.content,
        videoUrl: form.videoUrl,
        resourceUrl: form.resourceUrl,
        moduleId,
        order: Number(form.order) || 0,
        estimatedMinutes: Number(form.estimatedMinutes) || 0,
        status: form.status,
      })
      setForm({
        title: '',
        content: '',
        videoUrl: '',
        resourceUrl: '',
        order: 0,
        estimatedMinutes: 0,
        status: 'DRAFT',
      })
      await refreshLessons()
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to create lesson.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lesson? No fellow progress may exist.')) {
      return
    }
    setError('')
    try {
      await deleteLesson(id)
      await refreshLessons()
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to delete lesson.')
    }
  }

  return (
    <section>
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">
          Course content
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#0f172a] lg:text-4xl">Lessons</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-[#475569]">
          Create lessons under a module. Fellows only see published lessons for their
          enrolled track.
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-4">
        <label className="block text-sm font-bold text-[#0f172a]">
          Track
          <select
            className="mt-1 block w-56 rounded-md border border-slate-200 px-3 py-2 text-sm"
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
        <label className="block text-sm font-bold text-[#0f172a]">
          Module
          <select
            className="mt-1 block w-56 rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
          >
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.order}. {m.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
        <h2 className="text-lg font-black text-[#0f172a]">Create lesson</h2>
        <form className="mt-4 space-y-4" onSubmit={handleCreate}>
          <label className="block text-sm font-bold text-[#0f172a]">
            Title
            <input
              required
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label className="block text-sm font-bold text-[#0f172a]">
            Content
            <textarea
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              rows={8}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-[#0f172a]">
              Video URL
              <input
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              />
            </label>
            <label className="block text-sm font-bold text-[#0f172a]">
              Resource URL
              <input
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={form.resourceUrl}
                onChange={(e) => setForm({ ...form, resourceUrl: e.target.value })}
              />
            </label>
            <label className="block text-sm font-bold text-[#0f172a]">
              Order
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
              />
            </label>
            <label className="block text-sm font-bold text-[#0f172a]">
              Est. minutes
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={form.estimatedMinutes}
                onChange={(e) => setForm({ ...form, estimatedMinutes: e.target.value })}
              />
            </label>
            <label className="block text-sm font-bold text-[#0f172a]">
              Status
              <select
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="submit"
            disabled={isSaving || !moduleId}
            className="rounded-md bg-[#4f46e5] px-5 py-2 text-sm font-black text-white hover:bg-[#4338ca] disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Create lesson'}
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
        <h2 className="text-lg font-black text-[#0f172a]">Lessons in selected module</h2>
        {!moduleId ? (
          <p className="mt-4 text-sm text-[#475569]">Select a module with lessons.</p>
        ) : lessons.length === 0 ? (
          <p className="mt-4 text-sm text-[#475569]">No lessons yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200">
            {lessons.map((lesson) => (
              <li
                key={lesson.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-black text-[#0f172a]">
                    {lesson.order}. {lesson.title}
                  </p>
                  <p className="text-xs font-bold uppercase text-[#4f46e5]">
                    {lesson.status} · ~{lesson.estimatedMinutes} min
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(lesson.id)}
                  className="self-start rounded-md border border-slate-200 px-3 py-1 text-xs font-black text-[#b91c1c] hover:bg-red-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
