import { useState } from 'react'
import { REVIEW_STATUS_OPTIONS } from '../../constants/assignments'

export default function SubmissionReviewForm({ submission, assignment, onReview, isSaving }) {
  const [status, setStatus] = useState(submission.status === 'reviewed' ? 'reviewed' : 'under-review')
  const [marksObtained, setMarksObtained] = useState(submission.marksObtained ?? '')
  const [feedback, setFeedback] = useState(submission.feedback ?? '')

  return (
    <form className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-[#f8fafc] p-4" onSubmit={(event) => { event.preventDefault(); onReview(submission.id, { status, marksObtained: marksObtained === '' ? null : Number(marksObtained), feedback }) }}>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-black text-[#0f172a]">Status
          <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
            {REVIEW_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-black text-[#0f172a]">Marks
          <input className="rounded-md border border-slate-200 px-3 py-2 text-sm" type="number" max={assignment.totalMarks} value={marksObtained} onChange={(event) => setMarksObtained(event.target.value)} />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-black text-[#0f172a]">Feedback
        <textarea className="min-h-24 rounded-md border border-slate-200 px-3 py-2 text-sm" value={feedback} onChange={(event) => setFeedback(event.target.value)} />
      </label>
      <button className="min-h-10 rounded-md bg-[#4f46e5] px-4 text-sm font-black text-white disabled:opacity-60" disabled={isSaving} type="submit">Save Review</button>
    </form>
  )
}
