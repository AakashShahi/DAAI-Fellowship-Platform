import { useEffect, useState } from 'react'
import {
  createTrack,
  deleteTrack,
  getTracks,
} from '../../services/fellowshipService'

const STATUSES = ['DRAFT', 'ACTIVE', 'ARCHIVED']

export default function AdminTracksPage() {
  const [tracks, setTracks] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    duration: '',
    difficulty: '',
    status: 'DRAFT',
  })

  const load = async () => {
    setError('')
    try {
      const data = await getTracks()
      setTracks(data)
    } catch {
      setError('Unable to load tracks.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      await createTrack(form)
      setForm({
        title: '',
        slug: '',
        description: '',
        duration: '',
        difficulty: '',
        status: 'DRAFT',
      })
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
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">
          Fellowship tracks
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#0f172a] lg:text-4xl">Tracks</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-[#475569]">
          Create catalog tracks. Batches are scheduled under each track, then fellows
          are enrolled into a track and batch pair.
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
        <h2 className="text-lg font-black text-[#0f172a]">Create track</h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleCreate}>
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
            Slug
            <input
              required
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="e.g. full-stack-2026"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </label>
          <label className="block text-sm font-bold text-[#0f172a] sm:col-span-2">
            Description
            <textarea
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label className="block text-sm font-bold text-[#0f172a]">
            Duration
            <input
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="12 weeks"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
          </label>
          <label className="block text-sm font-bold text-[#0f172a]">
            Difficulty
            <input
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="Intermediate"
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
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
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-[#4f46e5] px-5 py-2 text-sm font-black text-white hover:bg-[#4338ca] disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : 'Create track'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
        <h2 className="text-lg font-black text-[#0f172a]">All tracks</h2>
        {isLoading ? (
          <p className="mt-4 text-sm font-medium">Loading…</p>
        ) : tracks.length === 0 ? (
          <p className="mt-4 text-sm font-medium text-[#475569]">No tracks yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200">
            {tracks.map((t) => (
              <li
                key={t.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-black text-[#0f172a]">{t.title}</p>
                  <p className="text-xs font-bold uppercase text-[#4f46e5]">
                    {t.slug} · {t.status}
                  </p>
                  <p className="mt-1 text-sm text-[#475569]">{t.description}</p>
                  <p className="text-xs text-[#475569]">
                    {t.duration} · {t.difficulty}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(t.id)}
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
