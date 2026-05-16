import { Link } from 'react-router-dom'
import ProgressBar from './ProgressBar'

export default function ModuleCard({ module }) {
  return (
    <Link
      to={`/fellow/learning/${module.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
        Module {module.order}
      </p>
      <h2 className="mt-2 text-xl font-bold text-slate-900">{module.title}</h2>
      <p className="mt-2 text-sm text-slate-600">
        {module.description}
      </p>
      <div className="mt-4">
        <ProgressBar value={module.completionPercentage} />
        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          {module.completedLessonCount} / {module.lessonCount} lessons complete
        </p>
      </div>
    </Link>
  )
}
