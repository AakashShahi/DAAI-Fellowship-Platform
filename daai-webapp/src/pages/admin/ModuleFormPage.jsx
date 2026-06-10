import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MODULE_STATUS_OPTIONS } from '../../constants/curriculum'
import { FELLOW_TRACK_OPTIONS } from '../../constants/fellowTracks'
import {
  createModule,
  getModuleAdmin,
  updateModule,
} from '../../services/learningService'

const initialForm = {
  title: '',
  track: 'qa',
  description: '',
  order: 0,
  status: 'draft',
}

const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

export default function ModuleFormPage() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(moduleId)
  const [form, setForm] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditing) {
      return undefined
    }
    let isMounted = true
    getModuleAdmin(moduleId)
      .then((module) => {
        if (isMounted) {
          setForm({
            title: module.title,
            track: module.track,
            description: module.description ?? '',
            order: module.order,
            status: module.status,
          })
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(getErrorMessage(loadError, 'Unable to load module.'))
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
  }, [isEditing, moduleId])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    const payload = { ...form, order: Number(form.order) || 0 }
    try {
      const module = isEditing
        ? await updateModule(moduleId, payload)
        : await createModule(payload)
      navigate(`/admin/modules/${module.id}`)
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Unable to save module.'))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold">Loading module...</p>
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
      <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">
        Curriculum
      </p>
      <h1 className="mt-2 text-3xl font-black text-[#0f172a]">
        {isEditing ? 'Edit Module' : 'Create Module'}
      </h1>
      {error ? (
        <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}
      <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-black text-[#0f172a]">
          Title
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-[#475569]"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            required
          />
        </label>
        <div className="grid gap-5 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-black text-[#0f172a]">
            Track
            <select
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-[#475569]"
              value={form.track}
              onChange={(event) => updateField('track', event.target.value)}
            >
              {FELLOW_TRACK_OPTIONS.map((track) => (
                <option key={track.value} value={track.value}>{track.label}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-black text-[#0f172a]">
            Status
            <select
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-[#475569]"
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
            >
              {MODULE_STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-black text-[#0f172a]">
            Order
            <input
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-[#475569]"
              type="number"
              min="0"
              value={form.order}
              onChange={(event) => updateField('order', event.target.value)}
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-black text-[#0f172a]">
          Description
          <textarea
            className="min-h-28 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-[#475569]"
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
          />
        </label>
        <div>
          <button
            type="submit"
            className="min-h-11 rounded-md bg-[#4f46e5] px-5 text-sm font-black text-white disabled:opacity-60"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Module'}
          </button>
        </div>
      </form>
    </section>
  )
}
