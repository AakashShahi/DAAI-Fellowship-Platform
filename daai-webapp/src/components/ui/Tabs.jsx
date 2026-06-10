import { cn } from '../../lib/cn'

export function Tabs({ className, ...props }) {
  return <div className={cn('w-full', className)} {...props} />
}

export function TabsList({ className, ...props }) {
  return (
    <div
      className={cn('inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1', className)}
      {...props}
    />
  )
}

export function TabsTrigger({ className, active, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-all hover:text-slate-900',
        active && 'bg-white text-slate-950 shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }) {
  return <div className={cn('mt-4', className)} {...props} />
}
