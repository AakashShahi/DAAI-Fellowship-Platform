import { cn } from '../../lib/cn'

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'flex min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  )
}

export default Textarea
