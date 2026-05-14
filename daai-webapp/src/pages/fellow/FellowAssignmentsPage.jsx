import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFellowAssignments } from '../../services/assignmentService'

const statusLabel = (row) => {
  if (!row.submissionStatus) {
    return 'Not submitted'
  }
  if (row.submissionStatus === 'SUBMITTED') {
    return 'Submitted · awaiting review'
  }
  if (row.submissionStatus === 'NEEDS_REVISION') {
    return 'Needs revision'
  }
  if (row.submissionStatus === 'REVIEWED') {
    return row.score != null ? `Reviewed · score ${row.score}` : 'Reviewed'
  }
  return row.submissionStatus
}

export default function FellowAssignmentsPage() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      setError('')
      try {
        const list = await getFellowAssignments()
        setRows(list)
      } catch (err) {
        const detail = err?.response?.data?.detail
        setError(typeof detail === 'string' ? detail : 'Unable to load assignments.')
      } finally {
        setIsLoading(false)
      }
    }
    run()
  }, [])

  return (
    <section className="px-1">
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
          Coursework
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#24140e] lg:text-4xl">Assignments</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-[#6f5f57]">
          You only see assignments for your enrolled fellowship track. Submit while an
          assignment is open.
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-[#6f5f57]">Loading assignments…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-orange-200 bg-[#fffaf6] p-6 text-sm text-[#6f5f57]">
          <p className="font-bold text-[#24140e]">No assignments yet</p>
          <p className="mt-2">
            When you are enrolled in a track, staff-published assignments appear here.
          </p>
          <Link className="mt-3 inline-block text-sm font-black text-[#f26322]" to="/fellow/my-track">
            Check enrollment
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-orange-100 rounded-lg border border-orange-100 bg-white">
          {rows.map((a) => (
            <li key={a.id} className="px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black text-[#24140e]">{a.title}</p>
                  <p className="mt-1 text-xs font-medium text-[#6f5f57]">
                    {a.status === 'OPEN' ? 'Open' : 'Closed'}
                    {a.dueDate ? ` · Due ${new Date(a.dueDate).toLocaleString()}` : ''} · Max{' '}
                    {a.maxScore}
                  </p>
                  <p className="mt-2 text-sm text-[#6f5f57]">{statusLabel(a)}</p>
                </div>
                <Link
                  className="shrink-0 rounded-md border border-orange-200 px-3 py-1 text-xs font-black text-[#f26322]"
                  to={`/fellow/assignments/${a.id}`}
                >
                  View / submit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-sm">
        <Link className="font-bold text-[#f26322]" to="/fellow/assignments/submissions">
          My submission status
        </Link>
      </p>
    </section>
  )
}
