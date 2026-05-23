import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AssignmentCard from '../../components/assignments/AssignmentCard'
import { getFellowAssignments } from '../../services/assignmentService'

export default function FellowAssignmentsPage() {
  const [assignments, setAssignments] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getFellowAssignments()
      .then(setAssignments)
      .catch((err) => setError(typeof err?.response?.data?.detail === 'string' ? err.response.data.detail : 'Unable to load assignments.'))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <section>
      <div className="mb-6 rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
        <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">Coursework</p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#24140e]">Assignments</h1>
            <p className="mt-2 text-sm font-medium text-[#6f5f57]">Assignments for your selected learning track.</p>
          </div>
          <Link className="text-sm font-black text-[#f26322]" to="/fellow/submissions">My Submissions</Link>
        </div>
      </div>
      {error ? <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
      {isLoading ? <p className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold">Loading assignments...</p> : assignments.length === 0 ? <p className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold">No assignments yet.</p> : <div className="grid gap-4 md:grid-cols-2">{assignments.map((assignment) => <AssignmentCard key={assignment.id} assignment={assignment} />)}</div>}
    </section>
  )
}
