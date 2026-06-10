import { Loader2, RefreshCcw } from 'lucide-react'
import Button from '../ui/Button'

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-10 text-sm font-semibold text-slate-500">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {message}
    </div>
  )
}

export function ErrorState({ message = 'Failed to load data.', onRetry }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-semibold">{message}</span>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="border-red-200 text-red-700 hover:bg-red-100">
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      ) : null}
    </div>
  )
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
      <p className="text-sm font-black text-slate-900">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}
