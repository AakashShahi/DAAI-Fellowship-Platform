import { useState } from 'react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { getRoleLabel } from './RoleBadge'

export default function StaffForm({
  initialData = null,
  allowedRoles = [],
  isLoading = false,
  onSubmit,
  onCancel,
  isEdit = false,
}) {
  const [formData, setFormData] = useState({
    full_name: initialData?.full_name ?? '',
    email: initialData?.email ?? '',
    phone: initialData?.phone ?? '',
    role: initialData?.role ?? (allowedRoles.length === 1 ? allowedRoles[0] : ''),
  })
  const [errors, setErrors] = useState({})

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Name is required'
    }

    if (!isEdit && !formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!isEdit && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email'
    }

    if (!formData.role) {
      newErrors.role = 'Role is required'
    }

    if (formData.phone && formData.phone.length > 30) {
      newErrors.phone = 'Phone must be 30 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate()) return

    const payload = {
      full_name: formData.full_name.trim(),
      phone: formData.phone.trim() || null,
      role: formData.role,
    }

    if (!isEdit) {
      payload.email = formData.email.trim().toLowerCase()
    }

    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Full Name"
        name="full_name"
        placeholder="Enter full name"
        value={formData.full_name}
        onChange={handleChange('full_name')}
        error={errors.full_name}
        disabled={isLoading}
        required
      />

      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="Enter email address"
        value={formData.email}
        onChange={handleChange('email')}
        error={errors.email}
        disabled={isLoading || isEdit}
        required={!isEdit}
      />

      <Input
        label="Mobile / Phone"
        name="phone"
        type="tel"
        placeholder="Enter phone number"
        value={formData.phone}
        onChange={handleChange('phone')}
        error={errors.phone}
        disabled={isLoading}
      />

      <Select
        label="Role"
        name="role"
        value={formData.role}
        onChange={handleChange('role')}
        error={errors.role}
        disabled={isLoading || allowedRoles.length === 0}
      >
        <option value="">Select a role</option>
        {allowedRoles.map((role) => (
          <option key={role} value={role}>
            {getRoleLabel(role)}
          </option>
        ))}
      </Select>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving…' : isEdit ? 'Update Staff' : 'Create Staff'}
        </Button>
      </div>
    </form>
  )
}
