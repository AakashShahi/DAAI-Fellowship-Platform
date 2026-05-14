import { useEffect, useMemo, useState } from 'react'
import {
  changeMyPassword,
  getMyProfile,
  updateMyProfile,
} from '../services/profileService'
import useAuthStore from '../store/authStore'

const fieldClass =
  'mt-2 w-full rounded-md border border-orange-100 bg-white px-3 py-2.5 text-sm font-medium text-[#24140e] outline-none transition placeholder:text-[#b49a8d] focus:border-[#f26322] focus:ring-2 focus:ring-[#ffd7c1] disabled:cursor-not-allowed disabled:bg-[#fff8f3] disabled:text-[#8d7a70]'

const cardClass =
  'rounded-lg border border-orange-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]'

const emptyProfile = {
  fullName: '',
  email: '',
  role: '',
  phone: '',
  location: '',
  bio: '',
  avatarInitial: 'U',
  avatarUrl: '',
}

const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail) && detail[0]?.msg) {
    return detail[0].msg
  }

  return fallback
}

export default function ProfileSettingsPage() {
  const storeUser = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const [profile, setProfile] = useState(emptyProfile)
  const [profileForm, setProfileForm] = useState(emptyProfile)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const displayProfile = useMemo(
    () => ({
      ...emptyProfile,
      fullName: storeUser?.full_name ?? storeUser?.fullName ?? '',
      email: storeUser?.email ?? '',
      role: storeUser?.role ?? '',
      ...profile,
    }),
    [profile, storeUser],
  )

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      try {
        const data = await getMyProfile()

        if (isMounted) {
          const normalizedProfile = {
            ...emptyProfile,
            ...data,
            phone: data.phone ?? '',
            location: data.location ?? '',
            bio: data.bio ?? '',
            avatarUrl: data.avatarUrl ?? '',
          }

          setProfile(normalizedProfile)
          setProfileForm(normalizedProfile)
          updateUser({
            full_name: data.fullName,
            email: data.email,
            role: data.role,
            phone: data.phone ?? '',
            location: data.location ?? '',
            bio: data.bio ?? '',
            avatarUrl: data.avatarUrl ?? '',
          })
        }
      } catch (error) {
        if (isMounted) {
          setProfileError(
            getErrorMessage(error, 'Unable to load your profile.'),
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [updateUser])

  const validateProfile = () => {
    const phonePattern = /^[+()\-. \d]{7,30}$/

    if (!profileForm.fullName.trim()) {
      return 'Full name is required.'
    }

    if (profileForm.phone.trim() && !phonePattern.test(profileForm.phone.trim())) {
      return 'Enter a valid phone number.'
    }

    if (profileForm.bio.length > 500) {
      return 'Bio must be 500 characters or less.'
    }

    return ''
  }

  const validatePassword = () => {
    if (!passwordForm.currentPassword) {
      return 'Enter your current password.'
    }

    if (passwordForm.newPassword.length < 8) {
      return 'New password must be at least 8 characters.'
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return 'New password and confirmation do not match.'
    }

    return ''
  }

  const handleProfileChange = (event) => {
    const { name, value } = event.target

    setProfileForm((currentProfileForm) => ({
      ...currentProfileForm,
      [name]: value,
    }))
    setProfileError('')
    setSuccessMessage('')
  }

  const handlePasswordChange = (event) => {
    const { name, value } = event.target

    setPasswordForm((currentPasswordForm) => ({
      ...currentPasswordForm,
      [name]: value,
    }))
    setPasswordError('')
    setSuccessMessage('')
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()

    const validationError = validateProfile()
    if (validationError) {
      setProfileError(validationError)
      return
    }

    setIsSavingProfile(true)
    setProfileError('')
    setSuccessMessage('')

    try {
      const updatedProfile = await updateMyProfile({
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim() || null,
        location: profileForm.location.trim() || null,
        bio: profileForm.bio.trim() || null,
      })
      const normalizedProfile = {
        ...emptyProfile,
        ...updatedProfile,
        phone: updatedProfile.phone ?? '',
        location: updatedProfile.location ?? '',
        bio: updatedProfile.bio ?? '',
        avatarUrl: updatedProfile.avatarUrl ?? '',
      }

      setProfile(normalizedProfile)
      setProfileForm(normalizedProfile)
      updateUser({
        full_name: updatedProfile.fullName,
        email: updatedProfile.email,
        role: updatedProfile.role,
        phone: updatedProfile.phone ?? '',
        location: updatedProfile.location ?? '',
        bio: updatedProfile.bio ?? '',
        avatarUrl: updatedProfile.avatarUrl ?? '',
      })
      setSuccessMessage('Profile updated successfully.')
    } catch (error) {
      setProfileError(getErrorMessage(error, 'Unable to update your profile.'))
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()

    const validationError = validatePassword()
    if (validationError) {
      setPasswordError(validationError)
      return
    }

    setIsUpdatingPassword(true)
    setPasswordError('')
    setSuccessMessage('')

    try {
      await changeMyPassword(passwordForm)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setSuccessMessage('Password updated successfully.')
    } catch (error) {
      setPasswordError(getErrorMessage(error, 'Unable to update password.'))
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#fff8f3] px-4 py-8 text-[#6f5f57] sm:px-6 lg:px-8">
        <section className="mx-auto max-w-6xl">
          <div className={cardClass}>
            <p className="text-sm font-bold">Loading profile settings...</p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fff8f3] px-4 py-8 text-[#6f5f57] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
            Profile Settings
          </p>
          <h1 className="mt-2 text-3xl font-black text-[#24140e] lg:text-4xl">
            Manage your account
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium">
            Keep your fellowship profile accurate and your account secure.
          </p>
        </div>

        {successMessage ? (
          <p className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <aside className={cardClass}>
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center lg:flex-col lg:items-start">
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#f26322] text-3xl font-black uppercase text-white">
                {displayProfile.avatarUrl ? (
                  <img
                    src={displayProfile.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  displayProfile.avatarInitial
                )}
              </div>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[#24140e]">
                  {displayProfile.fullName || 'User Profile'}
                </h2>
                <p className="mt-1 break-words text-sm font-semibold">
                  {displayProfile.email}
                </p>
                <span className="mt-3 inline-flex rounded-full bg-[#fff1e8] px-3 py-1 text-xs font-black text-[#f26322]">
                  {displayProfile.role || 'USER'}
                </span>
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            <form onSubmit={handleProfileSubmit} className={cardClass}>
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
                  Personal Information
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#24140e]">
                  Profile details
                </h2>
              </div>

              {profileError ? (
                <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {profileError}
                </p>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="text-sm font-black text-[#24140e]">
                    Full name
                  </span>
                  <input
                    name="fullName"
                    value={profileForm.fullName}
                    onChange={handleProfileChange}
                    className={fieldClass}
                    disabled={isSavingProfile}
                    placeholder="Enter your full name"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-black text-[#24140e]">
                    Phone
                  </span>
                  <input
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    className={fieldClass}
                    disabled={isSavingProfile}
                    placeholder="+1 555 123 4567"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-black text-[#24140e]">
                    Location
                  </span>
                  <input
                    name="location"
                    value={profileForm.location}
                    onChange={handleProfileChange}
                    className={fieldClass}
                    disabled={isSavingProfile}
                    placeholder="City, country"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-sm font-black text-[#24140e]">
                    Bio
                  </span>
                  <textarea
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    className={`${fieldClass} min-h-32 resize-y`}
                    disabled={isSavingProfile}
                    maxLength={500}
                    placeholder="Write a short profile bio"
                  />
                  <span className="mt-1 block text-right text-xs font-bold text-[#8d7a70]">
                    {profileForm.bio.length}/500
                  </span>
                </label>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="rounded-md bg-[#f26322] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#d94f13] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>

            <section className={cardClass}>
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
                  Account Details
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#24140e]">
                  Sign-in information
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-black text-[#24140e]">
                    Email
                  </span>
                  <input
                    value={displayProfile.email}
                    className={fieldClass}
                    disabled
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-black text-[#24140e]">
                    Role
                  </span>
                  <input
                    value={displayProfile.role}
                    className={fieldClass}
                    disabled
                  />
                </label>
              </div>
            </section>

            <form onSubmit={handlePasswordSubmit} className={cardClass}>
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
                  Security
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#24140e]">
                  Change password
                </h2>
              </div>

              {passwordError ? (
                <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {passwordError}
                </p>
              ) : null}

              <div className="grid gap-4 md:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-black text-[#24140e]">
                    Current password
                  </span>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className={fieldClass}
                    disabled={isUpdatingPassword}
                    autoComplete="current-password"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-black text-[#24140e]">
                    New password
                  </span>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className={fieldClass}
                    disabled={isUpdatingPassword}
                    autoComplete="new-password"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-black text-[#24140e]">
                    Confirm password
                  </span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className={fieldClass}
                    disabled={isUpdatingPassword}
                    autoComplete="new-password"
                  />
                </label>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="rounded-md bg-[#24140e] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#3a261d] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
