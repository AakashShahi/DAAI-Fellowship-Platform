import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFellowLearningModules } from '../../services/learningService'

export default function FellowLearningPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let m = true
    const run = async () => {
      setError('')
      try {
        const res = await getFellowLearningModules()
        if (m) {
          setData(res)
        }
      } catch {
        if (m) {
          setError('Unable to load learning modules.')
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
  }, [])

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm font-medium text-[#6f5f57]">Loading…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      </section>
    )
  }

  if (!data?.enrolled) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
          Learning
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#24140e]">Modules</h1>
        <div className="mt-8 rounded-lg border border-dashed border-orange-200 bg-[#fffaf6] p-8 text-center">
          <p className="text-lg font-black text-[#24140e]">
            You are not enrolled in any fellowship track yet.
          </p>
          <p className="mt-3 text-sm font-medium text-[#6f5f57]">
            Once you have an active enrollment, modules and lessons for your track will
            appear here.
          </p>
          <Link
            to="/fellow/my-track"
            className="mt-6 inline-flex rounded-md bg-[#f26322] px-5 py-2 text-sm font-black text-white hover:bg-[#d94f13]"
          >
            View enrollment status
          </Link>
        </div>
      </section>
    )
  }

  const modules = data.modules ?? []

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 lg:px-0">
      <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
        Learning
      </p>
      <h1 className="mt-2 text-3xl font-black text-[#24140e]">Your modules</h1>
      <p className="mt-2 text-sm font-medium text-[#6f5f57]">
        Published modules for your enrolled track. Open a module to see lessons.
      </p>

      {modules.length === 0 ? (
        <div className="mt-8 rounded-lg border border-orange-100 bg-white p-8 text-center shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
          <p className="font-black text-[#24140e]">No published modules yet</p>
          <p className="mt-2 text-sm text-[#6f5f57]">
            Your program team has not published modules for this track yet. Check back
            soon.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {modules.map((mod) => (
            <li key={mod.id}>
              <Link
                to={`/fellow/modules/${mod.id}`}
                className="block rounded-lg border border-orange-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)] transition hover:border-[#ffb088]"
              >
                <p className="text-xs font-black uppercase text-[#f26322]">Module</p>
                <h2 className="mt-1 text-xl font-black text-[#24140e]">{mod.title}</h2>
                <p className="mt-2 text-sm text-[#6f5f57]">{mod.description}</p>
                <p className="mt-3 text-xs font-bold text-[#6f5f57]">
                  Lessons completed {mod.completedLessonCount} / {mod.lessonCount}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
