import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SubmissionForm from '../../components/assignments/SubmissionForm'
import SubmissionStatusBadge from '../../components/assignments/SubmissionStatusBadge'
import { getFellowAssignment, submitFellowAssignment } from '../../services/assignmentService'

export default function FellowAssignmentDetailPage() {
  const { assignmentId } = useParams()
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const refreshAssignment = async () => {
    const data = await getFellowAssignment(assignmentId)
    setDetail(data)
  }

  useEffect(() => {
    let isMounted = true
    getFellowAssignment(assignmentId)
      .then((data) => {
        if (isMounted) setDetail(data)
      })
      .catch((err) => {
        if (isMounted) setError(typeof err?.response?.data?.detail === 'string' ? err.response.data.detail : 'Unable to load assignment.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => { isMounted = false }
  }, [assignmentId])

  const submit = async (payload) => {
    setIsSaving(true)
    setError('')
    try {
      await submitFellowAssignment(assignmentId, payload)
      await refreshAssignment()
    } catch (err) {
      setError(typeof err?.response?.data?.detail === 'string' ? err.response.data.detail : 'Unable to submit assignment.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <p className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold">Loading assignment...</p>
  if (!detail) return <p className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">{error || 'Assignment not found.'}</p>
  const { assignment, submission } = detail
  const canSubmit = !submission || ['submitted', 'needs-resubmission'].includes(submission.status)

  return (
    <section>
      <Link className="text-sm font-bold text-[#f26322]" to="/fellow/assignments">Assignments</Link>
      <div className="mt-4 mb-6 rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
        <h1 className="text-3xl font-black text-[#24140e]">{assignment.title}</h1>
        <p className="mt-3 text-sm font-medium text-[#6f5f57]">{assignment.description}</p>
        <p className="mt-3 text-sm font-bold text-[#6f5f57]">Due {new Date(assignment.dueDate).toLocaleString()} · {assignment.totalMarks} marks</p>
      </div>
      {error ? <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
      {submission ? (
        <div className="mb-6 rounded-lg border border-orange-100 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-[#24140e]">Current submission</h2>
            <SubmissionStatusBadge status={submission.status} />
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm text-[#6f5f57]">{submission.submissionText}</p>
          {submission.status === 'reviewed' ? <p className="mt-3 text-sm font-bold text-[#24140e]">Marks: {submission.marksObtained ?? '—'} / {assignment.totalMarks}</p> : null}
          {submission.feedback ? <p className="mt-2 whitespace-pre-wrap text-sm text-[#6f5f57]">{submission.feedback}</p> : null}
        </div>
      ) : null}
      {canSubmit ? <SubmissionForm initialSubmission={submission} onSubmit={submit} isSaving={isSaving} /> : <p className="rounded-lg border border-orange-100 bg-[#fffaf6] p-5 text-sm font-bold text-[#6f5f57]">This submission is locked after review.</p>}
    </section>
  )
}
