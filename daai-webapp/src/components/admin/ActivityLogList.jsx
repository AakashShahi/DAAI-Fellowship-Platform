import { Clock, User } from 'lucide-react'

const ACTION_CONFIG = {
  STAFF_CREATED: {
    label: 'Created',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  STAFF_UPDATED: {
    label: 'Updated',
    color: 'text-sky-600 bg-sky-50 border-sky-200',
  },
  STAFF_ACTIVATED: {
    label: 'Activated',
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  STAFF_DEACTIVATED: {
    label: 'Deactivated',
    color: 'text-red-600 bg-red-50 border-red-200',
  },
  STAFF_ROLE_CHANGED: {
    label: 'Role Changed',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  STAFF_PASSWORD_RESET: {
    label: 'Password Reset',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ActivityLogItem({ log }) {
  const config = ACTION_CONFIG[log.action] ?? {
    label: log.action,
    color: 'text-slate-600 bg-slate-50 border-slate-200',
  }

  return (
    <div className="flex gap-3 rounded-lg border border-slate-100 bg-white p-3 transition hover:border-slate-200 hover:shadow-sm">
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${config.color}`}
      >
        <User className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${config.color}`}
          >
            {config.label}
          </span>
          <span className="text-xs font-medium text-slate-500">
            by {log.actor_name}
          </span>
        </div>
        {log.description ? (
          <p className="mt-1 text-sm text-slate-600">{log.description}</p>
        ) : null}
        <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
          <Clock className="h-3 w-3" />
          {formatDate(log.created_at)}
        </div>
      </div>
    </div>
  )
}

export default function ActivityLogList({ logs, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg border border-slate-100 bg-slate-50"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
        {error}
      </p>
    )
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center">
        <p className="text-sm font-semibold text-slate-500">
          No activity logs yet
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <ActivityLogItem key={log.id} log={log} />
      ))}
    </div>
  )
}
