import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import { COHORT_STATUS_OPTIONS } from '../../constants/cohortStatuses'
import { FELLOW_TRACK_OPTIONS } from '../../constants/fellowTracks'
import { createAdminCohort } from '../../services/cohortService'

const initialForm = {
  name: '',
  track: '',
  description: '',
  startDate: '',
  endDate: '',
  status: '',
}

const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

const validateCohortForm = (form) => {
  const errors = {}

  if (!form.name.trim()) {
    errors.name = 'Name is required'
  }

  if (!form.track) {
    errors.track = 'Track is required'
  }

  if (!form.status) {
    errors.status = 'Status is required'
  }

  if (!form.startDate) {
    errors.startDate = 'Start date is required'
  }

  if (!form.endDate) {
    errors.endDate = 'End date is required'
  }

  if (
    form.startDate &&
    form.endDate &&
    new Date(form.endDate) <= new Date(form.startDate)
  ) {
    errors.endDate = 'End date must be after start date'
  }

  return errors
}

export default function CohortCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateCohortForm(form)
    setFieldErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

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
    <section className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        className="-ml-3"
        onClick={() => navigate('/admin/cohorts')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to cohorts
      </Button>

      <Card padding={false}>
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            New Cohort
          </p>
          <CardTitle className="text-3xl">Create Cohort</CardTitle>
          <CardDescription>
            Set up a cohort timeline and assign it to a learning track.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error ? (
            <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
            <div>
              <Input
                label="Name"
                name="name"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                error={fieldErrors.name}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Select
                label="Track"
                name="track"
                value={form.track}
                onChange={(event) => updateField('track', event.target.value)}
                error={fieldErrors.track}
              >
                <option value="">Select track</option>
                {FELLOW_TRACK_OPTIONS.map((track) => (
                  <option key={track.value} value={track.value}>
                    {track.label}
                  </option>
                ))}
              </Select>

              <Select
                label="Status"
                name="status"
                value={form.status}
                onChange={(event) => updateField('status', event.target.value)}
                error={fieldErrors.status}
              >
                <option value="">Select status</option>
                {COHORT_STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Select>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Description
              </span>
              <Textarea
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                rows={4}
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Start date"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={(event) => updateField('startDate', event.target.value)}
                error={fieldErrors.startDate}
              />

              <Input
                label="End date"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={(event) => updateField('endDate', event.target.value)}
                error={fieldErrors.endDate}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/cohorts')}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSaving ? 'Creating...' : 'Create Cohort'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
