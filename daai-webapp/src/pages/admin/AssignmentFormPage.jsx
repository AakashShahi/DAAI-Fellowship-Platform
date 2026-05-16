import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ASSIGNMENT_STATUS_OPTIONS, SUBMISSION_TYPE_OPTIONS } from '../../constants/assignments'
import { FELLOW_TRACK_OPTIONS } from '../../constants/fellowTracks'
import { createAssignment, getAssignmentAdmin, updateAssignment } from '../../services/assignmentService'
import { getModuleAdmin, getModulesAdmin } from '../../services/learningService'

const initialForm = { title: '', description: '', track: 'qa', moduleId: '', lessonId: '', dueDate: '', totalMarks: 100, submissionType: 'text', status: 'draft' }
const toInputDate = (value) => value ? value.slice(0, 16) : ''

export default function AssignmentFormPage() {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(assignmentId)
  const [form, setForm] = useState(initialForm)
  const [modules, setModules] = useState([])
  const [lessons, setLessons] = useState([])
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getModulesAdmin(form.track).then(setModules).catch(() => setModules([]))
  }, [form.track])

  useEffect(() => {
    if (!form.moduleId) return
    getModuleAdmin(form.moduleId).then((module) => setLessons(module.lessons ?? [])).catch(() => setLessons([]))
  }, [form.moduleId])

  useEffect(() => {
    if (!isEditing) return
    getAssignmentAdmin(assignmentId).then((assignment) => setForm({
      title: assignment.title,
      description: assignment.description,
      track: assignment.track,
      moduleId: assignment.moduleId,
      lessonId: assignment.lessonId ?? '',
      dueDate: toInputDate(assignment.dueDate),
      totalMarks: assignment.totalMarks,
      submissionType: assignment.submissionType,
      status: assignment.status,
    })).catch(() => setError('Unable to load assignment.'))
  }, [assignmentId, isEditing])

  const submit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      const payload = { ...form, lessonId: form.lessonId || null, dueDate: new Date(form.dueDate).toISOString(), totalMarks: Number(form.totalMarks) || 0 }
      const saved = isEditing ? await updateAssignment(assignmentId, payload) : await createAssignment(payload)
      navigate(`/admin/assignments/${saved.id}`)
    } catch (err) {
      setError(typeof err?.response?.data?.detail === 'string' ? err.response.data.detail : 'Unable to save assignment.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
      <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">Assignments</p>
      <h1 className="mt-2 text-3xl font-black text-[#24140e]">{isEditing ? 'Edit Assignment' : 'Create Assignment'}</h1>
      {error ? <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
      <form className="mt-6 grid gap-5" onSubmit={submit}>
        <input className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
        <textarea className="min-h-28 rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
        <div className="grid gap-4 md:grid-cols-3">
          <select className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" value={form.track} onChange={(e) => { setLessons([]); setForm((f) => ({ ...f, track: e.target.value, moduleId: '', lessonId: '' })) }}>{FELLOW_TRACK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          <select className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" value={form.moduleId} onChange={(e) => { setLessons([]); setForm((f) => ({ ...f, moduleId: e.target.value, lessonId: '' })) }} required><option value="">Select module</option>{modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select>
          <select className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" value={form.lessonId} onChange={(e) => setForm((f) => ({ ...f, lessonId: e.target.value }))}><option value="">No lesson</option>{lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}</select>
          <input className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" type="datetime-local" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} required />
          <input className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" type="number" min="0" value={form.totalMarks} onChange={(e) => setForm((f) => ({ ...f, totalMarks: e.target.value }))} />
          <select className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" value={form.submissionType} onChange={(e) => setForm((f) => ({ ...f, submissionType: e.target.value }))}>{SUBMISSION_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          <select className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>{ASSIGNMENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
        </div>
        <button className="min-h-11 rounded-md bg-[#f26322] px-5 text-sm font-black text-white disabled:opacity-60" disabled={isSaving} type="submit">{isSaving ? 'Saving...' : 'Save Assignment'}</button>
      </form>
    </section>
  )
}
