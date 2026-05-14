import { useEffect, useState } from 'react'
import { getTracks } from '../../services/fellowshipService'
import { createModule, deleteModule, getModulesAdmin } from '../../services/learningService'

const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED']

export default function AdminModulesPage() {
  const [tracks, setTracks] = useState([])
  const [trackId, setTrackId] = useState('')
  const [modules, setModules] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    order: 0,
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

  const refreshModules = async () => {
    if (!trackId) {
      return
    }
    const m = await getModulesAdmin(trackId)
    setModules(m)
  }

  useEffect(() => {
    if (!trackId) {
      return
    }
    const run = async () => {
      setError('')
      try {
        await refreshModules()
      } catch {
        setError('Unable to load modules.')
      }
    }
    run()
  }, [trackId])

  const handleCreate = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      await createModule({
        title: form.title,
        description: form.description,
        trackId,
        order: Number(form.order) || 0,
        status: form.status,
      })
      setForm({ title: '', description: '', order: 0, status: 'DRAFT' })
      await refreshModules()
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to create module.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this module? It must have no lessons.')) {
      return
    }
    setError('')
    try {
      await deleteModule(id)
      await refreshModules()
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to delete module.')
    }
  }

  return (
    <section>
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
          Course structure
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#24140e] lg:text-4xl">Modules</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-[#6f5f57]">
          Add ordered modules under each catalog track. Publish modules when content is
          ready for fellows.
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mb-6">
        <label className="block text-sm font-bold text-[#24140e]">
          Track
          <select
            className="mt-1 w-full max-w-md rounded-md border border-orange-100 px-3 py-2 text-sm"
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
      </div>

      <div className="mb-8 rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
        <h2 className="text-lg font-black text-[#24140e]">Create module</h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleCreate}>
          <label className="block text-sm font-bold text-[#24140e] sm:col-span-2">
            Title
            <input
              required
              className="mt-1 w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label className="block text-sm font-bold text-[#24140e] sm:col-span-2">
            Description
            <textarea
              className="mt-1 w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label className="block text-sm font-bold text-[#24140e]">
            Order
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />
          </label>
          <label className="block text-sm font-bold text-[#24140e]">
            Status
            <select
              className="mt-1 w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
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
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSaving || !trackId}
              className="rounded-md bg-[#f26322] px-5 py-2 text-sm font-black text-white hover:bg-[#d94f13] disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : 'Create module'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
        <h2 className="text-lg font-black text-[#24140e]">Modules for selected track</h2>
        {modules.length === 0 ? (
          <p className="mt-4 text-sm font-medium text-[#6f5f57]">No modules yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-orange-100">
            {modules.map((m) => (
              <li
                key={m.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-black text-[#24140e]">
                    {m.order}. {m.title}
                  </p>
                  <p className="text-xs font-bold uppercase text-[#f26322]">{m.status}</p>
                  <p className="mt-1 text-sm text-[#6f5f57]">{m.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  className="self-start rounded-md border border-orange-100 px-3 py-1 text-xs font-black text-[#b91c1c] hover:bg-red-50"
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
