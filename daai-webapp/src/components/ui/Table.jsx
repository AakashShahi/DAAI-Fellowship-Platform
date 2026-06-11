import { cn } from '../../lib/cn'

export function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  )
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn('[&_tr]:border-b', className)} {...props} />
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
}

export function TableRow({ className, ...props }) {
  return <tr className={cn('border-b border-slate-100 transition-colors hover:bg-slate-50', className)} {...props} />
}

export function TableHead({ className, ...props }) {
  return <th className={cn('h-11 px-3 text-left align-middle font-semibold text-slate-500', className)} {...props} />
}

export function TableCell({ className, ...props }) {
  return <td className={cn('px-3 py-3 align-middle text-slate-700', className)} {...props} />
}
