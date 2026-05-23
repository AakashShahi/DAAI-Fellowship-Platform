import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Select from '../../components/ui/Select'
import { FELLOWSHIP_PATHWAYS } from '../../constants/pathways'
import {
  getApplications,
  updateApplicationStatus,
} from '../../services/applicationService'

const statusTone = {
  NEW: 'primary',
  REVIEWING: 'warning',
  MORE_INFO: 'info',
  ACCEPTED: 'success',
  REJECTED: 'danger',
  ENROLLED: 'success',
}

const statusLabels = {
  NEW: 'New',
  REVIEWING: 'Reviewing',
  MORE_INFO: 'Request more info',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  ENROLLED: 'Enrollment confirmed',
}

const statusOptions = [
  'NEW',
  'REVIEWING',
  'MORE_INFO',
  'ACCEPTED',
  'REJECTED',
  'ENROLLED',
]

const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState('')

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

  const loadApplications = async () => {
    setIsLoading(true)
    setError('')

    try {
      const data = await getApplications()
      setApplications(data)
    } catch (loadError) {
      setError(
        getErrorMessage(loadError, 'Unable to load applications right now.'),
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [])

  const handleStatusChange = async (applicationId, status) => {
    setUpdatingId(applicationId)
    setError('')

    try {
      const updatedApplication = await updateApplicationStatus(applicationId, status)
      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === applicationId ? updatedApplication : application,
        ),
      )
    } catch (updateError) {
      setError(getErrorMessage(updateError, 'Unable to update application status.'))
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-indigo-600">
              Applications
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">
              Fellowship applications
            </h1>
            <p className="mt-3 text-sm font-medium text-slate-600">
              Review applications submitted from the public website.
            </p>
          </div>
          <Button variant="secondary" onClick={loadApplications} disabled={isLoading}>
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-600">
          Loading applications...
        </p>
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Applications submitted from the public site will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Applicant</th>
                  <th className="px-4 py-3 font-semibold">Pathway</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Documents</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {applications.map((application) => (
                  <tr key={application.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">
                        {application.fullName}
                      </p>
                      <a
                        href={`mailto:${application.email}`}
                        className="mt-1 block text-indigo-600 hover:underline"
                      >
                        {application.email}
                      </a>
                      {application.phone ? (
                        <p className="mt-1 text-slate-600">{application.phone}</p>
                      ) : null}
                      {application.organization ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {application.organization}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {pathwayLabels[application.pathway] ?? application.pathway}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone={statusTone[application.status] ?? 'default'}>
                        {statusLabels[application.status] ?? application.status}
                      </Badge>
                      <Select
                        name={`status-${application.id}`}
                        value={application.status}
                        onChange={(event) =>
                          handleStatusChange(application.id, event.target.value)
                        }
                        disabled={updatingId === application.id}
                        className="mt-2 min-w-36"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {application.lastEmailStatus ? (
                        <>
                          <Badge
                            tone={
                              application.lastEmailStatus === 'sent'
                                ? 'success'
                                : application.lastEmailStatus === 'failed'
                                  ? 'danger'
                                  : 'warning'
                            }
                          >
                            {application.lastEmailStatus}
                          </Badge>
                          {application.lastEmailError ? (
                            <p className="mt-2 max-w-48 text-xs text-red-600">
                              {application.lastEmailError}
                            </p>
                          ) : null}
                        </>
                      ) : (
                        'Not sent'
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {application.documentUrl ? 'Uploaded' : 'None'}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        to={`/admin/applications/${application.id}`}
                        className="font-semibold text-indigo-600 hover:underline"
                      >
                        Review details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
