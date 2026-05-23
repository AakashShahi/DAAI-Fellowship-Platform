import { Link } from 'react-router-dom'

export default function LessonList({ moduleId, lessons }) {
  if (!lessons.length) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold text-[#475569]">
        No published lessons in this module yet.
      </p>
    )
  }

  return (
    <div className="grid gap-3">
      {lessons.map((lesson) => (
        <Link
          key={lesson.id}
          to={`/fellow/learning/${moduleId}/lessons/${lesson.id}`}
          className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#c7d2fe] sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">
              Lesson {lesson.order}
            </p>
            <h3 className="mt-1 font-black text-[#0f172a]">{lesson.title}</h3>
            <p className="mt-1 text-sm font-medium text-[#475569]">
              {lesson.description}
            </p>
          </div>
          <span
            className={[
              'rounded-full px-3 py-1 text-xs font-black',
              lesson.completed
                ? 'bg-green-50 text-green-700'
                : 'bg-[#eef2ff] text-[#4f46e5]',
            ].join(' ')}
          >
            {lesson.completed ? 'Completed' : lesson.progressStatus}
          </span>
        </Link>
      ))}
    </div>
  )
}
