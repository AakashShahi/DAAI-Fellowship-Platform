import { useEffect, useState } from 'react'
import {
  createBatch,
  deleteBatch,
  getBatches,
  getTracks,
} from '../../services/fellowshipService'

const BATCH_STATUSES = ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']

const toIso = (localDateTime) => {
  if (!localDateTime) {
    return ''
  }
  const d = new Date(localDateTime)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString()
}

export default function AdminBatchesPage() {
  const [tracks, setTracks] = useState([])
  const [selectedTrackId, setSelectedTrackId] = useState('')
  const [batches, setBatches] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'PLANNED',
  })

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const data = await getTracks()
        setTracks(data)
        if (data[0]?.id) {
          setSelectedTrackId(data[0].id)
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
    if (!selectedTrackId) {
      return
    }
    const loadBatches = async () => {
      setError('')
      try {
        const data = await getBatches(selectedTrackId)
        setBatches(data)
      } catch {
        setError('Unable to load batches for this track.')
      }
    }
    loadBatches()
  }, [selectedTrackId])

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!selectedTrackId) {
      return
    }
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
      setForm({ name: '', startDate: '', endDate: '', status: 'PLANNED' })
      const data = await getBatches(selectedTrackId)
      setBatches(data)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to create batch.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this batch? It must have no enrollments.')) {
      return
    }
    setError('')
    try {
      await deleteBatch(id)
      const data = await getBatches(selectedTrackId)
      setBatches(data)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to delete batch.')
    }
  }

  return (
    <section>
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">
          Cohorts
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#0f172a] lg:text-4xl">Batches</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-[#475569]">
          Create a batch under a track, set schedule, then enroll fellows into that
          batch.
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mb-6">
        <label className="block text-sm font-bold text-[#0f172a]">
          Track
          <select
            className="mt-1 w-full max-w-md rounded-md border border-slate-200 px-3 py-2 text-sm sm:w-auto"
            value={selectedTrackId}
            onChange={(e) => setSelectedTrackId(e.target.value)}
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

      <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
        <h2 className="text-lg font-black text-[#0f172a]">Create batch</h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleCreate}>
          <label className="block text-sm font-bold text-[#0f172a] sm:col-span-2">
            Batch name
            <input
              required
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="block text-sm font-bold text-[#0f172a]">
            Start
            <input
              required
              type="datetime-local"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </label>
          <label className="block text-sm font-bold text-[#0f172a]">
            End
            <input
              required
              type="datetime-local"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </label>
          <label className="block text-sm font-bold text-[#0f172a]">
            Status
            <select
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {BATCH_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSaving || !selectedTrackId}
              className="rounded-md bg-[#4f46e5] px-5 py-2 text-sm font-black text-white hover:bg-[#4338ca] disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : 'Create batch'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
        <h2 className="text-lg font-black text-[#0f172a]">Batches for selected track</h2>
        {batches.length === 0 ? (
          <p className="mt-4 text-sm font-medium text-[#475569]">No batches yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200">
            {batches.map((b) => (
              <li
                key={b.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-black text-[#0f172a]">{b.name}</p>
                  <p className="text-xs font-bold uppercase text-[#4f46e5]">{b.status}</p>
                  <p className="mt-1 text-sm text-[#475569]">
                    {new Date(b.startDate).toLocaleString()} →{' '}
                    {new Date(b.endDate).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(b.id)}
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
