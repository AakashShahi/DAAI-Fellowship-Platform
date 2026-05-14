import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getFellowAssignment,
  submitFellowAssignment,
} from '../../services/assignmentService'

export default function FellowAssignmentDetailPage() {
  const { assignmentId } = useParams()
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    submissionText: '',
    submissionLink: '',
    fileUrl: '',
  })

  const load = async () => {
    setError('')
    try {
      const d = await getFellowAssignment(assignmentId)
      setDetail(d)
      const s = d.submission
      setForm({
        submissionText: s?.submissionText ?? '',
        submissionLink: s?.submissionLink ?? '',
        fileUrl: s?.fileUrl ?? '',
      })
    } catch (err) {
      const msg = err?.response?.data?.detail
      setError(typeof msg === 'string' ? msg : 'Unable to load assignment.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when route id changes
    setIsLoading(true)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId])

  const assignment = detail?.assignment
  const submission = detail?.submission

  const canEdit =
    assignment?.status === 'OPEN' &&
    (!submission ||
      submission.status === 'SUBMITTED' ||
      submission.status === 'NEEDS_REVISION')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      await submitFellowAssignment(assignmentId, {
        submissionText: form.submissionText,
        submissionLink: form.submissionLink,
        fileUrl: form.fileUrl,
      })
      await load()
    } catch (err) {
      const msg = err?.response?.data?.detail
      setError(typeof msg === 'string' ? msg : 'Unable to submit.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <section>
        <p className="text-sm text-[#6f5f57]">Loading…</p>
      </section>
    )
  }

  if (error && !detail) {
    return (
      <section>
        <Link className="text-sm font-bold text-[#f26322]" to="/fellow/assignments">
          ← Assignments
        </Link>
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      </section>
    )
  }

  return (
    <section className="px-1">
      <Link className="text-sm font-bold text-[#f26322]" to="/fellow/assignments">
        ← Assignments
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-black text-[#24140e]">{assignment.title}</h1>
        <p className="mt-2 text-sm font-medium text-[#6f5f57]">
          {assignment.status === 'OPEN' ? 'Open for submissions' : 'Closed'} · Max score{' '}
          {assignment.maxScore}
          {assignment.dueDate ? ` · Due ${new Date(assignment.dueDate).toLocaleString()}` : ''}
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mb-8 rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-[#24140e]">Description</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-[#6f5f57]">{assignment.description}</p>
        <h2 className="mt-6 text-lg font-black text-[#24140e]">Instructions</h2>
        <div className="mt-2 whitespace-pre-wrap text-sm text-[#24140e]">
          {assignment.instructions}
        </div>
      </div>

      {submission && submission.status === 'REVIEWED' ? (
        <div className="mb-8 rounded-lg border border-orange-100 bg-[#fffaf6] p-5">
          <h2 className="text-lg font-black text-[#24140e]">Feedback</h2>
          <p className="mt-2 text-sm text-[#6f5f57]">
            Score: {submission.score != null ? submission.score : '—'} / {assignment.maxScore}
          </p>
          {submission.feedback ? (
            <p className="mt-3 whitespace-pre-wrap text-sm text-[#24140e]">{submission.feedback}</p>
          ) : (
            <p className="mt-3 text-sm text-[#6f5f57]">No written feedback.</p>
          )}
        </div>
      ) : null}

      {submission && submission.status === 'NEEDS_REVISION' ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-black">Revision requested</p>
          {submission.feedback ? (
            <p className="mt-2 whitespace-pre-wrap">{submission.feedback}</p>
          ) : null}
        </div>
      ) : null}

      {canEdit ? (
        <form
          className="max-w-2xl space-y-4 rounded-lg border border-orange-100 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit}
        >
          <h2 className="text-lg font-black text-[#24140e]">Your submission</h2>
          <p className="text-xs text-[#6f5f57]">
            Provide at least one of: written response, link, or file URL.
          </p>
          <label className="block text-sm font-bold text-[#24140e]">
            Written response
            <textarea
              className="mt-1 min-h-[140px] w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
              value={form.submissionText}
              onChange={(e) => setForm((f) => ({ ...f, submissionText: e.target.value }))}
            />
          </label>
          <label className="block text-sm font-bold text-[#24140e]">
            Link (e.g. doc, repo, portfolio)
            <input
              className="mt-1 w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
              value={form.submissionLink}
              onChange={(e) => setForm((f) => ({ ...f, submissionLink: e.target.value }))}
            />
          </label>
          <label className="block text-sm font-bold text-[#24140e]">
            File URL
            <input
              className="mt-1 w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
              value={form.fileUrl}
              onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
            />
          </label>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-[#f26322] px-4 py-2 text-sm font-black text-white disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : submission ? 'Update submission' : 'Submit'}
          </button>
        </form>
      ) : (
        <div className="rounded-lg border border-dashed border-orange-200 bg-[#fffaf6] p-5 text-sm text-[#6f5f57]">
          {assignment.status !== 'OPEN' ? (
            <p>This assignment is closed for new submissions or edits.</p>
          ) : (
            <p>This submission is locked after review.</p>
          )}
          {submission ? (
            <div className="mt-4 whitespace-pre-wrap text-[#24140e]">{submission.submissionText}</div>
          ) : null}
        </div>
      )}
    </section>
  )
}
