import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { FELLOWSHIP_PATHWAYS } from '../../constants/pathways'
import { submitApplication } from '../../services/applicationService'

export default function ApplyPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submittedApplication, setSubmittedApplication] = useState(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    pathway: '',
    motivation: '',
    document: null,
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (event) => {
    setForm((prev) => ({
      ...prev,
      document: event.target.files?.[0] ?? null,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const application = await submitApplication({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        organization: form.organization.trim() || null,
        pathway: form.pathway,
        motivation: form.motivation.trim(),
        document: form.document,
      })
      setSubmittedApplication(application)
      setSubmitted(true)
    } catch (submitError) {
      const detail = submitError?.response?.data?.detail
      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to submit your application. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const pathwayOptions = FELLOWSHIP_PATHWAYS.filter((p) => !p.comingSoon)

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Apply</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Join the DAAI Fellowship</h1>
      <p className="mt-3 text-slate-600">
        Submit your interest for the next cohort. If you already have an account, you can also{' '}
        <Link to="/register" className="font-medium text-indigo-600 hover:underline">
          register
        </Link>{' '}
        and complete onboarding in the fellow portal.
      </p>

      {submitted ? (
        <Card className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Application received</h2>
          <p className="mt-2 text-sm text-slate-600">
            Thank you, {submittedApplication?.fullName || form.fullName || 'applicant'}.
            Our team will review your submission and contact you at{' '}
            {submittedApplication?.email || form.email}.
          </p>
          <div className="mt-6">
            <Button to="/" variant="secondary">
              Back to home
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="mt-8" padding>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
            />
            <Input
              label="College / Organization"
              name="organization"
              value={form.organization}
              onChange={handleChange}
            />
            <Select
              label="Preferred pathway"
              name="pathway"
              value={form.pathway}
              onChange={handleChange}
              required
            >
              <option value="">Select a pathway</option>
              {pathwayOptions.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title}
                </option>
              ))}
            </Select>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Why do you want to join?
              </span>
              <textarea
                name="motivation"
                value={form.motivation}
                onChange={handleChange}
                rows={5}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Resume / documents
              </span>
              <input
                name="document"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-indigo-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
            {error ? (
              <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit application'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}
