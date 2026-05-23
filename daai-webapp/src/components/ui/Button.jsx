import { Link } from 'react-router-dom'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '../../lib/cn'

const variants = {
  primary:
    'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700',
  default:
    'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700',
  secondary:
    'border border-slate-200 bg-white text-indigo-700 hover:bg-slate-50',
  outline:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900',
  ghost: 'text-slate-700 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'h-10 w-10 p-0',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  to,
  href,
  type = 'button',
  disabled,
  asChild = false,
  ...props
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    sizes[size],
    className,
  )

  if (asChild) {
    const Comp = Slot
    return (
      <Comp className={classes} {...props}>
        {children}
      </Comp>
    )
  }

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  )
}
