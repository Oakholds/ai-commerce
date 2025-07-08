'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
} from 'lucide-react'

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'destructive'
  autoDismiss?: boolean
  dismissAfter?: number // milliseconds
  onDismiss?: () => void
}

const variantStyles = {
  default: 'bg-gray-50 text-gray-800 border border-gray-200',
  info: 'bg-blue-50 text-blue-800 border border-blue-200',
  success: 'bg-green-50 text-green-800 border border-green-200',
  warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  destructive: 'bg-red-50 text-red-800 border border-red-200',
}

const variantIcons = {
  default: Info,
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  destructive: XCircle,
}

export const Alert = ({
  className,
  variant = 'default',
  children,
  autoDismiss = false,
  dismissAfter = 5000,
  onDismiss,
  ...props
}: AlertProps) => {
  const [visible, setVisible] = React.useState(true)

  const handleClose = () => {
    setVisible(false)
    onDismiss?.()
  }

  React.useEffect(() => {
    if (autoDismiss) {
      const timeout = setTimeout(handleClose, dismissAfter)
      return () => clearTimeout(timeout)
    }
  }, [autoDismiss, dismissAfter])

  if (!visible) return null

  const Icon = variantIcons[variant]

  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-lg p-4 text-sm flex items-start gap-3 animate-in fade-in shadow-sm transition-opacity duration-300',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <Icon className="h-5 w-5 mt-0.5 shrink-0" />
      <div className="flex-1">{children}</div>

      <button
        onClick={handleClose}
        className="absolute right-2 top-2 text-muted-foreground hover:text-foreground transition"
        aria-label="Close"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  )
}

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
AlertDescription.displayName = 'AlertDescription'
