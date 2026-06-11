import { cn } from '../../lib/cn'

export function Card({ children, className, padding = true, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-100 bg-white text-slate-950 shadow-sm',
        padding && 'p-6',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn('text-lg font-semibold leading-none tracking-normal text-slate-900', className)}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-slate-500', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-6 pt-0', className)} {...props} />
}

export function CardFooter({ className, ...props }) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
}

export default Card
