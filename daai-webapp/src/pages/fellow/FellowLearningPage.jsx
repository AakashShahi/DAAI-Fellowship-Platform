import { useEffect, useMemo, useState } from 'react'
import ModuleCard from '../../components/learning/ModuleCard'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import ProgressBar from '../../components/ui/ProgressBar'
import Skeleton from '../../components/ui/Skeleton'
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
        if (!isMounted) return
        setModules(Array.isArray(moduleData) ? moduleData : moduleData?.modules ?? [])
        setProgress(progressData)
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
    () => modules.find((module) => (module.completionPercentage ?? 0) < 100) ?? modules[0],
    [modules],
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </p>
    )
  }

  return (
    <section>
      <PageHeader
        eyebrow="My Learning"
        title="Course dashboard"
        description="Published modules for your enrolled track. Open a module to view lessons."
        actions={
          nextModule ? (
            <Button to={`/fellow/learning/${nextModule.id}`}>Continue learning</Button>
          ) : null
        }
      />

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <ProgressBar
          value={progress?.completionPercentage ?? 0}
          label="Overall progress"
        />
        <p className="mt-2 text-sm text-slate-600">
          {progress?.completedLessons ?? 0} / {progress?.totalLessons ?? 0} lessons completed
        </p>
      </div>

      {modules.length === 0 ? (
        <EmptyState
          title="No published modules yet"
          description="Your program team has not published modules for this track yet. Check back soon."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      )}
    </section>
  )
}
