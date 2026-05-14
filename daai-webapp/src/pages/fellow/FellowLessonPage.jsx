import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  completeFellowLesson,
  getFellowLessonDetail,
} from '../../services/learningService'

export default function FellowLessonPage() {
  const { lessonId } = useParams()
  const [lesson, setLesson] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [doneMsg, setDoneMsg] = useState('')

  useEffect(() => {
    let m = true
    const run = async () => {
      setLoadError('')
      setActionError('')
      setDoneMsg('')
      try {
        const res = await getFellowLessonDetail(lessonId)
        if (m) {
          setLesson(res)
        }
      } catch (err) {
        if (m) {
          const detail = err?.response?.data?.detail
          setLoadError(
            typeof detail === 'string' ? detail : 'Unable to load this lesson.',
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
  }, [lessonId])

  const handleComplete = async () => {
    setSaving(true)
    setActionError('')
    setDoneMsg('')
    try {
      await completeFellowLesson(lessonId)
      const res = await getFellowLessonDetail(lessonId)
      setLesson(res)
      setDoneMsg('Marked as completed.')
    } catch (err) {
      const detail = err?.response?.data?.detail
      setActionError(typeof detail === 'string' ? detail : 'Could not update progress.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm font-medium text-[#6f5f57]">Loading…</p>
      </section>
    )
  }

  if (loadError || !lesson) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {loadError || 'Lesson not found.'}
        </p>
        <Link to="/fellow/learning" className="mt-4 inline-block text-sm font-bold text-[#f26322]">
          ← Learning home
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 lg:px-0">
      <Link
        to={`/fellow/modules/${lesson.moduleId}`}
        className="text-sm font-bold text-[#f26322] hover:text-[#d94f13]"
      >
        ← Back to module
      </Link>
      <h1 className="mt-4 text-3xl font-black text-[#24140e]">{lesson.title}</h1>
      <p className="mt-2 text-xs font-bold uppercase text-[#6f5f57]">
        ~{lesson.estimatedMinutes} minutes · {lesson.completed ? 'Completed' : 'In progress'}
      </p>

      {lesson.videoUrl ? (
        <p className="mt-4">
          <a
            href={lesson.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-black text-[#f26322] underline"
          >
            Open video
          </a>
        </p>
      ) : null}
      {lesson.resourceUrl ? (
        <p className="mt-2">
          <a
            href={lesson.resourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-black text-[#f26322] underline"
          >
            Open resource
          </a>
        </p>
      ) : null}

      <div className="mt-6 rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-[#6f5f57]">
          {lesson.content || 'No written content for this lesson yet.'}
        </div>
      </div>

      {doneMsg ? (
        <p className="mt-4 text-sm font-bold text-green-700">{doneMsg}</p>
      ) : null}
      {actionError ? (
        <p className="mt-4 text-sm font-bold text-red-700">{actionError}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {lesson.completed ? (
          <span className="rounded-md bg-green-50 px-4 py-2 text-sm font-black text-green-800">
            Completed
          </span>
        ) : (
          <button
            type="button"
            disabled={saving}
            onClick={handleComplete}
            className="rounded-md bg-[#f26322] px-5 py-2 text-sm font-black text-white hover:bg-[#d94f13] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Mark as completed'}
          </button>
        )}
      </div>
    </section>
  )
}
