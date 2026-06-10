import { cn } from '../../lib/cn'

export function Input({ label, id, className, error, ...props }) {
  const inputId = id || props.name

  return (
    <label className="block">
      {label ? (
        <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      ) : null}
      <input
        id={inputId}
        className={cn(
          'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  )
}

export default Input
