import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Mail,
  RefreshCcw,
  Save,
  XCircle,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table'
import Textarea from '../../components/ui/Textarea'
import { FELLOWSHIP_PATHWAYS } from '../../constants/pathways'
import {
  getApplication,
  sendApplicationTestEmail,
  updateApplicationAdminNotes,
  updateApplicationStatus,
} from '../../services/applicationService'

const statusTone = {
  NEW: 'default',
  REVIEWING: 'info',
  MORE_INFO: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'danger',
  ENROLLED: 'success',
}

const statusLabels = {
  NEW: 'Submitted',
  REVIEWING: 'Under review',
  MORE_INFO: 'Test sent',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  ENROLLED: 'Enrollment confirmed',
}

const statusOptions = [
  { value: 'NEW', label: 'submitted' },
  { value: 'REVIEWING', label: 'under_review' },
  { value: 'MORE_INFO', label: 'test_sent' },
  { value: 'ACCEPTED', label: 'accepted' },
  { value: 'REJECTED', label: 'rejected' },
  { value: 'ENROLLED', label: 'enrollment_confirmed' },
]

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

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{children}</dd>
    </div>
  )
}

export default function ApplicationDetailPage() {
  const { applicationId } = useParams()
  const [application, setApplication] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [testEmailResult, setTestEmailResult] = useState(null)
  const [error, setError] = useState('')
  const [notesMessage, setNotesMessage] = useState('')

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

    const load = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await getApplication(applicationId)
        if (isMounted) {
          setApplication(data)
          setAdminNotes(data.adminNotes ?? '')
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

    load()

    return () => {
      isMounted = false
    }
  }, [applicationId])

  const refreshApplication = async () => {
    if (!applicationId) return
    setIsLoading(true)
    setError('')

    try {
      const data = await getApplication(applicationId)
      setApplication(data)
      setAdminNotes(data.adminNotes ?? '')
    } catch (refreshError) {
      setError(getErrorMessage(refreshError, 'Unable to refresh application.'))
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (status) => {
    setIsUpdating(true)
    setError('')

    try {
      const updatedApplication = await updateApplicationStatus(application.id, status)
      setApplication(updatedApplication)
    } catch (updateError) {
      setError(getErrorMessage(updateError, 'Unable to update status.'))
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSaveNotes = async () => {
    setIsSavingNotes(true)
    setError('')
    setNotesMessage('')

    try {
      const updatedApplication = await updateApplicationAdminNotes(
        application.id,
        adminNotes,
      )
      setApplication(updatedApplication)
      setAdminNotes(updatedApplication.adminNotes ?? '')
      setNotesMessage('Admin notes saved.')
    } catch (notesError) {
      setError(getErrorMessage(notesError, 'Unable to save admin notes.'))
    } finally {
      setIsSavingNotes(false)
    }
  }

  const handleSendTestEmail = async () => {
    setIsSendingTest(true)
    setTestEmailResult(null)
    setError('')

    try {
      const result = await sendApplicationTestEmail(application.email)
      setTestEmailResult(result)
    } catch (testError) {
      setError(getErrorMessage(testError, 'Unable to send test email.'))
    } finally {
      setIsSendingTest(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm font-semibold text-slate-600">
          Loading application...
        </p>
      </Card>
    )
  }

  if (error && !application) {
    return (
      <Card>
        <p className="text-sm text-red-700">{error}</p>
        <Button to="/admin/applications" variant="outline" className="mt-4">
          <ArrowLeft className="h-4 w-4" />
          Back to applications
        </Button>
      </Card>
    )
  }

  const documentHref = getDocumentHref(application.documentUrl)
  const trackName = pathwayLabels[application.pathway] ?? application.pathway
  const activityRows = [
    {
      event: 'Application submitted',
      detail: 'Applicant completed the public application form.',
      date: application.createdAt,
    },
    {
      event: 'Status changed',
      detail: statusLabels[application.status] ?? application.status,
      date: application.updatedAt,
    },
    application.lastEmailStatus
      ? {
          event: 'Notification email',
          detail: application.lastEmailStatus,
          date: application.lastEmailSentAt ?? application.updatedAt,
        }
      : null,
  ].filter(Boolean)

  return (
    <section className="space-y-6 text-slate-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3">
            <Link to="/admin/applications">
              <ArrowLeft className="h-4 w-4" />
              Back to applications
            </Link>
          </Button>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950">
            {application.fullName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Applied for {trackName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={statusTone[application.status] ?? 'default'}>
            {statusLabels[application.status] ?? application.status}
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={refreshApplication}
            aria-label="Refresh application"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card padding={false}>
            <CardHeader>
              <CardTitle>Applicant profile</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name">{application.fullName}</Field>
                <Field label="Email">
                  <a
                    href={`mailto:${application.email}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {application.email}
                  </a>
                </Field>
                <Field label="Phone">{application.phone || 'Not provided'}</Field>
                <Field label="College / Organization">
                  {application.organization || 'Not provided'}
                </Field>
                <Field label="Selected learning track">{trackName}</Field>
                <Field label="Submitted date">
                  {new Date(application.createdAt).toLocaleString()}
                </Field>
              </dl>
            </CardContent>
          </Card>

          <Card padding={false}>
            <CardHeader>
              <CardTitle>Motivation letter</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {application.motivation}
              </p>
            </CardContent>
          </Card>

          <Card padding={false}>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {application.documentUrl ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                        <FileText className="h-4 w-4 text-indigo-600" />
                        {application.documentFileName || 'Uploaded document'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {application.documentContentType || 'File type unavailable'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Uploaded with application on{' '}
                        {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                      <p className="mt-2 text-xs font-medium text-amber-700">
                        Verification status: Not verified
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button href={documentHref} target="_blank" rel="noreferrer">
                        <Eye className="h-4 w-4" />
                        Open
                      </Button>
                      <Button
                        href={documentHref}
                        target="_blank"
                        rel="noreferrer"
                        variant="outline"
                        download
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No resume or document was uploaded with this application.
                </p>
              )}
            </CardContent>
          </Card>

          <Card padding={false}>
            <CardHeader>
              <CardTitle>Admin notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="adminNotes"
                name="adminNotes"
                value={adminNotes}
                onChange={(event) => {
                  setAdminNotes(event.target.value)
                  setNotesMessage('')
                }}
                rows={7}
                maxLength={2000}
                placeholder="Good motivation, basic Salesforce interest. Need to verify resume before approval."
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Only admins can view these notes.
                </p>
                <Button onClick={handleSaveNotes} disabled={isSavingNotes} size="sm">
                  <Save className="h-4 w-4" />
                  {isSavingNotes ? 'Saving...' : 'Save note'}
                </Button>
              </div>
              {notesMessage ? (
                <p className="mt-3 text-sm font-medium text-green-700">
                  {notesMessage}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card padding={false}>
            <CardHeader>
              <CardTitle>Activity log</CardTitle>
            </CardHeader>
            <CardContent>
              {activityRows.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Detail</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityRows.map((row) => (
                      <TableRow key={`${row.event}-${row.date}`}>
                        <TableCell className="font-medium text-slate-900">
                          {row.event}
                        </TableCell>
                        <TableCell>{row.detail}</TableCell>
                        <TableCell>
                          {row.date ? new Date(row.date).toLocaleString() : 'Not recorded'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No activity recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card padding={false}>
            <CardHeader>
              <CardTitle>Review status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-600">Current decision</span>
                <Badge tone={statusTone[application.status] ?? 'default'}>
                  {statusLabels[application.status] ?? application.status}
                </Badge>
              </div>
              <Select
                label="Update status"
                name="status"
                value={application.status}
                onChange={(event) => updateStatus(event.target.value)}
                disabled={isUpdating}
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Select>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Last notification
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {application.lastEmailStatus || 'No status email sent yet.'}
                </p>
                {application.lastEmailSentAt ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Sent {new Date(application.lastEmailSentAt).toLocaleString()}
                  </p>
                ) : null}
                {application.lastEmailError ? (
                  <p className="mt-2 text-xs text-red-600">
                    {application.lastEmailError}
                  </p>
                ) : null}
                {testEmailResult ? (
                  <p
                    className={`mt-2 text-xs ${
                      testEmailResult.sent ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    Test email {testEmailResult.status}
                    {testEmailResult.error ? `: ${testEmailResult.error}` : ''}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card padding={false}>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center"
                onClick={handleSendTestEmail}
                disabled={isSendingTest}
              >
                <Mail className="h-4 w-4" />
                {isSendingTest ? 'Sending test...' : 'Send test email'}
              </Button>
              <Button
                type="button"
                className="w-full justify-center"
                onClick={() => updateStatus('ENROLLED')}
                disabled={isUpdating}
              >
                <CheckCircle className="h-4 w-4" />
                Confirm enrollment
              </Button>
              <Button
                type="button"
                variant="danger"
                className="w-full justify-center"
                onClick={() => updateStatus('REJECTED')}
                disabled={isUpdating}
              >
                <XCircle className="h-4 w-4" />
                Reject application
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center"
                onClick={refreshApplication}
                disabled={isLoading}
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center"
                onClick={() => updateStatus('ACCEPTED')}
                disabled={isUpdating}
              >
                <Mail className="h-4 w-4" />
                Send acceptance email
              </Button>
              {application.documentUrl ? (
                <Button
                  href={documentHref}
                  target="_blank"
                  rel="noreferrer"
                  variant="outline"
                  className="w-full justify-center"
                  download
                >
                  <Download className="h-4 w-4" />
                  Download resume
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-center"
                  disabled
                >
                  <Download className="h-4 w-4" />
                  Download resume
                </Button>
              )}
            </CardContent>
          </Card>

          <Card padding={false}>
            <CardHeader>
              <CardTitle>Track capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{trackName}</p>
                <p className="mt-1 text-sm text-slate-600">
                  Capacity data is not connected yet.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card padding={false}>
            <CardHeader>
              <CardTitle>Interview schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">
                  No interview scheduled.
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Interview date, owner, and meeting link can appear here when
                  scheduling is added.
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  )
}
