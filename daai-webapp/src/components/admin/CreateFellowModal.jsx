import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { createStaff } from '../../services/staffService'
import Button from '../ui/Button'

export default function CreateFellowModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }))
  }

  const validate = () => {
    if (form.password && form.password.length < 8) {
      return 'Password must be at least 8 characters.'
    }
    if (form.password && form.password !== form.confirmPassword) {
      return 'Passwords do not match.'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSaving(true)

    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || undefined,
        role: 'FELLOW',
      }
      // Only include password if admin explicitly provided one
      if (form.password) {
        payload.password = form.password
      }

      await createStaff(payload)
      onSave()
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to create fellow.')
    } finally {
      setIsSaving(false)
    }
  }

  const hasPassword = Boolean(form.password)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
            <h2 className="text-xl font-black text-[#0f172a]">Add New Fellow</h2>
            <p className="mt-1 text-sm font-medium text-[#475569]">
              Create a fellow account. If you set a password, they can log in immediately.
            </p>
          </div>

          <div className="grid gap-4 px-6 py-5">
            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </p>
            )}

            {/* Full Name */}
            <label className="grid gap-1.5 text-sm font-bold text-[#0f172a]">
              Full Name <span className="text-red-500">*</span>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="e.g. Nischal Thapa"
                className="rounded-md border border-slate-200 px-3 py-2.5 text-sm font-medium text-[#0f172a] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
                required
              />
            </label>

            {/* Email */}
            <label className="grid gap-1.5 text-sm font-bold text-[#0f172a]">
              Email Address <span className="text-red-500">*</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="fellow@example.com"
                className="rounded-md border border-slate-200 px-3 py-2.5 text-sm font-medium text-[#0f172a] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
                required
              />
            </label>

            {/* Phone */}
            <label className="grid gap-1.5 text-sm font-bold text-[#0f172a]">
              Phone
              <span className="text-xs font-medium text-slate-400">(optional)</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+977-98XXXXXXXX"
                className="rounded-md border border-slate-200 px-3 py-2.5 text-sm font-medium text-[#0f172a] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
              />
            </label>

            {/* Divider */}
            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 border-t border-dashed border-slate-200" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Password
              </span>
              <div className="flex-1 border-t border-dashed border-slate-200" />
            </div>

            <p className="rounded-md bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700">
              Leave blank to send a password-setup email link instead.
            </p>

            {/* Password */}
            <label className="grid gap-1.5 text-sm font-bold text-[#0f172a]">
              Password
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 pr-10 text-sm font-medium text-[#0f172a] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {/* Confirm Password */}
            <label className={`grid gap-1.5 text-sm font-bold text-[#0f172a] transition-opacity ${hasPassword ? 'opacity-100' : 'pointer-events-none opacity-40'}`}>
              Confirm Password
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                disabled={!hasPassword}
                className="rounded-md border border-slate-200 px-3 py-2.5 text-sm font-medium text-[#0f172a] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 disabled:bg-slate-50"
              />
            </label>

            {/* Password match indicator */}
            {hasPassword && form.confirmPassword && (
              <p className={`text-xs font-bold ${form.password === form.confirmPassword ? 'text-emerald-600' : 'text-red-600'}`}>
                {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Creating...' : hasPassword ? 'Create & Set Password' : 'Create & Send Email'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
