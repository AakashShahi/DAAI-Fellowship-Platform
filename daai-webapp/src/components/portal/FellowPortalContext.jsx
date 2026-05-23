import { useEffect, useState } from 'react'
import { getMyEnrollment } from '../../services/fellowshipService'
import { getMyCohort } from '../../services/cohortService'
import { getMyProfile } from '../../services/profileService'
import useAuthStore from '../../store/authStore'
import { getFellowTrack } from '../../utils/learningTrackAccess'

export default function FellowPortalContext() {
  const user = useAuthStore((state) => state.user)
  const [trackLabel, setTrackLabel] = useState('')
  const [cohortLabel, setCohortLabel] = useState('')

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const [profileRes, enrollmentRes, cohortRes] = await Promise.allSettled([
          getMyProfile(),
          getMyEnrollment(),
          getMyCohort(),
        ])

        if (!mounted) return

        const profile =
          profileRes.status === 'fulfilled' ? profileRes.value : null
        const track = getFellowTrack({
          ...user,
          learningTrack: profile?.learningTrack ?? user?.learningTrack,
        })
        setTrackLabel(track?.title ?? track?.label ?? 'Track not selected')

        const enrollment =
          enrollmentRes.status === 'fulfilled'
            ? enrollmentRes.value?.enrollment
            : null
        const cohort =
          cohortRes.status === 'fulfilled' ? cohortRes.value?.cohort : null

        setCohortLabel(
          cohort?.name ??
            enrollment?.batchName ??
            (enrollment ? 'Cohort assigned' : 'No cohort yet'),
        )
      } catch {
        if (mounted) {
          setTrackLabel('—')
          setCohortLabel('—')
        }
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [user])

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
      <span>
        <span className="font-semibold text-slate-800">Track:</span> {trackLabel}
      </span>
      <span>
        <span className="font-semibold text-slate-800">Cohort:</span> {cohortLabel}
      </span>
    </div>
  )
}
