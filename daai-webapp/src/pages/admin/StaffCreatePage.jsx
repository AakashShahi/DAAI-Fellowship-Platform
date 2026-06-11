import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, Check, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

import AdminPageHeader from '../../components/admin/AdminPageHeader'
import StaffForm from '../../components/admin/StaffForm'
import { useAllowedRoles, useStaffMutations } from '../../hooks/useStaff'
import { ErrorState, LoadingState } from '../../components/admin/AdminStates'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import UnauthorizedPage from '../UnauthorizedPage'

export default function StaffCreatePage() {
  const navigate = useNavigate()
  const { roles: allowedRoles, isLoading: rolesLoading } = useAllowedRoles()
  const { handleCreate, isLoading: isCreating, error } = useStaffMutations()
  const [createdResult, setCreatedResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const onSubmit = async (payload) => {
    try {
      const result = await handleCreate(payload)
      if (result?.setup_link) {
        // Surface the setup link before navigating away
        setCreatedResult(result)
      } else {
        navigate('/admin/staff')
      }
    } catch {
      // Error handled in hook and displayed via ErrorState
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(createdResult.setup_link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select the text in the input
    }
  }

  if (rolesLoading) {
    return (
      <section>
        <AdminPageHeader label="Staff" title="Add New Staff" compact />
        <LoadingState message="Checking permissions..." />
      </section>
    )
  }

  if (allowedRoles.length === 0) {
    return <UnauthorizedPage />
  }

  // ── Step 2: show setup link after creation ─────────────────────
  if (createdResult) {
    const { staff, setup_link } = createdResult
    return (
      <section className="mx-auto max-w-3xl">
        <AdminPageHeader
          label="Staff"
          title="Staff Account Created"
          description={`${staff.full_name} has been added. Share the setup link below so they can activate their account.`}
          compact
        />

        <Card className="mt-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Account created successfully</p>
              <p className="text-sm text-slate-500">
                Email: <span className="font-medium">{staff.email}</span>
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="mb-2 text-sm font-semibold text-amber-800">
              ⚠ SMTP is not configured — share this link manually
            </p>
            <p className="mb-3 text-xs text-amber-700">
              Copy and send this link to <strong>{staff.full_name}</strong>. It expires in 24 hours.
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={setup_link}
                className="min-w-0 flex-1 rounded-md border border-amber-300 bg-white px-3 py-2 font-mono text-xs text-slate-700 outline-none"
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <a
                href={setup_link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open
              </a>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setCreatedResult(null) }}>
              Add Another
            </Button>
            <Button onClick={() => navigate('/admin/staff')}>
              Go to Staff List
            </Button>
          </div>
        </Card>
      </section>
    )
  }

  // ── Step 1: form ───────────────────────────────────────────────
  return (
    <section className="mx-auto max-w-3xl">
      <Link
        to="/admin/staff"
        className="mb-4 inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Staff List
      </Link>

      <AdminPageHeader
        label="Staff"
        title="Add New Staff"
        description="Create a new staff account. An activation link will be sent (or shown here) automatically."
        compact
      />

      {error ? (
        <div className="mb-5">
          <ErrorState message={error} />
        </div>
      ) : null}

      <Card>
        <StaffForm
          allowedRoles={allowedRoles}
          isLoading={isCreating}
          onSubmit={onSubmit}
          onCancel={() => navigate('/admin/staff')}
        />
      </Card>
    </section>
  )
}
