import Card from './Card'
import { cn } from '../../lib/cn'

export default function FormCard({ title, description, children, className, footer }) {
  return (
    <Card className={cn('max-w-2xl', className)}>
      {title ? <h2 className="text-lg font-semibold text-slate-900">{title}</h2> : null}
      {description ? (
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      ) : null}
      <div className={cn(title || description ? 'mt-5' : '')}>{children}</div>
      {footer ? <div className="mt-6 border-t border-slate-100 pt-4">{footer}</div> : null}
    </Card>
  )
}
