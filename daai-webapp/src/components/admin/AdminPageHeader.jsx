import Card from '../ui/Card'

export default function AdminPageHeader({
  label,
  title,
  description,
  actions,
  children,
}) {
  return (
    <Card className="mb-6 rounded-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-indigo-600">
            {label}
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">{title}</h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm font-medium text-slate-600">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </Card>
  )
}
