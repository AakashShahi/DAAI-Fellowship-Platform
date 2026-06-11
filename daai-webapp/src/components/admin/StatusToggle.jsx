import { Loader2 } from 'lucide-react'

export default function StatusToggle({ isActive, isLoading, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      disabled={isLoading}
      onClick={() => onToggle(!isActive)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
        border-2 border-transparent transition-colors duration-200
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
        disabled:cursor-not-allowed disabled:opacity-50
        ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}
      `}
    >
      <span
        className={`
          pointer-events-none inline-flex h-5 w-5 items-center justify-center rounded-full bg-white
          shadow-sm ring-0 transition-transform duration-200
          ${isActive ? 'translate-x-5' : 'translate-x-0'}
        `}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
        ) : null}
      </span>
    </button>
  )
}
