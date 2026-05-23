import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SubmissionStatusBadge from '../../components/assignments/SubmissionStatusBadge'
import { getFellowSubmissions } from '../../services/assignmentService'

export default function FellowAssignmentSubmissionsPage() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getFellowSubmissions()
      .then(setRows)
      .catch((err) => setError(typeof err?.response?.data?.detail === 'string' ? err.response.data.detail : 'Unable to load submissions.'))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <section>
      <h1 className="text-3xl font-black text-[#24140e]">My Submissions</h1>
      {error ? <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
      {isLoading ? <p className="mt-5 text-sm font-bold">Loading submissions...</p> : rows.length === 0 ? <p className="mt-5 rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold">No submissions yet.</p> : (
        <div className="mt-5 grid gap-3">
          {rows.map((row) => (
            <article key={row.id} className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-black text-[#24140e]">{row.assignmentTitle}</h2>
                  <p className="mt-1 text-sm font-medium text-[#6f5f57]">Submitted {new Date(row.submittedAt).toLocaleString()}</p>
                </div>
                <SubmissionStatusBadge status={row.status} />
              </div>
              <p className="mt-3 text-sm font-bold text-[#24140e]">Marks: {row.marksObtained ?? '—'}</p>
              {row.feedback ? <p className="mt-2 whitespace-pre-wrap text-sm text-[#6f5f57]">{row.feedback}</p> : null}
              <Link className="mt-3 inline-block text-sm font-black text-[#f26322]" to={`/fellow/assignments/${row.assignmentId}`}>Open assignment</Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
