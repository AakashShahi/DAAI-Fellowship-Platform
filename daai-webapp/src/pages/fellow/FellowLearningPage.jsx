import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ModuleCard from '../../components/learning/ModuleCard'
import ProgressBar from '../../components/learning/ProgressBar'
import {
  getFellowLearningModules,
  getFellowLearningSummary,
} from '../../services/learningService'

export default function FellowLearningPage() {
  const [modules, setModules] = useState([])
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    Promise.all([getFellowLearningModules(), getFellowLearningSummary()])
      .then(([moduleData, progressData]) => {
        if (isMounted) {
          setModules(moduleData)
          setProgress(progressData)
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          const detail = loadError?.response?.data?.detail
          setError(typeof detail === 'string' ? detail : 'Unable to load learning modules.')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const nextModule = useMemo(
    () => modules.find((module) => module.completionPercentage < 100) ?? modules[0],
    [modules],
  )

  if (loading) {
    return <p className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold">Loading learning dashboard...</p>
  }

  if (error) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-8">
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 lg:px-0">
      <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
        <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
          Learning
        </p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#24140e]">
              Your course dashboard
            </h1>
            <p className="mt-2 text-sm font-medium text-[#6f5f57]">
              Published modules for your selected learning track.
            </p>
          </div>
          {nextModule ? (
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#f26322] px-4 text-sm font-black text-white transition hover:bg-[#d94f13]"
              to={`/fellow/learning/${nextModule.id}`}
            >
              Continue Learning
            </Link>
          ) : null}
        </div>
        <div className="mt-6">
          <ProgressBar value={progress?.completionPercentage ?? 0} />
          <p className="mt-2 text-sm font-black text-[#6f5f57]">
            {progress?.completedLessons ?? 0} / {progress?.totalLessons ?? 0} lessons completed · {progress?.completionPercentage ?? 0}%
          </p>
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="mt-8 rounded-lg border border-orange-100 bg-white p-8 text-center shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
          <p className="font-black text-[#24140e]">No published modules yet</p>
          <p className="mt-2 text-sm text-[#6f5f57]">
            Your program team has not published modules for this track yet.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      )}
    </section>
  )
}
