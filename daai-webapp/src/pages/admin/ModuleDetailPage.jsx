import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import LessonEditor from '../../components/admin/LessonEditor'
import ModuleStatusBadge from '../../components/admin/ModuleStatusBadge'
import TrackBadge from '../../components/admin/TrackBadge'
import {
  createLesson,
  deleteLesson,
  getModuleAdmin,
  updateLesson,
} from '../../services/learningService'

const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

export default function ModuleDetailPage() {
  const { moduleId } = useParams()
  const [module, setModule] = useState(null)
  const [editingLesson, setEditingLesson] = useState(null)
  const [showNewLesson, setShowNewLesson] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const refreshModule = async () => {
    const data = await getModuleAdmin(moduleId)
    setModule(data)
  }

  useEffect(() => {
    let isMounted = true
    getModuleAdmin(moduleId)
      .then((data) => {
        if (isMounted) setModule(data)
      })
      .catch((loadError) => {
        if (isMounted) setError(getErrorMessage(loadError, 'Unable to load module.'))
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [moduleId])

  const handleCreateLesson = async (lesson) => {
    setIsSaving(true)
    setError('')
    try {
      await createLesson(moduleId, lesson)
      setShowNewLesson(false)
      await refreshModule()
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Unable to save lesson.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateLesson = async (lesson) => {
    setIsSaving(true)
    setError('')
    try {
      await updateLesson(moduleId, editingLesson.id, lesson)
      setEditingLesson(null)
      await refreshModule()
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Unable to update lesson.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteLesson = async (lesson) => {
    if (!window.confirm(`Archive lesson "${lesson.title}"?`)) return
    setError('')
    try {
      await deleteLesson(moduleId, lesson.id)
      await refreshModule()
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Unable to archive lesson.'))
    }
  }

  if (isLoading) return <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold">Loading module...</p>
  if (!module) return <p className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">{error || 'Module not found.'}</p>

  return (
    <section>
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
        <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">
          Module Detail
        </p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#0f172a]">{module.title}</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium text-[#475569]">
              {module.description || 'No description added.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TrackBadge selectedTrack={module.track} />
            <ModuleStatusBadge status={module.status} />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="text-sm font-black text-[#4f46e5]" to={`/admin/modules/${module.id}/edit`}>
            Edit module
          </Link>
          <button
            type="button"
            className="text-sm font-black text-[#4f46e5]"
            onClick={() => setShowNewLesson(true)}
          >
            Add lesson
          </button>
        </div>
      </div>
      {error ? <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
      {showNewLesson ? (
        <div className="mb-6">
          <LessonEditor
            onSave={handleCreateLesson}
            onCancel={() => setShowNewLesson(false)}
            isSaving={isSaving}
          />
        </div>
      ) : null}
      {editingLesson ? (
        <div className="mb-6">
          <LessonEditor
            initialLesson={editingLesson}
            onSave={handleUpdateLesson}
            onCancel={() => setEditingLesson(null)}
            isSaving={isSaving}
          />
        </div>
      ) : null}
      <div className="grid gap-3">
        {module.lessons.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold text-[#475569]">No lessons yet.</p>
        ) : (
          module.lessons.map((lesson) => (
            <article key={lesson.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">
                    Lesson {lesson.order} · {lesson.isPublished ? 'Published' : 'Draft'} · {lesson.estimatedDurationMinutes} min
                  </p>
                  <h2 className="mt-1 text-xl font-black text-[#0f172a]">{lesson.title}</h2>
                  <p className="mt-2 text-sm font-medium text-[#475569]">{lesson.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-black text-[#4f46e5]" onClick={() => setEditingLesson(lesson)}>
                    Edit lesson
                  </button>
                  <button type="button" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-black text-red-700" onClick={() => handleDeleteLesson(lesson)}>
                    Delete lesson
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
