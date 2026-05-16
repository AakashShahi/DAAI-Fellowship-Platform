import { cn } from '../../lib/cn'

export default function ProgressBar({ value = 0, className, label }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0))

  return (
    <div className={cn('w-full', className)}>
      {label ? (
        <div className="mb-1 flex justify-between text-xs font-medium text-slate-600">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
