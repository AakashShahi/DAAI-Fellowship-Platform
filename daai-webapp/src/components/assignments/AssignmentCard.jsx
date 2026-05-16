import { Link } from 'react-router-dom'
import SubmissionStatusBadge from './SubmissionStatusBadge'

export default function AssignmentCard({ assignment }) {
  return (
    <Link className="block rounded-lg border border-orange-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)] transition hover:border-[#ffb088]" to={`/fellow/assignments/${assignment.id}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-[#24140e]">{assignment.title}</h2>
          <p className="mt-2 text-sm font-medium text-[#6f5f57]">{assignment.moduleTitle ?? 'Track assignment'}</p>
        </div>
        <SubmissionStatusBadge status={assignment.submissionStatus} />
      </div>
      <p className="mt-4 text-sm font-bold text-[#6f5f57]">
        Due {new Date(assignment.dueDate).toLocaleDateString()} · {assignment.totalMarks} marks
      </p>
    </Link>
  )
}
