import { useEffect, useState } from 'react'
import {
  createEnrollment,
  getBatches,
  getEnrollments,
  getFellowsForAdmin,
  getTracks,
  updateEnrollment,
} from '../../services/fellowshipService'

const ENROLLMENT_STATUSES = ['ACTIVE', 'COMPLETED', 'WITHDRAWN']

export default function AdminEnrollmentsPage() {
  const [fellows, setFellows] = useState([])
  const [tracks, setTracks] = useState([])
  const [selectedTrackId, setSelectedTrackId] = useState('')
  const [batches, setBatches] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    fellowId: '',
    batchId: '',
  })

  useEffect(() => {
    const boot = async () => {
      setError('')
      try {
        const [fList, tList, eList] = await Promise.all([
          getFellowsForAdmin(),
          getTracks(),
          getEnrollments(),
        ])
        setFellows(fList)
        setTracks(tList)
        setEnrollments(eList)
        if (tList[0]?.id) {
          setSelectedTrackId(tList[0].id)
        }
      } catch {
        setError('Unable to load enrollment data.')
      } finally {
        setIsLoading(false)
      }
    }
    boot()
  }, [])

  useEffect(() => {
    if (!selectedTrackId) {
      return
    }
    const loadBatches = async () => {
      try {
        const data = await getBatches(selectedTrackId)
        setBatches(data)
        setForm((f) => ({ ...f, batchId: data[0]?.id ?? '' }))
      } catch {
        setBatches([])
      }
    }
    loadBatches()
  }, [selectedTrackId])

  const refreshEnrollments = async () => {
    const eList = await getEnrollments()
    setEnrollments(eList)
  }

  const handleEnroll = async (event) => {
    event.preventDefault()
    if (!form.fellowId || !selectedTrackId || !form.batchId) {
      setError('Select fellow, track, and batch.')
      return
    }
    setIsSaving(true)
    setError('')
    try {
      await createEnrollment({
        fellowId: form.fellowId,
        trackId: selectedTrackId,
        batchId: form.batchId,
      })
      await refreshEnrollments()
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to create enrollment.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (enrollmentId, status) => {
    setError('')
    try {
      await updateEnrollment(enrollmentId, { status })
      await refreshEnrollments()
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to update enrollment.')
    }
  }

  return (
    <section>
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
          Program roster
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#24140e] lg:text-4xl">
          Enrollments
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-[#6f5f57]">
          Assign a fellow to exactly one track and batch. A fellow may only have one
          active enrollment at a time.
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mb-8 rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
        <h2 className="text-lg font-black text-[#24140e]">Enroll fellow</h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleEnroll}>
          <label className="block text-sm font-bold text-[#24140e] sm:col-span-2">
            Fellow
            <select
              required
              className="mt-1 w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
              value={form.fellowId}
              onChange={(e) => setForm({ ...form, fellowId: e.target.value })}
              disabled={isLoading}
            >
              <option value="">Select fellow</option>
              {fellows.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.fullName} ({f.email})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold text-[#24140e]">
            Track
            <select
              className="mt-1 w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
              value={selectedTrackId}
              onChange={(e) => setSelectedTrackId(e.target.value)}
            >
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold text-[#24140e]">
            Batch
            <select
              required
              className="mt-1 w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
              value={form.batchId}
              onChange={(e) => setForm({ ...form, batchId: e.target.value })}
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-[#f26322] px-5 py-2 text-sm font-black text-white hover:bg-[#d94f13] disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : 'Create enrollment'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
        <h2 className="text-lg font-black text-[#24140e]">Recent enrollments</h2>
        {enrollments.length === 0 ? (
          <p className="mt-4 text-sm font-medium text-[#6f5f57]">No enrollments yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-orange-100">
            {enrollments.map((e) => (
              <li key={e.id} className="py-4">
                <p className="font-black text-[#24140e]">
                  {e.track.title} · {e.batch.name}
                </p>
                <p className="text-xs text-[#6f5f57]">
                  Fellow ID {e.fellowId} · {e.status} · enrolled{' '}
                  {new Date(e.enrolledAt).toLocaleString()}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ENROLLMENT_STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={s === e.status}
                      onClick={() => handleStatusChange(e.id, s)}
                      className="rounded-md border border-orange-100 px-2 py-1 text-xs font-bold text-[#6f5f57] hover:bg-[#fff1e8] disabled:opacity-40"
                    >
                      Mark {s}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
