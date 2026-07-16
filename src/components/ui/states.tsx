import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Loading({ label = 'Cargando…', className = '' }: { label?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm ${className}`}>
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
  className = '',
}: {
  message: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-8 text-center ${className}`}>
      <AlertTriangle size={20} className="text-red-500" />
      <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}

export function EmptyState({ message, className = '' }: { message: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center py-8 text-sm text-muted-foreground ${className}`}>
      {message}
    </div>
  )
}
