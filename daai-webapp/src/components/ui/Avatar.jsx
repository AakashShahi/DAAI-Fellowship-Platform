import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '../../lib/cn'

export function Avatar({ className, ...props }) {
  return (
    <AvatarPrimitive.Root
      className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  )
}

export function AvatarImage({ className, ...props }) {
  return (
    <AvatarPrimitive.Image
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  )
}

export function AvatarFallback({ className, ...props }) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700',
        className,
      )}
      {...props}
    />
  )
}
