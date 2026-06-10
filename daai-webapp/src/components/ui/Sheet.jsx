/* eslint-disable react-refresh/only-export-components */
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close

export function SheetContent({ className, children, side = 'left', ...props }) {
  const sideClasses = {
    left: 'inset-y-0 left-0 h-full w-72 border-r',
    right: 'inset-y-0 right-0 h-full w-72 border-l',
  }

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden" />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 bg-white p-0 shadow-xl transition ease-in-out lg:hidden',
          sideClasses[side],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1 text-slate-500 hover:bg-slate-100">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function SheetHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-2 p-6', className)} {...props} />
}

export function SheetTitle({ className, ...props }) {
  return <DialogPrimitive.Title className={cn('text-lg font-semibold text-slate-900', className)} {...props} />
}
