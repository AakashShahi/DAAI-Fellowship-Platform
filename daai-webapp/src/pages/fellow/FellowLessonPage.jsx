import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ResourceLinks from '../../components/learning/ResourceLinks'
import {
  completeFellowLesson,
  getFellowLessonDetail,
} from '../../services/learningService'

export default function FellowLessonPage() {
  const { moduleId, lessonId } = useParams()
  const [lesson, setLesson] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [doneMsg, setDoneMsg] = useState('')

  const loadLesson = async () => {
    const res = await getFellowLessonDetail(moduleId, lessonId)
    setLesson(res)
  }

  useEffect(() => {
    let isMounted = true
    getFellowLessonDetail(moduleId, lessonId)
      .then((res) => {
        if (isMounted) setLesson(res)
      })
      .catch((err) => {
        if (isMounted) {
          const detail = err?.response?.data?.detail
          setLoadError(typeof detail === 'string' ? detail : 'Unable to load this lesson.')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [moduleId, lessonId])

  const handleComplete = async () => {
    setSaving(true)
    setActionError('')
    setDoneMsg('')
    try {
      await completeFellowLesson(moduleId, lessonId)
      await loadLesson()
      setDoneMsg('Marked as completed.')
    } catch (err) {
      const detail = err?.response?.data?.detail
      setActionError(typeof detail === 'string' ? detail : 'Could not update progress.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold">Loading lesson...</p>
  if (loadError || !lesson) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-8">
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {loadError || 'Lesson not found.'}
        </p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 lg:px-0">
      <Link to={`/fellow/learning/${moduleId}`} className="text-sm font-bold text-[#4f46e5]">
        Back to module
      </Link>
      <h1 className="mt-4 text-3xl font-black text-[#0f172a]">{lesson.title}</h1>
      <p className="mt-2 text-xs font-bold uppercase text-[#475569]">
        {lesson.estimatedDurationMinutes} minutes · {lesson.completed ? 'Completed' : 'In progress'}
      </p>
      <p className="mt-3 text-sm font-medium text-[#475569]">{lesson.description}</p>

      {lesson.videoUrl ? (
        <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white p-4">
          <a className="text-sm font-black text-[#4f46e5] underline" href={lesson.videoUrl} target="_blank" rel="noreferrer">
            Open video
          </a>
        </div>
      ) : null}

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-[#475569]">
          {lesson.content || 'No written content for this lesson yet.'}
        </div>
      </div>

      <ResourceLinks resources={lesson.resourceLinks} />

      {doneMsg ? <p className="mt-4 text-sm font-bold text-green-700">{doneMsg}</p> : null}
      {actionError ? <p className="mt-4 text-sm font-bold text-red-700">{actionError}</p> : null}

      <div className="mt-6">
        {lesson.completed ? (
          <span className="rounded-md bg-green-50 px-4 py-2 text-sm font-black text-green-800">
            Completed
          </span>
        ) : (
          <button
            type="button"
            disabled={saving}
            onClick={handleComplete}
            className="rounded-md bg-[#4f46e5] px-5 py-2 text-sm font-black text-white hover:bg-[#4338ca] disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Mark as Completed'}
          </button>
        )}
      </div>
    </section>
  )
}
