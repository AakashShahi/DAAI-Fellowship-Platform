import { Link, useParams } from 'react-router-dom'
import AssignmentStatusBadge from '../../components/assignments/AssignmentStatusBadge'
import TrackBadge from '../../components/admin/TrackBadge'
import { useEffect, useState } from 'react'
import { getAssignmentAdmin } from '../../services/assignmentService'

export default function AdminAssignmentEditPage() {
  const { assignmentId } = useParams()
  const [assignment, setAssignment] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getAssignmentAdmin(assignmentId).then(setAssignment).catch(() => setError('Unable to load assignment.'))
  }, [assignmentId])

  if (error) return <p className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">{error}</p>
  if (!assignment) return <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold">Loading assignment...</p>

  return (
    <section>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
        <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">Assignment Detail</p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#0f172a]">{assignment.title}</h1>
            <p className="mt-3 text-sm font-medium text-[#475569]">{assignment.description}</p>
          </div>
          <div className="flex flex-wrap gap-2"><TrackBadge selectedTrack={assignment.track} /><AssignmentStatusBadge status={assignment.status} /></div>
        </div>
        <div className="mt-5 grid gap-3 text-sm font-bold text-[#475569] md:grid-cols-4">
          <p>Module: {assignment.moduleTitle}</p>
          <p>Due: {new Date(assignment.dueDate).toLocaleString()}</p>
          <p>Total marks: {assignment.totalMarks}</p>
          <p>Submissions: {assignment.submissionsCount}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="rounded-md bg-[#4f46e5] px-4 py-2 text-sm font-black text-white" to={`/admin/assignments/${assignment.id}/submissions`}>View Submissions</Link>
          <Link className="rounded-md border border-slate-200 px-4 py-2 text-sm font-black text-[#4f46e5]" to={`/admin/assignments/${assignment.id}/edit`}>Edit Assignment</Link>
        </div>
      </div>
    </section>
  )
}
