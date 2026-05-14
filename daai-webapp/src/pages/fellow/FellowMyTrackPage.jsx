import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyEnrollment } from '../../services/fellowshipService'

export default function FellowMyTrackPage() {
  const [payload, setPayload] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const run = async () => {
      setError('')
      try {
        const data = await getMyEnrollment()
        if (mounted) {
          setPayload(data)
        }
      } catch {
        if (mounted) {
          setError('Unable to load enrollment.')
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [])

  const enrollment = payload?.enrollment

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 lg:px-0">
      <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
        My track
      </p>
      <h1 className="mt-2 text-3xl font-black text-[#24140e]">Fellowship enrollment</h1>
      <p className="mt-2 text-sm font-medium text-[#6f5f57]">
        Official program track and batch assigned by the fellowship team.
      </p>

      {error ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="mt-8 text-sm font-medium text-[#6f5f57]">Loading…</p>
      ) : !enrollment ? (
        <div className="mt-8 rounded-lg border border-orange-100 bg-white p-8 text-center shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
          <p className="text-lg font-black text-[#24140e]">
            You are not enrolled in any fellowship track yet.
          </p>
          <p className="mt-3 text-sm font-medium text-[#6f5f57]">
            When your cohort is ready, an administrator will assign you to a track and
            batch. You can still use quizzes and learning preferences from your
            dashboard.
          </p>
          <Link
            to="/fellow/dashboard"
            className="mt-6 inline-flex rounded-md bg-[#f26322] px-5 py-2 text-sm font-black text-white hover:bg-[#d94f13]"
          >
            Back to dashboard
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <article className="rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
            <h2 className="text-xl font-black text-[#24140e]">{enrollment.track.title}</h2>
            <p className="mt-2 text-sm text-[#6f5f57]">{enrollment.track.description}</p>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-bold text-[#24140e]">Slug</dt>
                <dd className="text-[#6f5f57]">{enrollment.track.slug}</dd>
              </div>
              <div>
                <dt className="font-bold text-[#24140e]">Status</dt>
                <dd className="text-[#6f5f57]">{enrollment.track.status}</dd>
              </div>
              <div>
                <dt className="font-bold text-[#24140e]">Duration</dt>
                <dd className="text-[#6f5f57]">{enrollment.track.duration || '—'}</dd>
              </div>
              <div>
                <dt className="font-bold text-[#24140e]">Difficulty</dt>
                <dd className="text-[#6f5f57]">{enrollment.track.difficulty || '—'}</dd>
              </div>
            </dl>
          </article>
          <article className="rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
            <h2 className="text-xl font-black text-[#24140e]">Your batch</h2>
            <p className="mt-2 text-lg font-bold text-[#6f5f57]">{enrollment.batch.name}</p>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-bold text-[#24140e]">Starts</dt>
                <dd className="text-[#6f5f57]">
                  {new Date(enrollment.batch.startDate).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#24140e]">Ends</dt>
                <dd className="text-[#6f5f57]">
                  {new Date(enrollment.batch.endDate).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#24140e]">Batch status</dt>
                <dd className="text-[#6f5f57]">{enrollment.batch.status}</dd>
              </div>
              <div>
                <dt className="font-bold text-[#24140e]">Enrollment</dt>
                <dd className="text-[#6f5f57]">
                  {enrollment.status} · since{' '}
                  {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </article>
        </div>
      )}
    </section>
  )
}
