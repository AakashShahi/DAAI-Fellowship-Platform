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
      <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">
        My track
      </p>
      <h1 className="mt-2 text-3xl font-black text-[#0f172a]">Fellowship enrollment</h1>
      <p className="mt-2 text-sm font-medium text-[#475569]">
        Official program track and batch assigned by the fellowship team.
      </p>

      {error ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="mt-8 text-sm font-medium text-[#475569]">Loading…</p>
      ) : !enrollment ? (
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-8 text-center shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
          <p className="text-lg font-black text-[#0f172a]">
            You are not enrolled in any fellowship track yet.
          </p>
          <p className="mt-3 text-sm font-medium text-[#475569]">
            When your cohort is ready, an administrator will assign you to a track and
            batch. You can still use quizzes and learning preferences from your
            dashboard.
          </p>
          <Link
            to="/fellow/dashboard"
            className="mt-6 inline-flex rounded-md bg-[#4f46e5] px-5 py-2 text-sm font-black text-white hover:bg-[#4338ca]"
          >
            Back to dashboard
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
            <h2 className="text-xl font-black text-[#0f172a]">{enrollment.track.title}</h2>
            <p className="mt-2 text-sm text-[#475569]">{enrollment.track.description}</p>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-bold text-[#0f172a]">Slug</dt>
                <dd className="text-[#475569]">{enrollment.track.slug}</dd>
              </div>
              <div>
                <dt className="font-bold text-[#0f172a]">Status</dt>
                <dd className="text-[#475569]">{enrollment.track.status}</dd>
              </div>
              <div>
                <dt className="font-bold text-[#0f172a]">Duration</dt>
                <dd className="text-[#475569]">{enrollment.track.duration || '—'}</dd>
              </div>
              <div>
                <dt className="font-bold text-[#0f172a]">Difficulty</dt>
                <dd className="text-[#475569]">{enrollment.track.difficulty || '—'}</dd>
              </div>
            </dl>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
            <h2 className="text-xl font-black text-[#0f172a]">Your batch</h2>
            <p className="mt-2 text-lg font-bold text-[#475569]">{enrollment.batch.name}</p>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-bold text-[#0f172a]">Starts</dt>
                <dd className="text-[#475569]">
                  {new Date(enrollment.batch.startDate).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#0f172a]">Ends</dt>
                <dd className="text-[#475569]">
                  {new Date(enrollment.batch.endDate).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#0f172a]">Batch status</dt>
                <dd className="text-[#475569]">{enrollment.batch.status}</dd>
              </div>
              <div>
                <dt className="font-bold text-[#0f172a]">Enrollment</dt>
                <dd className="text-[#475569]">
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
