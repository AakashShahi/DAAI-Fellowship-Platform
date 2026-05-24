import Card from '../ui/Card'

export default function AdminPageHeader({
  label,
  title,
  description,
  actions,
  children,
  compact = false,
}) {
  return (
    <Card className={compact ? 'mb-5 rounded-xl p-4 sm:p-5' : 'mb-6 rounded-xl'}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-indigo-600">
            {label}
          </p>
          <h1 className={compact ? 'mt-1 text-2xl font-black leading-tight text-slate-900' : 'mt-2 text-3xl font-black text-slate-900'}>
            {title}
          </h1>
          {description ? (
            <p className={compact ? 'mt-2 max-w-2xl text-sm font-medium text-slate-600' : 'mt-3 max-w-2xl text-sm font-medium text-slate-600'}>
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children ? <div className={compact ? 'mt-4' : 'mt-5'}>{children}</div> : null}
    </Card>
  )
}
