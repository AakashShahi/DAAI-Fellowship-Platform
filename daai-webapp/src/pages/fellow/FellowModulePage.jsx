import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getFellowModuleDetail } from '../../services/learningService'

export default function FellowModulePage() {
  const { moduleId } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let m = true
    const run = async () => {
      setError('')
      try {
        const res = await getFellowModuleDetail(moduleId)
        if (m) {
          setData(res)
        }
      } catch (err) {
        if (m) {
          const detail = err?.response?.data?.detail
          setError(
            typeof detail === 'string' ? detail : 'Unable to load this module.',
          )
        }
      } finally {
        if (m) {
          setLoading(false)
        }
      }
    }
    run()
    return () => {
      m = false
    }
  }, [moduleId])

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm font-medium text-[#6f5f57]">Loading…</p>
      </section>
    )
  }

  if (error || !data) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error || 'Module not found.'}
        </p>
        <Link to="/fellow/learning" className="mt-4 inline-block text-sm font-bold text-[#f26322]">
          ← Back to learning
        </Link>
      </section>
    )
  }

  const { module, lessons } = data

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 lg:px-0">
      <Link to="/fellow/learning" className="text-sm font-bold text-[#f26322] hover:text-[#d94f13]">
        ← All modules
      </Link>
      <h1 className="mt-4 text-3xl font-black text-[#24140e]">{module.title}</h1>
      <p className="mt-2 text-sm text-[#6f5f57]">{module.description}</p>

      {lessons.length === 0 ? (
        <div className="mt-8 rounded-lg border border-orange-100 bg-white p-6 text-center shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
          <p className="font-black text-[#24140e]">No lessons in this module yet</p>
          <p className="mt-2 text-sm text-[#6f5f57]">
            Published lessons will be listed here when they are ready.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <Link
                to={`/fellow/lessons/${lesson.id}`}
                className="flex items-center justify-between rounded-lg border border-orange-100 bg-white px-4 py-3 shadow-sm transition hover:border-[#ffb088]"
              >
                <span className="font-bold text-[#24140e]">{lesson.title}</span>
                <span className="text-xs font-black text-[#f26322]">
                  {lesson.completed ? 'Completed' : 'Open'} · ~{lesson.estimatedMinutes}m
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
