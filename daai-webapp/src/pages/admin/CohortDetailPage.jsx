import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import AssignFellowsModal from '../../components/admin/AssignFellowsModal'
import CohortStatusBadge from '../../components/admin/CohortStatusBadge'
import TrackBadge from '../../components/admin/TrackBadge'
import { COHORT_STATUS_OPTIONS } from '../../constants/cohortStatuses'
import { FELLOW_TRACK_OPTIONS } from '../../constants/fellowTracks'
import { getAdminFellows } from '../../services/adminFellowService'
import {
  getAdminCohort,
  updateAdminCohort,
  updateAdminCohortFellows,
} from '../../services/cohortService'

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not set'

const toDateInput = (value) => (value ? value.slice(0, 10) : '')

const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

export default function CohortDetailPage() {
  const { cohortId } = useParams()
  const [cohort, setCohort] = useState(null)
  const [fellows, setFellows] = useState([])
  const [form, setForm] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    Promise.all([getAdminCohort(cohortId), getAdminFellows()])
      .then(([cohortData, fellowData]) => {
        if (isMounted) {
          setCohort(cohortData)
          setFellows(fellowData)
          setForm({
            name: cohortData.name,
            track: cohortData.track,
            description: cohortData.description ?? '',
            startDate: toDateInput(cohortData.startDate),
            endDate: toDateInput(cohortData.endDate),
            status: cohortData.status,
          })
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(getErrorMessage(loadError, 'Unable to load cohort.'))
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [cohortId])

  const eligibleFellows = useMemo(
    () => fellows.filter((fellow) => fellow.selectedTrack === cohort?.track),
    [fellows, cohort?.track],
  )

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSaveDetails = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      const updated = await updateAdminCohort(cohortId, form)
      setCohort(updated)
      setSuccessMessage('Cohort updated successfully.')
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Unable to update cohort.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveFellows = async (fellowIds) => {
    setIsAssigning(true)
    setError('')
    setSuccessMessage('')

    try {
      const updated = await updateAdminCohortFellows(cohortId, fellowIds)
      setCohort(updated)
      setShowAssignModal(false)
      setSuccessMessage('Fellow assignments updated.')
    } catch (assignError) {
      setError(getErrorMessage(assignError, 'Unable to update fellow assignments.'))
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemoveFellow = async (fellowId) => {
    const confirmed = window.confirm('Remove this fellow from the cohort?')
    if (!confirmed) {
      return
    }

    await handleSaveFellows((cohort.fellows ?? []).filter((id) => id !== fellowId))
  }

  if (isLoading) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold text-[#475569]">
        Loading cohort...
      </p>
    )
  }

  if (!cohort || !form) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
        {error || 'Cohort not found.'}
      </p>
    )
  }

  return (
    <section>
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
        <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">
          Cohort Detail
        </p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#0f172a]">{cohort.name}</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium text-[#475569]">
              {cohort.description || 'No description added.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TrackBadge selectedTrack={cohort.track} />
            <CohortStatusBadge status={cohort.status} />
          </div>
        </div>
        <div className="mt-5 grid gap-3 text-sm font-bold text-[#475569] md:grid-cols-3">
          <p>Start: {formatDate(cohort.startDate)}</p>
          <p>End: {formatDate(cohort.endDate)}</p>
          <p>Assigned fellows: {cohort.fellowsCount}</p>
        </div>
      </div>

      {error ? (
        <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {successMessage ? (
        <p className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">
          {successMessage}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,440px)]">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">
                Assigned Fellows
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#0f172a]">
                Cohort roster
              </h2>
            </div>
            <button
              type="button"
              className="min-h-10 rounded-md bg-[#4f46e5] px-4 text-sm font-black text-white transition hover:bg-[#4338ca]"
              onClick={() => setShowAssignModal(true)}
            >
              Assign Fellows
            </button>
          </div>

          <p className="mt-3 text-sm font-medium text-[#475569]">
            {eligibleFellows.length} fellows currently match this cohort track.
          </p>

          <div className="mt-5 grid gap-3">
            {(cohort.fellowDetails ?? []).length === 0 ? (
              <p className="rounded-lg border border-slate-200 bg-[#f8fafc] p-4 text-sm font-bold text-[#475569]">
                No fellows assigned yet.
              </p>
            ) : (
              cohort.fellowDetails.map((fellow) => (
                <article
                  key={fellow.id}
                  className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-black text-[#0f172a]">{fellow.fullName}</h3>
                    <p className="mt-1 text-sm font-medium text-[#475569]">
                      {fellow.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="min-h-10 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-black text-red-700 transition hover:bg-red-100"
                    onClick={() => handleRemoveFellow(fellow.id)}
                  >
                    Remove
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        <form
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]"
          onSubmit={handleSaveDetails}
        >
          <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">
            Edit Cohort
          </p>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-black text-[#0f172a]">
              Name
              <input
                className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-[#475569] outline-none focus:border-[#4f46e5]"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-black text-[#0f172a]">
              Track
              <select
                className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-[#475569] outline-none focus:border-[#4f46e5]"
                value={form.track}
                onChange={(event) => updateField('track', event.target.value)}
              >
                {FELLOW_TRACK_OPTIONS.map((track) => (
                  <option key={track.value} value={track.value}>
                    {track.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black text-[#0f172a]">
              Status
              <select
                className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-[#475569] outline-none focus:border-[#4f46e5]"
                value={form.status}
                onChange={(event) => updateField('status', event.target.value)}
              >
                {COHORT_STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black text-[#0f172a]">
              Description
              <textarea
                className="min-h-24 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-[#475569] outline-none focus:border-[#4f46e5]"
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-black text-[#0f172a]">
                Start date
                <input
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-[#475569] outline-none focus:border-[#4f46e5]"
                  type="date"
                  value={form.startDate}
                  onChange={(event) => updateField('startDate', event.target.value)}
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-black text-[#0f172a]">
                End date
                <input
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-[#475569] outline-none focus:border-[#4f46e5]"
                  type="date"
                  value={form.endDate}
                  onChange={(event) => updateField('endDate', event.target.value)}
                  required
                />
              </label>
            </div>
            <button
              type="submit"
              className="min-h-11 rounded-md bg-[#4f46e5] px-4 text-sm font-black text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Cohort'}
            </button>
          </div>
        </form>
      </div>

      {showAssignModal ? (
        <AssignFellowsModal
          cohort={cohort}
          fellows={fellows}
          onClose={() => setShowAssignModal(false)}
          onSave={handleSaveFellows}
          isSaving={isAssigning}
        />
      ) : null}
    </section>
  )
}
