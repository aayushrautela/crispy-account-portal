import { cn } from '../lib/utils'

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-xl border border-stone-800 bg-stone-900/50 p-6', className)} {...props}>
      {children}
    </div>
  )
}
