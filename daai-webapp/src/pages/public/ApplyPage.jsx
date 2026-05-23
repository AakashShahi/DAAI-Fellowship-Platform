import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { FELLOWSHIP_PATHWAYS } from '../../constants/pathways'

export default function ApplyPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    pathway: '',
    motivation: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
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
            Thank you, {form.fullName || 'applicant'}. Our team will review your submission and
            contact you at {form.email}. This form is a UI placeholder until the applications API
            is connected.
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
            <Button type="submit" className="w-full sm:w-auto">
              Submit application
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}
