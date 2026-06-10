import { cn } from '../../lib/cn'

const tones = {
  default: 'border-transparent bg-slate-100 text-slate-700',
  primary: 'border-transparent bg-indigo-50 text-indigo-700',
  success: 'border-transparent bg-emerald-50 text-emerald-700',
  warning: 'border-transparent bg-amber-50 text-amber-800',
  danger: 'border-transparent bg-red-50 text-red-700',
  info: 'border-transparent bg-sky-50 text-sky-700',
  purple: 'border-transparent bg-purple-50 text-purple-700',
  outline: 'border-slate-200 bg-white text-slate-700',
}

export function Badge({ children, tone = 'default', variant, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        tones[variant] || tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export default Badge
