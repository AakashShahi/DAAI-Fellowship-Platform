import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SubmissionStatusBadge from '../../components/assignments/SubmissionStatusBadge'
import SubmissionReviewForm from '../../components/assignments/SubmissionReviewForm'
import { getAssignmentAdmin, getAssignmentSubmissionsAdmin, reviewSubmissionAdmin } from '../../services/assignmentService'

export default function AssignmentSubmissionsPage() {
  const { assignmentId } = useParams()
  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const refreshSubmissions = async () => {
    const [assignmentData, submissionData] = await Promise.all([getAssignmentAdmin(assignmentId), getAssignmentSubmissionsAdmin(assignmentId)])
    setAssignment(assignmentData)
    setSubmissions(submissionData)
  }

  useEffect(() => {
    let isMounted = true
    Promise.all([getAssignmentAdmin(assignmentId), getAssignmentSubmissionsAdmin(assignmentId)])
      .then(([assignmentData, submissionData]) => {
        if (!isMounted) return
        setAssignment(assignmentData)
        setSubmissions(submissionData)
      })
      .catch(() => {
        if (isMounted) setError('Unable to load submissions.')
      })
    return () => { isMounted = false }
  }, [assignmentId])

  const review = async (submissionId, payload) => {
      setIsSaving(true)
      setError('')
      try {
        await reviewSubmissionAdmin(submissionId, payload)
      await refreshSubmissions()
    } catch (err) {
      setError(typeof err?.response?.data?.detail === 'string' ? err.response.data.detail : 'Unable to save review.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!assignment) return <p className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold">Loading submissions...</p>

  return (
    <section>
      <div className="mb-6 rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
        <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">Submission Review</p>
        <h1 className="mt-2 text-3xl font-black text-[#24140e]">{assignment.title}</h1>
      </div>
      {error ? <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
      <div className="grid gap-4">
        {submissions.length === 0 ? <p className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold">No submissions yet.</p> : submissions.map((submission) => (
          <article key={submission.id} className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-black text-[#24140e]">{submission.fellowName}</h2>
                <p className="mt-1 text-sm font-medium text-[#6f5f57]">{submission.fellowEmail}</p>
              </div>
              <SubmissionStatusBadge status={submission.status} />
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm text-[#24140e]">{submission.submissionText}</p>
            <div className="mt-3 grid gap-2">
              {submission.submissionLinks.map((link) => <a key={link.url} className="text-sm font-black text-[#f26322]" href={link.url} target="_blank" rel="noreferrer">{link.title} · {link.type}</a>)}
            </div>
            <p className="mt-3 text-sm font-bold text-[#6f5f57]">Submitted {new Date(submission.submittedAt).toLocaleString()} · Marks {submission.marksObtained ?? '—'}</p>
            {submission.feedback ? <p className="mt-2 whitespace-pre-wrap text-sm text-[#6f5f57]">{submission.feedback}</p> : null}
            <SubmissionReviewForm submission={submission} assignment={assignment} onReview={review} isSaving={isSaving} />
          </article>
        ))}
      </div>
    </section>
  )
}
