import { cn } from '../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  noPadding?: boolean
}

export function Card({ className, children, interactive, noPadding, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl bg-m3-surface border border-m3-border/20 shadow-sm overflow-hidden transition-all duration-200',
        interactive && 'hover:bg-m3-hover cursor-pointer active:scale-[0.995]',
        noPadding ? 'p-0' : 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
