import { Link } from 'react-router-dom'
import ProgressBar from './ProgressBar'

export default function ModuleCard({ module }) {
  return (
    <Link
      to={`/fellow/learning/${module.id}`}
      className="block rounded-lg border border-orange-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)] transition hover:-translate-y-0.5 hover:border-[#ffb088]"
    >
      <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
        Module {module.order}
      </p>
      <h2 className="mt-2 text-xl font-black text-[#24140e]">{module.title}</h2>
      <p className="mt-2 text-sm font-medium text-[#6f5f57]">
        {module.description}
      </p>
      <div className="mt-4">
        <ProgressBar value={module.completionPercentage} />
        <p className="mt-2 text-xs font-black uppercase tracking-wide text-[#6f5f57]">
          {module.completedLessonCount} / {module.lessonCount} lessons complete
        </p>
      </div>
    </Link>
  )
}
