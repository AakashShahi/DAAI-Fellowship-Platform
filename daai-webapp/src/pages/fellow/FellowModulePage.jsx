import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import LessonList from '../../components/learning/LessonList'
import ProgressBar from '../../components/learning/ProgressBar'
import { getFellowModuleDetail } from '../../services/learningService'

export default function FellowModulePage() {
  const { moduleId } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    getFellowModuleDetail(moduleId)
      .then((res) => {
        if (isMounted) setData(res)
      })
      .catch((err) => {
        if (isMounted) {
          const detail = err?.response?.data?.detail
          setError(typeof detail === 'string' ? detail : 'Unable to load this module.')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [moduleId])

  if (loading) return <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold">Loading module...</p>
  if (error || !data) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-8">
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error || 'Module not found.'}
        </p>
      </section>
    )
  }

  const { module, lessons } = data

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 lg:px-0">
      <Link to="/fellow/learning" className="text-sm font-bold text-[#4f46e5]">
        All modules
      </Link>
      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
        <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">
          Module {module.order}
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#0f172a]">{module.title}</h1>
        <p className="mt-3 text-sm font-medium text-[#475569]">{module.description}</p>
        <div className="mt-5">
          <ProgressBar value={module.completionPercentage} />
          <p className="mt-2 text-xs font-black uppercase tracking-wide text-[#475569]">
            {module.completedLessonCount} / {module.lessonCount} lessons completed
          </p>
        </div>
      </div>
      <div className="mt-6">
        <LessonList moduleId={module.id} lessons={lessons} />
      </div>
    </section>
  )
}
