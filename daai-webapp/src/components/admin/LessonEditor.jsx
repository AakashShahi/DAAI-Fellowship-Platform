import { useState } from 'react'
import { RESOURCE_TYPE_OPTIONS } from '../../constants/curriculum'

const emptyLesson = {
  title: '',
  description: '',
  content: '',
  videoUrl: '',
  resourceLinks: [],
  order: 0,
  estimatedDurationMinutes: 0,
  isPublished: false,
}

export default function LessonEditor({ initialLesson, onSave, onCancel, isSaving }) {
  const [lesson, setLesson] = useState(initialLesson ?? emptyLesson)
  const [resourceDraft, setResourceDraft] = useState({
    title: '',
    url: '',
    type: 'external',
  })

  const updateField = (field, value) => {
    setLesson((current) => ({ ...current, [field]: value }))
  }

  const addResource = () => {
    if (!resourceDraft.title || !resourceDraft.url) {
      return
    }
    setLesson((current) => ({
      ...current,
      resourceLinks: [...(current.resourceLinks ?? []), resourceDraft],
    }))
    setResourceDraft({ title: '', url: '', type: 'external' })
  }

  const removeResource = (index) => {
    setLesson((current) => ({
      ...current,
      resourceLinks: current.resourceLinks.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  return (
    <form
      className="grid gap-4 rounded-lg border border-orange-100 bg-[#fff8f3] p-5"
      onSubmit={(event) => {
        event.preventDefault()
        onSave({
          ...lesson,
          order: Number(lesson.order) || 0,
          estimatedDurationMinutes:
            Number(lesson.estimatedDurationMinutes) || 0,
        })
      }}
    >
      <label className="grid gap-2 text-sm font-black text-[#24140e]">
        Title
        <input
          className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold text-[#6f5f57]"
          value={lesson.title}
          onChange={(event) => updateField('title', event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-black text-[#24140e]">
        Description
        <textarea
          className="min-h-20 rounded-md border border-orange-100 px-3 py-2 text-sm font-bold text-[#6f5f57]"
          value={lesson.description}
          onChange={(event) => updateField('description', event.target.value)}
        />
      </label>
      <label className="grid gap-2 text-sm font-black text-[#24140e]">
        Content
        <textarea
          className="min-h-40 rounded-md border border-orange-100 px-3 py-2 text-sm font-bold text-[#6f5f57]"
          value={lesson.content}
          onChange={(event) => updateField('content', event.target.value)}
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-black text-[#24140e]">
          Video URL
          <input
            className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold text-[#6f5f57]"
            value={lesson.videoUrl}
            onChange={(event) => updateField('videoUrl', event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-black text-[#24140e]">
          Estimated minutes
          <input
            className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold text-[#6f5f57]"
            type="number"
            min="0"
            value={lesson.estimatedDurationMinutes}
            onChange={(event) =>
              updateField('estimatedDurationMinutes', event.target.value)
            }
          />
        </label>
        <label className="grid gap-2 text-sm font-black text-[#24140e]">
          Order
          <input
            className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold text-[#6f5f57]"
            type="number"
            min="0"
            value={lesson.order}
            onChange={(event) => updateField('order', event.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-black text-[#24140e]">
          <input
            type="checkbox"
            checked={lesson.isPublished}
            onChange={(event) => updateField('isPublished', event.target.checked)}
          />
          Published
        </label>
      </div>

      <div className="rounded-lg border border-orange-100 bg-white p-4">
        <p className="text-sm font-black text-[#24140e]">Resource links</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_150px_auto]">
          <input
            className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold text-[#6f5f57]"
            placeholder="Title"
            value={resourceDraft.title}
            onChange={(event) =>
              setResourceDraft((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
          />
          <input
            className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold text-[#6f5f57]"
            placeholder="URL"
            value={resourceDraft.url}
            onChange={(event) =>
              setResourceDraft((current) => ({
                ...current,
                url: event.target.value,
              }))
            }
          />
          <select
            className="rounded-md border border-orange-100 px-3 py-2 text-sm font-bold text-[#6f5f57]"
            value={resourceDraft.type}
            onChange={(event) =>
              setResourceDraft((current) => ({
                ...current,
                type: event.target.value,
              }))
            }
          >
            {RESOURCE_TYPE_OPTIONS.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded-md border border-orange-100 px-3 py-2 text-sm font-black text-[#f26322]"
            onClick={addResource}
          >
            Add
          </button>
        </div>
        <div className="mt-3 grid gap-2">
          {(lesson.resourceLinks ?? []).map((resource, index) => (
            <div
              key={`${resource.title}-${resource.url}`}
              className="flex items-center justify-between rounded-md bg-[#fff8f3] px-3 py-2 text-sm font-bold text-[#6f5f57]"
            >
              <span>
                {resource.title} · {resource.type}
              </span>
              <button
                type="button"
                className="text-red-700"
                onClick={() => removeResource(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="min-h-10 rounded-md bg-[#f26322] px-4 text-sm font-black text-white"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Lesson'}
        </button>
        {onCancel ? (
          <button
            type="button"
            className="min-h-10 rounded-md border border-orange-100 px-4 text-sm font-black text-[#f26322]"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}
