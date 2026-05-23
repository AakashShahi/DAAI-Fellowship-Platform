import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import { FELLOWSHIP_PATHWAYS } from '../../constants/pathways'
import {
  getApplication,
  updateApplicationStatus,
} from '../../services/applicationService'

const statusTone = {
  NEW: 'primary',
  REVIEWING: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'danger',
}

const statusOptions = ['NEW', 'REVIEWING', 'ACCEPTED', 'REJECTED']

const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

const getDocumentHref = (documentUrl) => {
  if (!documentUrl) return ''
  if (documentUrl.startsWith('http')) return documentUrl
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') ??
    'http://127.0.0.1:8000'
  return `${baseUrl}${documentUrl}`
}

export default function ApplicationDetailPage() {
  const { applicationId } = useParams()
  const [application, setApplication] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')

  const pathwayLabels = useMemo(
    () =>
      FELLOWSHIP_PATHWAYS.reduce(
        (labels, pathway) => ({
          ...labels,
          [pathway.slug]: pathway.title,
        }),
        {},
      ),
    [],
  )

  useEffect(() => {
    let isMounted = true

    const loadApplication = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await getApplication(applicationId)
        if (isMounted) {
          setApplication(data)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(getErrorMessage(loadError, 'Unable to load application.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadApplication()

    return () => {
      isMounted = false
    }
  }, [applicationId])

  const handleStatusChange = async (event) => {
    setIsUpdating(true)
    setError('')

    try {
      const updatedApplication = await updateApplicationStatus(
        application.id,
        event.target.value,
      )
      setApplication(updatedApplication)
    } catch (updateError) {
      setError(getErrorMessage(updateError, 'Unable to update status.'))
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-600">
        Loading application...
      </p>
    )
  }

  if (error && !application) {
    return (
      <Card>
        <p className="text-sm text-red-700">{error}</p>
        <Button to="/admin/applications" variant="secondary" className="mt-4">
          Back to applications
        </Button>
      </Card>
    )
  }

  const documentHref = getDocumentHref(application.documentUrl)

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/admin/applications"
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            Back to applications
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {application.fullName}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Applied for {pathwayLabels[application.pathway] ?? application.pathway}
          </p>
        </div>
        <Badge tone={statusTone[application.status] ?? 'default'}>
          {application.status}
        </Badge>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Full profile</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Full name
                </dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {application.fullName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${application.email}`}
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    {application.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </dt>
                <dd className="mt-1 text-slate-900">
                  {application.phone || 'Not provided'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  College / Organization
                </dt>
                <dd className="mt-1 text-slate-900">
                  {application.organization || 'Not provided'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Selected learning track
                </dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {pathwayLabels[application.pathway] ?? application.pathway}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Submitted
                </dt>
                <dd className="mt-1 text-slate-900">
                  {new Date(application.createdAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">
              Motivation letter
            </h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {application.motivation}
            </p>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Review status</h2>
            <Select
              label="Application status"
              name="status"
              value={application.status}
              onChange={handleStatusChange}
              disabled={isUpdating}
              className="mt-4"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">
              Resume / documents
            </h2>
            {application.documentUrl ? (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-900">
                  {application.documentFileName || 'Uploaded document'}
                </p>
                {application.documentContentType ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {application.documentContentType}
                  </p>
                ) : null}
                <Button href={documentHref} target="_blank" rel="noreferrer" className="mt-4">
                  Open document
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                No resume or document was uploaded with this application.
              </p>
            )}
          </Card>
        </div>
      </div>
    </section>
  )
}
