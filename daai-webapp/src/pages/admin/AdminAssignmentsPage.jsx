import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AssignmentTable from '../../components/assignments/AssignmentTable'
import { ASSIGNMENT_STATUS_OPTIONS } from '../../constants/assignments'
import { FELLOW_TRACK_OPTIONS } from '../../constants/fellowTracks'
import {
  deleteAssignment,
  getAssignmentsAdmin,
} from '../../services/assignmentService'
import { getModulesAdmin } from '../../services/learningService'

const getErrorMessage = (error, fallback) => typeof error?.response?.data?.detail === 'string' ? error.response.data.detail : fallback

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState([])
  const [modules, setModules] = useState([])
  const [track, setTrack] = useState('')
  const [status, setStatus] = useState('')
  const [moduleId, setModuleId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    getModulesAdmin(track)
      .then((data) => { if (alive) setModules(data) })
      .catch(() => { if (alive) setModules([]) })
    return () => { alive = false }
  }, [track])

  useEffect(() => {
    let alive = true
    getAssignmentsAdmin({ ...(track ? { track } : {}), ...(status ? { status } : {}), ...(moduleId ? { moduleId } : {}) })
      .then((data) => { if (alive) setAssignments(data) })
      .catch((err) => { if (alive) setError(getErrorMessage(err, 'Unable to load assignments.')) })
      .finally(() => { if (alive) setIsLoading(false) })
    return () => { alive = false }
  }, [track, status, moduleId])

  const handleArchive = async (assignment) => {
    if (!window.confirm(`Archive ${assignment.title}?`)) return
    setIsBusy(true)
    try {
      await deleteAssignment(assignment.id)
      setAssignments((current) => current.map((item) => item.id === assignment.id ? { ...item, status: 'archived' } : item))
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to archive assignment.'))
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <section>
      <div className="mb-6 rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
        <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">Assignments</p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#24140e]">Assignment Management</h1>
            <p className="mt-2 text-sm font-medium text-[#6f5f57]">Create module-based assignments and review fellow submissions.</p>
          </div>
          <Link className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#f26322] px-4 text-sm font-black text-white" to="/admin/assignments/new">Create Assignment</Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <select className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" value={track} onChange={(e) => { setIsLoading(true); setTrack(e.target.value); setModuleId('') }}>
            <option value="">All tracks</option>
            {FELLOW_TRACK_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" value={status} onChange={(e) => { setIsLoading(true); setStatus(e.target.value) }}>
            <option value="">All statuses</option>
            {ASSIGNMENT_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold" value={moduleId} onChange={(e) => { setIsLoading(true); setModuleId(e.target.value) }}>
            <option value="">All modules</option>
            {modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}
          </select>
        </div>
      </div>
      {error ? <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
      {isLoading ? <p className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold">Loading assignments...</p> : <AssignmentTable assignments={assignments} onArchive={handleArchive} isBusy={isBusy} />}
    </section>
  )
}
