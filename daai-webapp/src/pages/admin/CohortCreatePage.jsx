import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COHORT_STATUS_OPTIONS } from '../../constants/cohortStatuses'
import { FELLOW_TRACK_OPTIONS } from '../../constants/fellowTracks'
import { createAdminCohort } from '../../services/cohortService'

const initialForm = {
  name: '',
  track: 'qa',
  description: '',
  startDate: '',
  endDate: '',
  status: 'upcoming',
}

const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

export default function CohortCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const cohort = await createAdminCohort(form)
      navigate(`/admin/cohorts/${cohort.id}`)
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Unable to create cohort.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
      <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
        New Cohort
      </p>
      <h1 className="mt-2 text-3xl font-black text-[#24140e]">
        Create Cohort
      </h1>

      {error ? (
        <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-black text-[#24140e]">
          Name
          <input
            className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold text-[#6f5f57] outline-none focus:border-[#f26322]"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            required
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-black text-[#24140e]">
            Track
            <select
              className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold text-[#6f5f57] outline-none focus:border-[#f26322]"
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

          <label className="grid gap-2 text-sm font-black text-[#24140e]">
            Status
            <select
              className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold text-[#6f5f57] outline-none focus:border-[#f26322]"
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
        </div>

        <label className="grid gap-2 text-sm font-black text-[#24140e]">
          Description
          <textarea
            className="min-h-28 rounded-md border border-orange-100 px-3 py-2 text-sm font-bold text-[#6f5f57] outline-none focus:border-[#f26322]"
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-black text-[#24140e]">
            Start date
            <input
              className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold text-[#6f5f57] outline-none focus:border-[#f26322]"
              type="date"
              value={form.startDate}
              onChange={(event) => updateField('startDate', event.target.value)}
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-black text-[#24140e]">
            End date
            <input
              className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold text-[#6f5f57] outline-none focus:border-[#f26322]"
              type="date"
              value={form.endDate}
              onChange={(event) => updateField('endDate', event.target.value)}
              required
            />
          </label>
        </div>

        <div>
          <button
            type="submit"
            className="min-h-11 rounded-md bg-[#f26322] px-5 text-sm font-black text-white transition hover:bg-[#d94f13] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
          >
            {isSaving ? 'Creating...' : 'Create Cohort'}
          </button>
        </div>
      </form>
    </section>
  )
}
