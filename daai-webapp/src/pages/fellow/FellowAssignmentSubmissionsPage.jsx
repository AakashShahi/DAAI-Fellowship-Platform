import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFellowMySubmissions } from '../../services/submissionService'

export default function FellowAssignmentSubmissionsPage() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      setError('')
      try {
        const list = await getFellowMySubmissions()
        setRows(list)
      } catch (err) {
        const detail = err?.response?.data?.detail
        setError(typeof detail === 'string' ? detail : 'Unable to load submissions.')
      } finally {
        setIsLoading(false)
      }
    }
    run()
  }, [])

  return (
    <section className="px-1">
      <Link className="text-sm font-bold text-[#f26322]" to="/fellow/assignments">
        ← Assignments
      </Link>
      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-black text-[#24140e]">My submission status</h1>
        <p className="mt-2 text-sm text-[#6f5f57]">
          Scores and feedback appear after staff review.
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-[#6f5f57]">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-orange-200 bg-[#fffaf6] p-5 text-sm text-[#6f5f57]">
          You have not submitted any assignments yet.
        </p>
      ) : (
        <ul className="divide-y divide-orange-100 rounded-lg border border-orange-100 bg-white">
          {rows.map((r) => (
            <li key={r.id} className="px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black text-[#24140e]">{r.assignmentTitle}</p>
                  <p className="mt-1 text-xs text-[#6f5f57]">
                    {r.status} · Submitted {new Date(r.submittedAt).toLocaleString()}
                  </p>
                  {r.status === 'REVIEWED' ? (
                    <p className="mt-2 text-sm text-[#24140e]">
                      Score: {r.score != null ? r.score : '—'}
                    </p>
                  ) : null}
                  {r.feedback ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[#6f5f57]">{r.feedback}</p>
                  ) : null}
                </div>
                <Link
                  className="shrink-0 text-xs font-black text-[#f26322]"
                  to={`/fellow/assignments/${r.assignmentId}`}
                >
                  Open assignment
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
