import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getSubmissionStaff,
  reviewSubmission,
} from '../../services/submissionService'

const STATUSES = ['REVIEWED', 'NEEDS_REVISION']

export default function SubmissionReviewView({ listPath, heading = 'Review submission' }) {
  const { submissionId } = useParams()
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    status: 'REVIEWED',
    score: '',
    feedback: '',
  })

  const load = async () => {
    setError('')
    try {
      const d = await getSubmissionStaff(submissionId)
      setDetail(d)
      setForm({
        status: d.submission.status === 'NEEDS_REVISION' ? 'NEEDS_REVISION' : 'REVIEWED',
        score: d.submission.score != null ? String(d.submission.score) : '',
        feedback: d.submission.feedback ?? '',
      })
    } catch (err) {
      const msg = err?.response?.data?.detail
      setError(typeof msg === 'string' ? msg : 'Unable to load submission.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when route id changes
    setIsLoading(true)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when id changes
  }, [submissionId])

  const handleReview = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      const scoreRaw = form.score.trim()
      const payload = {
        status: form.status,
        feedback: form.feedback,
        score: scoreRaw === '' ? null : Number(scoreRaw),
      }
      if (payload.score != null && Number.isNaN(payload.score)) {
        setError('Score must be a number.')
        setIsSaving(false)
        return
      }
      await reviewSubmission(submissionId, payload)
      await load()
    } catch (err) {
      const msg = err?.response?.data?.detail
      setError(typeof msg === 'string' ? msg : 'Unable to save review.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <section>
        <p className="text-sm font-medium text-[#6f5f57]">Loading submission…</p>
      </section>
    )
  }

  if (error && !detail) {
    return (
      <section>
        <Link className="text-sm font-bold text-[#f26322]" to={listPath}>
          ← Back to submissions
        </Link>
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      </section>
    )
  }

  const { submission, assignment, fellowName, fellowEmail } = detail

  return (
    <section>
      <div className="mb-6">
        <Link className="text-sm font-bold text-[#f26322]" to={listPath}>
          ← Back to submissions
        </Link>
        <p className="mt-3 text-xs font-black uppercase tracking-wide text-[#f26322]">
          Submissions
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#24140e] lg:text-4xl">{heading}</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-[#6f5f57]">
          {assignment.title} · {fellowName} ({fellowEmail})
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-[#24140e]">Assignment</h2>
          <p className="mt-2 text-sm font-medium text-[#6f5f57]">{assignment.description}</p>
          <div className="mt-4 whitespace-pre-wrap text-sm text-[#24140e]">
            {assignment.instructions}
          </div>
          <p className="mt-4 text-xs font-bold text-[#6f5f57]">
            Max score: {assignment.maxScore} · Status: {assignment.status}
          </p>
        </div>

        <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-[#24140e]">Fellow submission</h2>
          <p className="mt-2 text-xs font-bold uppercase text-[#6f5f57]">
            Status: {submission.status} · Submitted{' '}
            {new Date(submission.submittedAt).toLocaleString()}
          </p>
          {submission.submissionLink ? (
            <p className="mt-3 text-sm">
              <a
                className="font-bold text-[#f26322] underline"
                href={submission.submissionLink}
                target="_blank"
                rel="noreferrer"
              >
                Open submission link
              </a>
            </p>
          ) : null}
          {submission.fileUrl ? (
            <p className="mt-2 text-sm">
              <a
                className="font-bold text-[#f26322] underline"
                href={submission.fileUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open file URL
              </a>
            </p>
          ) : null}
          {submission.submissionText ? (
            <div className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-[#fffaf6] p-3 text-sm text-[#24140e]">
              {submission.submissionText}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#6f5f57]">No written response.</p>
          )}
        </div>
      </div>

      <form
        className="max-w-xl rounded-lg border border-orange-100 bg-white p-5 shadow-sm"
        onSubmit={handleReview}
      >
        <h2 className="text-lg font-black text-[#24140e]">Your review</h2>
        <label className="mt-4 block text-sm font-bold text-[#24140e]">
          Decision
          <select
            className="mt-1 w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'REVIEWED' ? 'Reviewed (final)' : 'Needs revision'}
              </option>
            ))}
          </select>
        </label>
        {form.status === 'REVIEWED' ? (
          <label className="mt-4 block text-sm font-bold text-[#24140e]">
            Score (optional, max {assignment.maxScore})
            <input
              className="mt-1 w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
              type="number"
              min={0}
              max={assignment.maxScore}
              value={form.score}
              onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
            />
          </label>
        ) : null}
        <label className="mt-4 block text-sm font-bold text-[#24140e]">
          Feedback
          <textarea
            className="mt-1 min-h-[120px] w-full rounded-md border border-orange-100 px-3 py-2 text-sm"
            value={form.feedback}
            onChange={(e) => setForm((f) => ({ ...f, feedback: e.target.value }))}
          />
        </label>
        <button
          type="submit"
          className="mt-4 rounded-md bg-[#f26322] px-4 py-2 text-sm font-black text-white disabled:opacity-60"
          disabled={isSaving}
        >
          {isSaving ? 'Saving…' : 'Save review'}
        </button>
      </form>
    </section>
  )
}
