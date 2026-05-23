import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SESSION_STATUS_OPTIONS } from '../../constants/sessions'
import { createAdminSession, getAdminSession, updateAdminSession } from '../../services/sessionService'
import { getAdminCohorts } from '../../services/cohortService'

const initialForm = {
  title: '',
  description: '',
  cohortId: '',
  sessionDate: '',
  startTime: '',
  endTime: '',
  meetingLink: '',
  recordingLink: '',
  status: 'scheduled',
}

const toInputDate = (value) => value ? value.slice(0, 10) : ''

export default function SessionFormPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(sessionId)
  const [form, setForm] = useState(initialForm)
  const [cohorts, setCohorts] = useState([])
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let isMounted = true
    getAdminCohorts()
      .then((data) => { if (isMounted) setCohorts(data.filter((cohort) => cohort.status !== 'archived')) })
      .catch(() => { if (isMounted) setError('Unable to load cohorts.') })
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    if (!isEditing) return undefined
    let isMounted = true
    getAdminSession(sessionId)
      .then((session) => {
        if (!isMounted) return
        setForm({
          title: session.title,
          description: session.description,
          cohortId: session.cohortId,
          sessionDate: toInputDate(session.sessionDate),
          startTime: session.startTime,
          endTime: session.endTime,
          meetingLink: session.meetingLink ?? '',
          recordingLink: session.recordingLink ?? '',
          status: session.status,
        })
      })
      .catch(() => { if (isMounted) setError('Unable to load session.') })
    return () => { isMounted = false }
  }, [isEditing, sessionId])

  const submit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      const saved = isEditing ? await updateAdminSession(sessionId, form) : await createAdminSession(form)
      navigate(`/admin/sessions/${saved.id}`)
    } catch (err) {
      setError(typeof err?.response?.data?.detail === 'string' ? err.response.data.detail : 'Unable to save session.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
      <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">Sessions</p>
      <h1 className="mt-2 text-3xl font-black text-[#24140e]">{isEditing ? 'Edit Session' : 'Create Session'}</h1>
      {error ? <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
      <form className="mt-6 grid gap-5" onSubmit={submit}>
        <input className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
        <textarea className="min-h-28 rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <div className="grid gap-4 md:grid-cols-3">
          <select className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" value={form.cohortId} onChange={(e) => setForm((f) => ({ ...f, cohortId: e.target.value }))} required>
            <option value="">Select cohort</option>
            {cohorts.map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.name}</option>)}
          </select>
          <input className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" type="date" value={form.sessionDate} onChange={(e) => setForm((f) => ({ ...f, sessionDate: e.target.value }))} required />
          <input className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} required />
          <input className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} required />
          <input className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" placeholder="Meeting link" value={form.meetingLink} onChange={(e) => setForm((f) => ({ ...f, meetingLink: e.target.value }))} />
          <input className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" placeholder="Recording link" value={form.recordingLink} onChange={(e) => setForm((f) => ({ ...f, recordingLink: e.target.value }))} />
          <select className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>{SESSION_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        </div>
        <button className="min-h-11 rounded-md bg-[#f26322] px-5 text-sm font-black text-white disabled:opacity-60" disabled={isSaving} type="submit">{isSaving ? 'Saving...' : 'Save Session'}</button>
      </form>
    </section>
  )
}
