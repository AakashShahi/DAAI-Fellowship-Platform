import Button from './Button'

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  icon,
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
      {icon ? <div className="mb-4 text-3xl">{icon}</div> : null}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{description}</p>
      ) : null}
      {actionLabel && actionTo ? (
        <div className="mt-6">
          <Button to={actionTo} size="md">
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
