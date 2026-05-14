import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTracks } from '../../services/fellowshipService'
import { getSubmissionsStaff } from '../../services/submissionService'

const STATUSES = ['', 'SUBMITTED', 'REVIEWED', 'NEEDS_REVISION']

export default function MentorSubmissionsPage() {
  const [tracks, setTracks] = useState([])
  const [trackId, setTrackId] = useState('')
  const [status, setStatus] = useState('')
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

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
    const run = async () => {
      setError('')
      try {
        const params = {}
        if (trackId) {
          params.trackId = trackId
        }
        if (status) {
          params.status = status
        }
        const list = await getSubmissionsStaff(params)
        setRows(list)
      } catch (err) {
        const detail = err?.response?.data?.detail
        setError(typeof detail === 'string' ? detail : 'Unable to load submissions.')
      }
    }
    run()
  }, [trackId, status])

  return (
    <section>
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
          Mentoring
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#24140e] lg:text-4xl">Submissions</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-[#6f5f57]">
          Review fellow submissions and leave feedback for your cohort.
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
            className="mt-1 block w-56 rounded-md border border-orange-100 px-3 py-2 text-sm"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
          >
            <option value="">All tracks</option>
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold text-[#24140e]">
          Status
          <select
            className="mt-1 block w-56 rounded-md border border-orange-100 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            {STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading ? (
        <p className="text-sm text-[#6f5f57]">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-orange-200 bg-[#fffaf6] p-4 text-sm text-[#6f5f57]">
          No submissions match these filters yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-orange-100 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#fffaf6] text-xs font-black uppercase text-[#6f5f57]">
              <tr>
                <th className="px-4 py-3">Assignment</th>
                <th className="px-4 py-3">Fellow</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-bold text-[#24140e]">{r.assignmentTitle}</td>
                  <td className="px-4 py-3 text-[#6f5f57]">
                    {r.fellowName}
                    <div className="text-xs">{r.fellowEmail}</div>
                  </td>
                  <td className="px-4 py-3">{r.status}</td>
                  <td className="px-4 py-3">{r.score ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-[#6f5f57]">
                    {new Date(r.submittedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      className="font-black text-[#f26322]"
                      to={`/mentor/submissions/${r.id}`}
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
